import os
from dotenv import load_dotenv

load_dotenv()

from db.database import engine, Base
from db.models import User, AnalysisJob

print("Dropping all tables...")
Base.metadata.drop_all(engine)
print("Creating all tables...")
Base.metadata.create_all(engine)
print("Done!")
