from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

try:
    client = MongoClient(
        MONGO_URI,
        tls=True,
        tlsAllowInvalidCertificates=True
    )

    client.admin.command("ping")
    print("MongoDB Connected Successfully")

except Exception as e:
    print("MongoDB Connection Failed:", e)

db = client["task"]

users_collection = db["users"]
tasks_collection = db["tasks"]
