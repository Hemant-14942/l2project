from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = "eduvoice_ai"

client: AsyncIOMotorClient | None = None
db: AsyncIOMotorDatabase | None = None

app = FastAPI()

@app.on_event("startup")
async def connect_db():
    global client, db
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]
    print("✅ MongoDB Connected")

@app.on_event("shutdown")
async def close_db():
    client.close()
    print("🛑 MongoDB Connection Closed")
