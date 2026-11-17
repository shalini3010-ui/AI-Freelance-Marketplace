from database import db
from apps.analytics.revenue import calculate_revenue_metrics

def get_admin_dashboard_metrics() -> dict:
    """Aggregates high-level metrics across the platform."""
    total_users = db.users.count_documents({"role": "User"})
    total_handymen = db.users.count_documents({"role": "Handyman"})
    total_bookings = db.bookings.count_documents({})
    open_complaints = db.complaints.count_documents({"status": "Open"})
    
    revenue = calculate_revenue_metrics()

    return {
        "users_count": total_users,
        "handymen_count": total_handymen,
        "bookings_count": total_bookings,
        "open_complaints": open_complaints,
        "financials": revenue
    }