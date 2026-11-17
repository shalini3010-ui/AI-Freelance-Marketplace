import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import settings
from database import init_db_indexes

# Import Routers
from apps.authentication.routes import router as auth_router
from apps.users.routes import router as user_router
from apps.handyman.routes import router as handyman_router
from apps.services.routes import router as services_router
from apps.bookings.routes import router as bookings_router
from apps.payments.routes import router as payments_router
from apps.reviews.routes import router as reviews_router
from apps.complaints.routes import router as complaints_router
from apps.notifications.routes import router as notifications_router
from apps.analytics.routes import router as analytics_router
from apps.adminpanel.routes import router as admin_router
from apps.maps.location import router as maps_router
from apps.ai.routes import router as ai_router


# Async Lifespan Handler for DB index creation & cleanup
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Safe startup initialization inside process lifespan
    try:
        import inspect
        if inspect.iscoroutinefunction(init_db_indexes):
            await init_db_indexes()
        else:
            init_db_indexes()
        print("Database indexes successfully initialized.")
    except Exception as e:
        print(f"Warning: Database index initialization error: {e}")
    
    yield


# Initialize FastAPI Instance
app = FastAPI(
    title=getattr(settings, "APP_NAME", "FixIt.ai API"),
    version="1.0.0",
    description="Backend API for FixIt.ai - Multi-role marketplace (User, Handyman, Admin)",
    lifespan=lifespan,
)

# Comprehensive CORS Configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"^http://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Ensure media directory exists before mounting static files
os.makedirs("media", exist_ok=True)
app.mount("/media", StaticFiles(directory="media"), name="media")


# Health Check Route
@app.get("/", tags=["Health"], status_code=status.HTTP_200_OK)
async def health_check():
    return {
        "status": "online",
        "app": getattr(settings, "APP_NAME", "FixIt.ai"),
        "database": getattr(settings, "MONGO_DB_NAME", "connected"),
        "version": "1.0.0",
    }


# =====================================================================
# ROUTER REGISTRATIONS
# =====================================================================
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])

# Registered both singular (/api/user) and plural (/api/users) prefixes to prevent 404s
app.include_router(user_router, prefix="/api/user", tags=["User Profile"])
app.include_router(user_router, prefix="/api/users", tags=["Users Profile"])

app.include_router(handyman_router, prefix="/api/handyman", tags=["Handyman Portal"])
app.include_router(services_router, prefix="/api/services", tags=["Services Catalog"])

app.include_router(bookings_router, prefix="/api/bookings", tags=["Bookings"])
app.include_router(bookings_router, prefix="/api/user/bookings", tags=["User Bookings"])

app.include_router(payments_router, prefix="/api/payments", tags=["Payments and Invoice"])
app.include_router(payments_router, prefix="/api/user", tags=["User Payments & Invoices"])
app.include_router(payments_router, prefix="/api", tags=["Global Payments Direct"])

app.include_router(reviews_router, prefix="/api/reviews", tags=["Reviews & Ratings"])
app.include_router(reviews_router, prefix="/api/services", tags=["Services Reviews"])
app.include_router(reviews_router, prefix="/api/feedback", tags=["Feedback Management"])

app.include_router(complaints_router, prefix="/api/complaints", tags=["Complaints & Disputes"])

app.include_router(notifications_router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(notifications_router, prefix="/api/user/notifications", tags=["User Notifications"])

app.include_router(analytics_router, prefix="/api/analytics", tags=["Analytics Engine"])
app.include_router(admin_router, prefix="/api/admin", tags=["Admin Portal"])
app.include_router(maps_router, prefix="/api", tags=["Maps & Geolocation"])
app.include_router(ai_router, prefix="/api/ai", tags=["AI & Chatbot"])
app.include_router(ai_router, prefix="/api/chatbot", tags=["AI Chatbot Direct"])


# Entry point guard
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)