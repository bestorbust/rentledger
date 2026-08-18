from pymongo import AsyncMongoClient
from pymongo.server_api import ServerApi

from app.core.config import settings


client = AsyncMongoClient(
    settings.mongodb_uri,
    server_api=ServerApi(
        "1",
        strict=True,
        deprecation_errors=True,
    ),
)

database = client[settings.mongodb_database]


def get_database():
    return database


async def connect_to_database():
    await client.admin.command("ping")
    print("MongoDB connected successfully")


async def close_database_connection():
    await client.close()
    print("MongoDB connection closed")