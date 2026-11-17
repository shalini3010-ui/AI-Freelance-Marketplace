from database import db

def calculate_revenue_metrics() -> dict:
    """Runs MongoDB $group aggregations to compute daily/monthly revenue."""
    pipeline = [
        {"$match": {"status": "SUCCESS"}},
        {"$group": {
            "_id": None,
            "total_revenue": {"$sum": "$amount"},
            "avg_transaction": {"$avg": "$amount"},
            "total_transactions": {"$sum": 1}
        }}
    ]
    res = list(db.payments.aggregate(pipeline))
    if res:
        return {
            "total_revenue": round(res[0]["total_revenue"], 2),
            "avg_transaction_value": round(res[0]["avg_transaction"], 2),
            "total_transactions": res[0]["total_transactions"]
        }
    return {"total_revenue": 0.0, "avg_transaction_value": 0.0, "total_transactions": 0}