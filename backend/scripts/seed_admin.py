import asyncio
import os
from dotenv import load_dotenv
load_dotenv()

from db.database import SessionLocal, Base, engine
from db.models import User, Workspace, WorkspaceMember
from auth import get_password_hash

def seed_admin():
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        email = os.getenv("ADMIN_EMAIL")
        password = os.getenv("ADMIN_PASSWORD")
        if not email or not password:
            raise RuntimeError("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env")
        
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"Creating superadmin user: {email}")
            hashed_password = get_password_hash(password)
            user = User(
                email=email,
                hashed_password=hashed_password,
                is_superadmin=True,
                is_banned=False,
                is_verified=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            
            # Create a default workspace for the admin
            ws = Workspace(name="Admin Workspace", owner_id=user.id)
            db.add(ws)
            db.commit()
            db.refresh(ws)
            
            ws_member = WorkspaceMember(workspace_id=ws.id, user_id=user.id, role="admin")
            db.add(ws_member)
            db.commit()
            print("Superadmin created successfully.")
        else:
            print(f"User {email} already exists. Updating to superadmin.")
            user.is_superadmin = True
            db.commit()
            print("Superadmin privileges granted.")
            
    except Exception as e:
        print(f"Error seeding admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()
