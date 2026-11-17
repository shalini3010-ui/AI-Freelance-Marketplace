import logging
from pymongo import MongoClient
from config import settings

logger = logging.getLogger("uvicorn.error")

try:
    client = MongoClient(settings.MONGO_URI, serverSelectionTimeoutMS=2000, connectTimeoutMS=2000)
    db = client[settings.MONGO_DB_NAME]
    logger.info(f"Connected to MongoDB: {settings.MONGO_DB_NAME}")
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {e}")
    client = None
    db = None

def init_db_indexes():
    """
    Sets up required MongoDB indexes for fast lookup, geo-queries, and auto-deletion.
    """
    if db is None:
        logger.warning("MongoDB not connected. Skipping index creation.")
        return

    try:
        # 1. User Email Unique Index
        db.users.create_index("email", unique=True)
        
        # 2. GeoJSON 2dsphere index for finding nearby Handymen on Google Maps
        db.users.create_index([("handyman_profile.location", "2dsphere")])

        # 3. Auto-delete expired OTPs (TTL Index)
        db.otp_verifications.create_index("expires_at", expireAfterSeconds=0)

        # 4. Booking Lookups
        db.bookings.create_index("user_id")
        db.bookings.create_index("handyman_id")

        logger.info("MongoDB indexes verified and created successfully.")
    except Exception as e:
        logger.warning(f"Error creating MongoDB indexes: {e}")
