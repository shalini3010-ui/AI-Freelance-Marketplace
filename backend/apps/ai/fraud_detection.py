from database import db

def check_account_fraud_risk(user_id: str) -> dict:
    """Analyzes user activity for suspicious behavior flags."""
    cancellations = db.bookings.count_documents({"user_id": user_id, "status": "Cancelled"})
    complaints = db.complaints.count_documents({"against_user_id": user_id})

    risk_score = (cancellations * 10) + (complaints * 25)
    is_suspicious = risk_score > 50

    return {
        "user_id": user_id,
        "risk_score": risk_score,
        "is_flagged": is_suspicious,
        "reason": "High cancellation or complaint count" if is_suspicious else "Normal activity"
    }