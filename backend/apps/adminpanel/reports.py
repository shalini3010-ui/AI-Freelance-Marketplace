from datetime import datetime
from database import db

def log_admin_action(admin_id: str, action_type: str, details: str) -> str:
    """Logs system audit events for governance and compliance."""
    log_doc = {
        "admin_id": admin_id,
        "action_type": action_type,
        "details": details,
        "timestamp": datetime.utcnow()
    }
    res = db.audit_logs.insert_one(log_doc)
    return str(res.inserted_id)

def get_recent_audit_logs(limit: int = 50) -> list[dict]:
    """Fetches recent administrative audit logs."""
    cursor = db.audit_logs.find().sort("timestamp", -1).limit(limit)
    logs = []
    for log in cursor:
        log["_id"] = str(log["_id"])
        logs.append(log)
    return logs