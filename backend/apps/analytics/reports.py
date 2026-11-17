import csv
import io
from database import db

def generate_csv_revenue_report() -> str:
    """Exports payment records to a CSV string."""
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Transaction ID", "User ID", "Booking ID", "Amount", "Payment Method", "Date"])

    cursor = db.payments.find({"status": "SUCCESS"})
    for tx in cursor:
        writer.writerow([
            str(tx["_id"]),
            tx.get("user_id", ""),
            tx.get("booking_id", ""),
            tx.get("amount", 0.0),
            tx.get("payment_method", ""),
            tx.get("created_at", "")
        ])

    return output.getvalue()