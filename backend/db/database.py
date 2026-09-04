import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


from dotenv import load_dotenv
load_dotenv()

# Use default credentials if not set in environment
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost/admind")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    connect_args={"sslmode": "require"},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
