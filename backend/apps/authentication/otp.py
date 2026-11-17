import random
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, status
from database import db
from apps.authentication.schemas import OTPRequestSchema, OTPVerifySchema, ResetPasswordSchema
from apps.authentication.utils import hash_password

router = APIRouter(prefix="/auth", tags=["OTP & Password Reset"])


def get_utc_now():
    return datetime.now(timezone.utc)


@router.post("/send-otp")
@router.post("/forgot-password")
def send_otp(payload: OTPRequestSchema):
    """Generates a 6-digit OTP code and saves it to MongoDB."""
    clean_email = payload.email.lower().strip()
    otp_code = f"{random.randint(100000, 999999)}"
    expires_at = get_utc_now() + timedelta(minutes=10)

    db.otp_verifications.update_one(
        {"email": clean_email},
        {"$set": {"otp_code": otp_code, "expires_at": expires_at, "is_used": False}},
        upsert=True,
    )

    print(f"\n[OTP GENERATED] Email: {clean_email} | Code: {otp_code} (Expires in 10 mins)\n")

    return {
        "status": "success",
        "message": f"OTP code sent to {clean_email}",
    }


@router.post("/verify-otp")
@router.post("/verify-otp/")
def verify_otp(payload: OTPVerifySchema):
    """Verifies the submitted OTP code."""
    clean_email = payload.email.lower().strip()
    submitted_code = payload.otp_code or payload.otp or ""
    submitted_code = str(submitted_code).strip()

    record = db.otp_verifications.find_one(
        {
            "email": clean_email,
            "otp_code": submitted_code,
            "is_used": False,
        }
    )

    if not record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP",
        )

    expires_at = record.get("expires_at")
    if expires_at:
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        if expires_at < get_utc_now():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OTP code has expired",
            )

    db.otp_verifications.update_one(
        {"_id": record["_id"]},
        {"$set": {"is_used": True}},
    )

    db.users.update_one(
        {"email": clean_email},
        {"$set": {"is_verified": True}},
    )

    return {"status": "success", "message": "OTP verified successfully"}


@router.post("/reset-password")
def reset_password(payload: ResetPasswordSchema):
    """Resets user password after OTP has been verified."""
    clean_email = payload.email.lower().strip()
    submitted_code = payload.otp_code or payload.otp or ""

    record = db.otp_verifications.find_one(
        {
            "email": clean_email,
            "otp_code": str(submitted_code).strip(),
            "is_used": True,
        }
    )

    if not record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please verify your OTP code first",
        )

    new_hash = hash_password(payload.new_password)
    result = db.users.update_one(
        {"email": clean_email},
        {"$set": {"password_hash": new_hash}},
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found",
        )

    db.otp_verifications.delete_one({"_id": record["_id"]})

    return {
        "status": "success",
        "message": "Password reset successfully. Please log in with your new password.",
    }