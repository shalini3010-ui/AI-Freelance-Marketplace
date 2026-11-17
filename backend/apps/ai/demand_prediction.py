from database import db

def predict_service_demand(category: str) -> dict:
    """Analyzes recent booking trends to forecast service demand levels."""
    recent_count = db.bookings.count_documents({"category": category})
    
    if recent_count > 20:
        demand_level = "High"
    elif recent_count > 5:
        demand_level = "Moderate"
    else:
        demand_level = "Low"

    return {
        "category": category,
        "recent_bookings": recent_count,
        "forecasted_demand": demand_level
    }