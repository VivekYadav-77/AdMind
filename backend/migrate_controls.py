import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./admind.db")
is_postgres = DATABASE_URL.startswith("postgres")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

def run_migration():
    print(f"Connecting to database at {DATABASE_URL}...")
    with engine.connect() as conn:
        # Create user_feature_controls table if it doesn't exist
        print("Creating user_feature_controls table...")
        
        id_col = "id SERIAL PRIMARY KEY" if is_postgres else "id INTEGER PRIMARY KEY AUTOINCREMENT"
        bool_default = "false" if is_postgres else "0"
        
        datetime_col = "TIMESTAMP" if is_postgres else "DATETIME"
        
        conn.execute(text(f"""
            CREATE TABLE IF NOT EXISTS user_feature_controls (
                {id_col},
                user_id INTEGER NOT NULL,
                feature VARCHAR NOT NULL,
                is_blocked BOOLEAN DEFAULT {bool_default},
                reason VARCHAR,
                updated_at {datetime_col} DEFAULT CURRENT_TIMESTAMP,
                updated_by INTEGER,
                FOREIGN KEY(user_id) REFERENCES users(id),
                FOREIGN KEY(updated_by) REFERENCES users(id)
            )
        """))
        
        # Add index for user_id and feature
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS ix_user_feature_controls_user_id ON user_feature_controls (user_id)
        """))

        # Add login_blocked to users
        print("Adding login_blocked to users table...")
        try:
            conn.execute(text(f"ALTER TABLE users ADD COLUMN login_blocked BOOLEAN DEFAULT {bool_default}"))
            print("login_blocked column added.")
        except Exception as e:
            if "duplicate column" in str(e).lower() or "already exists" in str(e).lower():
                print("login_blocked column already exists.")
            else:
                print(f"Warning: {e}")
                # For postgres, rollback might be needed if transaction aborted
                if is_postgres:
                    conn.rollback()

        # Add email_blocked to users
        print("Adding email_blocked to users table...")
        try:
            conn.execute(text(f"ALTER TABLE users ADD COLUMN email_blocked BOOLEAN DEFAULT {bool_default}"))
            print("email_blocked column added.")
        except Exception as e:
            if "duplicate column" in str(e).lower() or "already exists" in str(e).lower():
                print("email_blocked column already exists.")
            else:
                print(f"Warning: {e}")

        conn.commit()
    print("Migration complete!")

if __name__ == "__main__":
    run_migration()

