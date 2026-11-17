import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "FixIt.ai Backend API"
    DEBUG: bool = True

    # MongoDB Setup
    MONGO_URI: str = "mongodb://localhost:27017"
    MONGO_DB_NAME: str = "fixit_db"

    # JWT Authentication
    JWT_SECRET_KEY: str = "super-secret-jwt-key-fixit-ai-2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 Hours

    # CORS Allowed Origins (React Vite & Create React App defaults)
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    # Tells Pydantic to ignore any extra keys in .env (like GOOGLE_MAPS_API_KEY)
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()