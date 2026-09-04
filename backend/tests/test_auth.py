import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from main import app
from db.database import Base, get_db
from db.models import User, EmailToken
from auth import get_password_hash

from sqlalchemy.pool import StaticPool

# Setup in-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

from middleware.rate_limit import _request_log
from main import _verify_cooldown_store

@pytest.fixture(autouse=True)
def clean_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    _request_log.clear()
    _verify_cooldown_store.clear()
    yield

def test_1_new_registration_creates_pending_user():
    res = client.post("/register", json={"email": "new@example.com", "password": "pass", "name": "New"})
    assert res.status_code == 200
    assert "inbox" in res.json()["message"]
    
    db = TestingSessionLocal()
    user = db.query(User).filter(User.email == "new@example.com").first()
    assert user is not None
    assert user.is_verified == False
    db.close()

def test_2_verification_token_generated_and_hashed():
    client.post("/register", json={"email": "test@example.com", "password": "pass"})
    db = TestingSessionLocal()
    user = db.query(User).filter(User.email == "test@example.com").first()
    token = db.query(EmailToken).filter(EmailToken.user_id == user.id, EmailToken.token_type == "verify").first()
    assert token is not None
    assert token.used_at is None
    db.close()

def test_3_reregister_pending_reuses_identity():
    client.post("/register", json={"email": "pend@example.com", "password": "old"})
    client.post("/register", json={"email": "pend@example.com", "password": "new", "name": "Pend New"})
    
    db = TestingSessionLocal()
    users = db.query(User).filter(User.email == "pend@example.com").all()
    assert len(users) == 1
    assert users[0].name == "Pend New"
    db.close()

def test_4_reregister_pending_generates_fresh_token():
    client.post("/register", json={"email": "pend2@example.com", "password": "pass"})
    db = TestingSessionLocal()
    user = db.query(User).filter(User.email == "pend2@example.com").first()
    old_token = db.query(EmailToken).filter(EmailToken.user_id == user.id).first()
    
    client.post("/register", json={"email": "pend2@example.com", "password": "pass"})
    
    db = TestingSessionLocal()
    tokens = db.query(EmailToken).filter(EmailToken.user_id == user.id).order_by(EmailToken.created_at.desc()).all()
    assert len(tokens) == 2
    assert tokens[1].id == old_token.id
    assert tokens[1].used_at is not None # old token is invalidated
    assert tokens[0].used_at is None # new token is valid
    db.close()

def test_6_active_user_reregister_no_op():
    db = TestingSessionLocal()
    user = User(email="active@example.com", hashed_password=get_password_hash("pass"), is_verified=True)
    db.add(user)
    db.commit()
    db.close()
    
    res = client.post("/register", json={"email": "active@example.com", "password": "pass"})
    assert res.status_code == 200
    assert "inbox" in res.json()["message"]
    
    db = TestingSessionLocal()
    users = db.query(User).filter(User.email == "active@example.com").all()
    assert len(users) == 1
    tokens = db.query(EmailToken).filter(EmailToken.user_id == users[0].id).all()
    assert len(tokens) == 0 # no token generated
    db.close()

def test_7_pending_login_fails():
    client.post("/register", json={"email": "logp@example.com", "password": "pass"})
    res = client.post("/login", data={"username": "logp@example.com", "password": "pass"})
    assert res.status_code == 401
    assert res.json()["detail"] == "Incorrect email or password"
    assert res.headers.get("x-verification-required") == "true"

def test_8_active_login_succeeds():
    db = TestingSessionLocal()
    user = User(email="loga@example.com", hashed_password=get_password_hash("pass"), is_verified=True)
    db.add(user)
    db.commit()
    db.close()
    
    res = client.post("/login", data={"username": "loga@example.com", "password": "pass"})
    assert res.status_code == 200
    assert "access_token" in res.json()

def test_9_wrong_password_login():
    db = TestingSessionLocal()
    user = User(email="wrong@example.com", hashed_password=get_password_hash("pass"), is_verified=True)
    db.add(user)
    db.commit()
    db.close()
    
    res = client.post("/login", data={"username": "wrong@example.com", "password": "bad"})
    assert res.status_code == 401
    assert res.headers.get("x-verification-required") is None

