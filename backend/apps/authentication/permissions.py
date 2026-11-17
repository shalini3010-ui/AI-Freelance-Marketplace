from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from config import settings

security = HTTPBearer()
optional_security = HTTPBearer(auto_error=False)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id = str(payload.get("sub") or payload.get("id") or payload.get("_id") or "")
        payload["_id"] = user_id
        payload["id"] = user_id
        payload["sub"] = user_id
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_security)
) -> Optional[dict]:
    if not credentials or not credentials.credentials:
        return None
    try:
        token = credentials.credentials
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except Exception:
        return None

def require_role(allowed_roles: list):
    async def role_checker(current_user: dict = Depends(get_current_user)):
        user_role = str(current_user.get("role", "")).strip().lower()
        role_values_lower = [str(r.value if hasattr(r, "value") else r).strip().lower() for r in allowed_roles]
        if user_role not in role_values_lower:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource"
            )
        return current_user
    return role_checker

async def get_current_handyman(current_user: dict = Depends(get_current_user)):
    if str(current_user.get("role", "")).lower() != "handyman":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to handyman account only"
        )
    return current_user