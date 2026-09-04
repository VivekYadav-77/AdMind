import sys
import os
from dotenv import load_dotenv

load_dotenv()

# Ensure backend dir is in path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.database import engine
from sqlalchemy import text

def migrate():
    print("Altering analysis_jobs table...")
    with engine.begin() as conn:
        try:
            conn.execute(text("ALTER TABLE analysis_jobs ADD COLUMN name VARCHAR;"))
            print("Added name column to analysis_jobs")
        except Exception as e:
            print("name column might already exist on analysis_jobs:", e)
            
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
