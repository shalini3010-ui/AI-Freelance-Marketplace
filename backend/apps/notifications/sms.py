import logging

logger = logging.getLogger("uvicorn.error")

def send_sms_notification(phone_number: str, message: str) -> bool:
    """Dispatches SMS via Twilio / SMS Gateway integration."""
    try:
        # Mock SMS Dispatcher
        logger.info(f"[SMS SENT] To: {phone_number} | Message: {message}")
        return True
    except Exception as e:
        logger.error(f"Failed to send SMS: {e}")
        return False

def send_dispatch_status_sms(phone_number: str, service_title: str, status: str) -> bool:
    """Short SMS alert for dispatch status changes."""
    message = f"Service Update: Your booking for '{service_title}' is now '{status}'."
    return send_sms_notification(phone_number, message)