def test_10_expired_token():
    db = TestingSessionLocal()
    user = User(email="exp@example.com", hashed_password="pw", is_verified=False)
    db.add(user)
    db.commit()
    token = EmailToken(user_id=user.id, token_hash="hash", token_type="verify", expires_at=datetime.utcnow() - timedelta(hours=1))
    db.add(token)
    db.commit()
    db.close()
    
    import hashlib
    # We can't actually hit the endpoint properly without the plain token unless we mock the hash. But we can test it directly.
    # The endpoint takes the plain token and hashes it. So we pass 'plain', the DB has sha256('plain').
    plain = "plain"
    db = TestingSessionLocal()
    token = db.query(EmailToken).first()
    token.token_hash = hashlib.sha256(plain.encode()).hexdigest()
    db.commit()
    db.close()
    
    res = client.get(f"/auth/verify-email?token={plain}")
    assert res.status_code == 400
    assert res.json()["detail"] == "Token expired"

def test_11_used_token():
    db = TestingSessionLocal()
    user = User(email="used@example.com", hashed_password="pw", is_verified=False)
    db.add(user)
    db.commit()
    import hashlib
    plain = "plain"
    token = EmailToken(user_id=user.id, token_hash=hashlib.sha256(plain.encode()).hexdigest(), token_type="verify", expires_at=datetime.utcnow() + timedelta(hours=1), used_at=datetime.utcnow())
    db.add(token)
    db.commit()
    db.close()
    
    res = client.get(f"/auth/verify-email?token={plain}")
    assert res.status_code == 400
    assert res.json()["detail"] == "Token already used"

def test_12_success_verify():
    db = TestingSessionLocal()
    user = User(email="ok@example.com", hashed_password="pw", is_verified=False)
    db.add(user)
    db.commit()
    import hashlib
    plain = "plain"
    token = EmailToken(user_id=user.id, token_hash=hashlib.sha256(plain.encode()).hexdigest(), token_type="verify", expires_at=datetime.utcnow() + timedelta(hours=1))
    db.add(token)
    token2 = EmailToken(user_id=user.id, token_hash="other", token_type="verify", expires_at=datetime.utcnow() + timedelta(hours=1))
    db.add(token2)
    db.commit()
    db.close()
    
    res = client.get(f"/auth/verify-email?token={plain}")
    assert res.status_code == 200
    
    db = TestingSessionLocal()
    user = db.query(User).filter(User.email == "ok@example.com").first()
    assert user.is_verified == True
    
    # Check that other tokens are invalidated
    other_token = db.query(EmailToken).filter(EmailToken.token_hash == "other").first()
    assert other_token.used_at is not None
    db.close()

def test_14_resend_verification():
    client.post("/register", json={"email": "resend@example.com", "password": "pass"})
    
    res = client.post("/auth/resend-verification", json={"email": "resend@example.com"})
    assert res.status_code == 200
    
    db = TestingSessionLocal()
    user = db.query(User).filter(User.email == "resend@example.com").first()
    tokens = db.query(EmailToken).filter(EmailToken.user_id == user.id).order_by(EmailToken.created_at.desc()).all()
    assert len(tokens) == 2
    assert tokens[1].used_at is not None # older token invalidated
    assert tokens[0].used_at is None # new token
    db.close()

def test_15_resend_active_user_no_op():
    db = TestingSessionLocal()
    user = User(email="resend_active@example.com", hashed_password="pw", is_verified=True)
    db.add(user)
    db.commit()
    db.close()
    
    res = client.post("/auth/resend-verification", json={"email": "resend_active@example.com"})
    assert res.status_code == 200 # returns generic success
    
    db = TestingSessionLocal()
    user = db.query(User).filter(User.email == "resend_active@example.com").first()
    tokens = db.query(EmailToken).filter(EmailToken.user_id == user.id).all()
    assert len(tokens) == 0 # no token created
    db.close()
