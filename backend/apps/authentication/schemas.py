from typing import Optional, Union, Dict, Any
from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator
from apps.authentication.models import UserRole


class LoginSchema(BaseModel):
    email: EmailStr
    password: str
    role: Optional[Union[UserRole, str]] = UserRole.USER

    @field_validator("role", mode="before")
    @classmethod
    def validate_role(cls, v):
        if isinstance(v, str):
            v_title = v.strip().capitalize()
            for role_enum in UserRole:
                if role_enum.value.lower() == v.lower():
                    return role_enum
        return v


class RegisterSchema(BaseModel):
    full_name: str = Field("", min_length=2)
    name: Optional[str] = None
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: Union[UserRole, str] = UserRole.USER
    phone: Optional[str] = None
    area: Optional[str] = None
    category: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def normalize_name_and_role(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if not data.get("full_name") and data.get("name"):
                data["full_name"] = str(data["name"]).strip()
            elif data.get("full_name"):
                data["full_name"] = str(data["full_name"]).strip()
        return data


class UserDetailSchema(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: Union[UserRole, str]
    picture: Optional[str] = None


class TokenResponseSchema(BaseModel):
    access_token: str
    token: Optional[str] = None
    token_type: str = "bearer"
    role: Union[UserRole, str]
    user: Dict[str, Any]

    model_config = {"from_attributes": True, "extra": "allow"}


class OTPRequestSchema(BaseModel):
    email: EmailStr


class OTPVerifySchema(BaseModel):
    email: EmailStr
    otp_code: Optional[str] = None
    otp: Optional[str] = None

    @field_validator("otp_code", mode="before")
    @classmethod
    def populate_otp(cls, v, info):
        if not v and "otp" in info.data:
            return info.data["otp"]
        return v


class ResetPasswordSchema(BaseModel):
    email: EmailStr
    otp_code: Optional[str] = None
    otp: Optional[str] = None
    new_password: str = Field(..., min_length=6)

    @model_validator(mode="before")
    @classmethod
    def normalize_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if not data.get("new_password") and data.get("newPassword"):
                data["new_password"] = data["newPassword"]
            if not data.get("otp_code") and data.get("otp"):
                data["otp_code"] = data["otp"]
        return data