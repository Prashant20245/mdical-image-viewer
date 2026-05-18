import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get values from .env
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

# Connect to MongoDB Atlas
client = MongoClient(MONGO_URI)

# Database
db = client[DB_NAME]

# Collection
reports_collection = db["reports"]

print("MongoDB Atlas Connected Successfully!")