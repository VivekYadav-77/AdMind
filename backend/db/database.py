import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


# Use default credentials if not set in environment
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost/admind")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
