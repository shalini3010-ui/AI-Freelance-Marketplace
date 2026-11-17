from datetime import datetime
from typing import Optional
from database import db
from bson import ObjectId

async def log_transaction(
    user_id: str, 
    booking_id: str, 
    amount: float, 
    method: str, 
    status: str = "SUCCESS",
    worker_name: Optional[str] = None,
    user_name: Optional[str] = None
) -> str:
    """Logs payment transactions into MongoDB."""
    txn_code = f"TXN-{int(datetime.utcnow().timestamp())}"
    
    # Try to look up names if not provided
    resolved_user = user_name
    if not resolved_user and ObjectId.is_valid(user_id):
        u_doc = db.users.find_one({"_id": ObjectId(user_id)})
        if u_doc:
            resolved_user = u_doc.get("name") or u_doc.get("full_name") or u_doc.get("email")

    doc = {
        "transaction_id": txn_code,
        "user_id": str(user_id),
        "user_name": resolved_user or "Valued Customer",
        "worker_name": worker_name or "Shalini Mahadeva",
        "booking_id": str(booking_id),
        "amount": float(amount),
        "method": method,
        "payment_method": method,
        "status": status,
        "date": datetime.utcnow().strftime("%Y-%m-%d"),
        "created_at": datetime.utcnow()
    }
    
    if hasattr(db.payments, "insert_one"):
        res = db.payments.insert_one(doc)
        if hasattr(res, "__await__"):
            res = await res
        return txn_code
        
    return txn_code