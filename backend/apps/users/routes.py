# routes.py

from fastapi import APIRouter, Depends, HTTPException, status, Query
from bson import ObjectId
from database import db
from apps.authentication.dependencies import get_current_user
from apps.authentication.models import UserRole
from apps.users.schemas import UserProfileUpdateSchema, UserDashboardResponseSchema
from apps.users.services import get_user_dashboard_data
from apps.authentication.permissions import require_role

router = APIRouter()


# Added multiple route decorators to match all potential frontend endpoint calls
@router.get("/profile")
@router.get("/profile/")
@router.get("/me")
@router.get("/me/")
@router.get("/users/me")
@router.get("/users/me/")
@router.get("/user/me")
@router.get("/user/me/")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """
    Fetch details of the currently logged-in user.
    """
    if "_id" in current_user:
        current_user["_id"] = str(current_user["_id"])
    return current_user


@router.get("/search")
def search_dashboard(
    q: str = Query(..., min_length=1, description="Search Keyword"),
    current_user: dict = Depends(get_current_user),
):
    results = list(db["services"].find({
        "$or": [
            {"title": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
            {"category": {"$regex": q, "$options": "i"}}
        ]
    }).limit(20))
    
    for r in results:
        r["_id"] = str(r["_id"])
        
    return {"query": q, "results": results}


@router.get("/dashboard", response_model=UserDashboardResponseSchema)
async def user_dashboard(current_user: dict = Depends(require_role([UserRole.USER, UserRole.ADMIN]))):
    user_id = str(current_user.get("_id") or current_user.get("sub"))
    data = get_user_dashboard_data(user_id)
    if not data:
        raise HTTPException(status_code=404, detail="User account not found")
    return data


@router.put("/profile")
@router.put("/profile/")
async def update_user_profile(
    payload: UserProfileUpdateSchema,
    current_user: dict = Depends(require_role([UserRole.USER, UserRole.HANDYMAN, UserRole.ADMIN]))
):
    user_id = str(current_user.get("_id") or current_user.get("sub"))
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update")

    db.users.update_one({"_id": ObjectId(user_id)}, {"$set": update_data})
    return {"status": "success", "message": "Profile updated successfully"}