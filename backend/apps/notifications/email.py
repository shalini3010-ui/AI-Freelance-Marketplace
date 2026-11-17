import logging

logger = logging.getLogger("uvicorn.error")

def send_email_notification(to_email: str, subject: str, body: str) -> bool:
    """Dispatches emails via SMTP / SendGrid integration."""
    try:
        # Mock Email Dispatcher
        logger.info(f"[EMAIL SENT] To: {to_email} | Subject: {subject}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        return False

def send_booking_confirmation_email(to_email: str, booking_details: dict) -> bool:
    """Sends structured email invoice/confirmation for new bookings."""
    subject = f"Booking Confirmation - {booking_details.get('serviceTitle', 'Service Request')}"
    body = (
        f"Hello,\n\n"
        f"Your booking has been received!\n"
        f"Service: {booking_details.get('serviceTitle')}\n"
        f"Scheduled Date & Time: {booking_details.get('date')} at {booking_details.get('time')}\n"
        f"Location: {booking_details.get('address')}\n"
        f"Estimated Total: ${booking_details.get('totalAmount')}\n\n"
        f"Thank you for choosing our service platform!"
    )
    return send_email_notification(to_email, subject, body)