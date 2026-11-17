from datetime import datetime
from database import db
from bson import ObjectId

async def process_refund(transaction_id: str, reason: str) -> dict:
    """Processes refund logic for given payment transaction ID."""
    try:
        query_id = ObjectId(transaction_id) if len(transaction_id) == 24 else transaction_id
        
        tx = db.payments.find_one({"_id": query_id})
        if hasattr(tx, "__await__"):
            tx = await tx
            
        if not tx:
            return {"success": False, "message": "Transaction record not found"}

        res = db.payments.update_one(
            {"_id": query_id},
            {"$set": {"status": "REFUNDED", "refund_reason": reason, "refunded_at": datetime.utcnow()}}
        )
        if hasattr(res, "__await__"):
            await res

        return {"success": True, "message": "Refund processed successfully"}
    except Exception as e:
        return {"success": False, "message": f"Refund processing failed: {str(e)}"}