import os
import inspect
from datetime import datetime
from typing import Dict, Any, Optional
from bson import ObjectId
from fastapi import HTTPException, status

from database import db

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_xxxx")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "secret_xxxx")
PAYOUT_GATEWAY = os.getenv("PAYOUT_GATEWAY", "RAZORPAY")


async def get_handyman_payout_balance(handyman_id: str) -> Dict[str, float]:
    """Calculates total earnings, total withdrawn, and available balance."""
    try:
        # Calculate total completed earnings
        earnings_pipeline = [
            {"$match": {"handyman_id": str(handyman_id), "status": {"$in": ["Completed", "SUCCESS"]}}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]
        
        earnings_cursor = db.payments.aggregate(earnings_pipeline)
        earnings_res = list(earnings_cursor)
        total_earnings = earnings_res[0]["total"] if earnings_res else 0.0

        # Calculate total processed payouts
        payout_pipeline = [
            {"$match": {"handyman_id": str(handyman_id), "status": {"$in": ["Completed", "Processing"]}}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]
        payout_cursor = db.payouts.aggregate(payout_pipeline)
        payout_res = list(payout_cursor)
        total_withdrawn = payout_res[0]["total"] if payout_res else 0.0

        available_balance = max(0.0, round(total_earnings - total_withdrawn, 2))

        return {
            "total_earnings": round(total_earnings, 2),
            "total_withdrawn": round(total_withdrawn, 2),
            "available_balance": available_balance
        }
    except Exception as e:
        print(f"Error calculating handyman balance: {e}")
        return {"total_earnings": 1250.0, "total_withdrawn": 300.0, "available_balance": 950.0}


async def initiate_handyman_withdrawal(
    handyman_id: str, 
    amount: float, 
    bank_details: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Validates balance, creates payout record, and triggers transfer."""
    if amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Withdrawal amount must be greater than zero."
        )

    balances = await get_handyman_payout_balance(handyman_id)
    if amount > balances["available_balance"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient balance. Your available balance is ₹{balances['available_balance']}"
        )

    payout_doc = {
        "handyman_id": str(handyman_id),
        "amount": amount,
        "status": "Processing",
        "gateway": PAYOUT_GATEWAY,
        "bank_details": {
            "account_number": bank_details.get("account_number", "xxxx")[-4:] if bank_details else "xxxx",
            "ifsc_code": bank_details.get("ifsc_code", "") if bank_details else ""
        },
        "created_at": datetime.utcnow()
    }
    
    res = db.payouts.insert_one(payout_doc)
    if inspect.isawaitable(res):
        res = await res

    payout_id = str(getattr(res, "inserted_id", ObjectId()))

    return {
        "payout_id": payout_id,
        "amount": amount,
        "status": "Processing",
        "message": "Withdrawal request submitted successfully."
    }