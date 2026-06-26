import sys
import os
from dotenv import load_dotenv

load_dotenv()

# Ensure backend dir is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from db.database import engine, Base
from sqlalchemy import text
from db.models import *  # import all models to ensure they are registered with Base

def migrate():
    # 1. Create new tables (workspaces, workspace_members, chat_messages)
    print("Creating new tables...")
    Base.metadata.create_all(bind=engine)
    
    # 2. Add columns to analysis_jobs if they don't exist
    print("Altering analysis_jobs table...")
    with engine.begin() as conn:  # engine.begin() automatically handles transaction/rollback
        try:
            conn.execute(text("ALTER TABLE analysis_jobs ADD COLUMN workspace_id INTEGER REFERENCES workspaces(id);"))
            print("Added workspace_id")
        except Exception as e:
            print("workspace_id might already exist")
            
        try:
            conn.execute(text("ALTER TABLE analysis_jobs ADD COLUMN progress_logs JSON;"))
            print("Added progress_logs")
        except Exception as e:
            print("progress_logs might already exist")
            
        try:
            conn.execute(text("ALTER TABLE analysis_jobs ADD COLUMN error_message VARCHAR;"))
            print("Added error_message")
        except Exception as e:
            print("error_message might already exist")

    print("Migration complete.")

if __name__ == "__main__":
    migrate()
