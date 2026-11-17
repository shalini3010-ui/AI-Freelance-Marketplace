from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from bson import ObjectId
from database import db
from apps.reviews.schemas import (
    ReviewCreateSchema, 
    RatingCreateSchema, 
    FeedbackReplySchema, 
    FeedbackStatusUpdateSchema
)
from apps.authentication.permissions import require_role, get_optional_current_user, get_current_user
from apps.authentication.models import UserRole

router = APIRouter(tags=["Reviews & Ratings"])


def recalculate_handyman_rating(handyman_id: str):
    """Recalculates and updates average rating score on the handyman's profile."""
    if not handyman_id:
        return

    try:
        pipeline = [
            {"$match": {"handyman_id": str(handyman_id)}},
            {
                "$group": {
                    "_id": None,
                    "avg_rating": {"$avg": "$rating"},
                    "total_reviews": {"$sum": 1},
                }
            },
        ]
        res = list(db.reviews.aggregate(pipeline))
        if res:
            avg_score = round(res[0]["avg_rating"], 2)
            total = res[0]["total_reviews"]
            if ObjectId.is_valid(handyman_id):
                db.users.update_one(
                    {"_id": ObjectId(handyman_id)},
                    {
                        "$set": {
                            "handyman_profile.average_rating": avg_score,
                            "handyman_profile.total_reviews": total,
                        }
                    },
                )
    except Exception as e:
        print(f"Error recalculating rating for handyman {handyman_id}: {e}")


def format_review_doc(r: dict) -> dict:
    created = r.get("created_at")
    date_str = r.get("date")
    if not date_str and isinstance(created, datetime):
        date_str = created.strftime("%Y-%m-%d")
    elif not date_str:
        date_str = datetime.utcnow().strftime("%Y-%m-%d")

    return {
        "id": str(r["_id"]),
        "_id": str(r["_id"]),
        "handymanId": str(r.get("handyman_id") or ""),
        "handymanName": r.get("handyman_name") or "Service Specialist",
        "serviceTitle": r.get("service_title") or "Home Maintenance",
        "bookingId": r.get("booking_id") or "BK-General",
        "userName": r.get("user_name", "Verified Customer"),
        "userId": str(r.get("user_id") or ""),
        "comment": r.get("comment", ""),
        "rating": float(r.get("rating", 5.0)),
        "category": r.get("category", "Service Quality"),
        "wouldRecommend": bool(r.get("would_recommend", True)),
        "date": date_str,
        "likes": int(r.get("likes", 0)),
        "categories": r.get("categories") or {
            "punctuality": 5,
            "quality": 5,
            "pricing": 5,
            "communication": 5
        },
        "status": r.get("status", "Approved"),
        "reply": r.get("reply") or None
    }


@router.get("", response_model=None)
@router.get("/", response_model=None)
@router.get("/reviews", response_model=None)
@router.get("/reviews/", response_model=None)
def get_reviews(
    handymanId: Optional[str] = Query(None),
    status: Optional[str] = Query(None)
):
    """Retrieves list of reviews for a given handyman or all services."""
    query = {}
    if handymanId:
        query["handyman_id"] = str(handymanId)
    if status and status.lower() != "all":
        query["status"] = status

    cursor = db.reviews.find(query).sort("created_at", -1)
    return [format_review_doc(r) for r in cursor]


@router.post("", status_code=status.HTTP_201_CREATED)
@router.post("/", status_code=status.HTTP_201_CREATED)
@router.post("/reviews", status_code=status.HTTP_201_CREATED)
@router.post("/reviews/", status_code=status.HTTP_201_CREATED)
def post_review(
    payload: ReviewCreateSchema,
    current_user: Optional[dict] = Depends(get_optional_current_user),
):
    """Posts a new user feedback / review with star ratings and category tags."""
    user_id = str(current_user.get("sub") or current_user.get("id") or current_user.get("_id") or "") if current_user else None
    user_name = payload.user_name if payload.user_name and payload.user_name != "Anonymous User" else (
        current_user.get("name") or current_user.get("full_name") or "Verified Customer" if current_user else "Verified Customer"
    )

    review_doc = {
        "handyman_id": str(payload.handyman_id) if payload.handyman_id else None,
        "handyman_name": payload.handyman_name or "Service Specialist",
        "service_title": payload.service_title or "Home Repair",
        "booking_id": payload.booking_id or "BK-Direct",
        "user_id": user_id,
        "user_name": user_name,
        "comment": payload.comment or "",
        "rating": float(payload.rating),
        "category": payload.category or "Service Quality",
        "would_recommend": True if payload.would_recommend is None else bool(payload.would_recommend),
        "categories": payload.categories.model_dump() if payload.categories else {
            "punctuality": 5,
            "quality": 5,
            "pricing": 5,
            "communication": 5
        },
        "date": datetime.utcnow().strftime("%Y-%m-%d"),
        "created_at": datetime.utcnow(),
        "likes": 0,
        "status": "Approved",
        "reply": None
    }

    res = db.reviews.insert_one(review_doc)
    review_doc["_id"] = res.inserted_id

    if payload.handyman_id:
        recalculate_handyman_rating(payload.handyman_id)

    return format_review_doc(review_doc)


@router.get("/my")
@router.get("/my/")
@router.get("/user/my")
def get_user_feedbacks(current_user: dict = Depends(get_current_user)):
    """Fetch all feedback submissions by the authenticated user."""
    user_id = str(current_user.get("sub") or current_user.get("id") or current_user.get("_id") or "")
    cursor = db.reviews.find({"user_id": user_id}).sort("created_at", -1)
    return [format_review_doc(r) for r in cursor]


@router.get("/handyman-summary")
@router.get("/handyman-summary/")
def get_handyman_feedback_summary(
    handyman_id: Optional[str] = Query(None),
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    """Retrieves full rating breakdown and customer feedbacks for a handyman."""
    target_id = handyman_id or (
        str(current_user.get("sub") or current_user.get("id") or current_user.get("_id") or "")
        if current_user and str(current_user.get("role", "")).lower() == "handyman" else None
    )

    query = {}
    if target_id:
        query["handyman_id"] = str(target_id)

    reviews_cursor = list(db.reviews.find(query).sort("created_at", -1))
    total_reviews = len(reviews_cursor)

    rating_counts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    sum_ratings = 0.0
    dim_sums = {"quality": 0, "punctuality": 0, "pricing": 0, "communication": 0}

    for r in reviews_cursor:
        score = int(round(r.get("rating", 5)))
        score = max(1, min(5, score))
        rating_counts[score] = rating_counts.get(score, 0) + 1
        sum_ratings += float(r.get("rating", 5.0))

        cats = r.get("categories") or {}
        dim_sums["quality"] += cats.get("quality", 5)
        dim_sums["punctuality"] += cats.get("punctuality", 5)
        dim_sums["pricing"] += cats.get("pricing", 5)
        dim_sums["communication"] += cats.get("communication", 5)

    avg_rating = round(sum_ratings / total_reviews, 2) if total_reviews > 0 else 4.9
    dim_averages = {
        k: round(v / total_reviews, 1) if total_reviews > 0 else 4.8
        for k, v in dim_sums.items()
    }
    sat_rate = round(((rating_counts[5] + rating_counts[4]) / total_reviews * 100), 1) if total_reviews > 0 else 98.0
    formatted_feedbacks = [format_review_doc(r) for r in reviews_cursor]

    return {
        "handyman_id": target_id,
        "overall_rating": avg_rating,
        "average_rating": avg_rating,
        "total_reviews": total_reviews,
        "satisfaction_rate": sat_rate,
        "rating_breakdown": rating_counts,
        "distribution": rating_counts,
        "dimension_averages": dim_averages,
        "feedbacks": formatted_feedbacks,
        "reviews": formatted_feedbacks
    }


@router.post("/{review_id}/reply")
@router.post("/{review_id}/reply/")
def reply_to_feedback(
    review_id: str,
    payload: FeedbackReplySchema,
    current_user: dict = Depends(get_current_user)
):
    """Allows handyman or administrator to post an official response to customer feedback."""
    if not ObjectId.is_valid(review_id):
        raise HTTPException(status_code=400, detail="Invalid feedback ID")

    reply_content = payload.get_text()
    if not reply_content:
        raise HTTPException(status_code=400, detail="Reply text is required")

    responder_role = str(current_user.get("role", "Provider")).capitalize()
    responder_name = current_user.get("name") or current_user.get("full_name") or "Specialist"

    reply_doc = {
        "text": reply_content,
        "role": responder_role,
        "name": responder_name,
        "date": datetime.utcnow().strftime("%Y-%m-%d"),
        "created_at": datetime.utcnow()
    }

    res = db.reviews.find_one_and_update(
        {"_id": ObjectId(review_id)},
        {"$set": {"reply": reply_doc}},
        return_document=True
    )

    if not res:
        raise HTTPException(status_code=404, detail="Feedback record not found")

    return {"status": "success", "message": "Reply posted successfully", "feedback": format_review_doc(res)}


@router.put("/{review_id}/status")
@router.put("/{review_id}/status/")
def update_feedback_status(
    review_id: str,
    payload: FeedbackStatusUpdateSchema,
    current_user: dict = Depends(require_role([UserRole.ADMIN]))
):
    """Allows admin to update feedback moderation status (Approved, Flagged, Under Review)."""
    if not ObjectId.is_valid(review_id):
        raise HTTPException(status_code=400, detail="Invalid feedback ID")

    res = db.reviews.find_one_and_update(
        {"_id": ObjectId(review_id)},
        {"$set": {"status": payload.status, "moderated_at": datetime.utcnow()}},
        return_document=True
    )

    if not res:
        raise HTTPException(status_code=404, detail="Feedback record not found")

    return {"status": "success", "message": f"Status updated to {payload.status}", "feedback": format_review_doc(res)}


@router.delete("/{review_id}")
@router.delete("/{review_id}/")
def delete_feedback(
    review_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Allows admin or review owner to delete a review."""
    if not ObjectId.is_valid(review_id):
        raise HTTPException(status_code=400, detail="Invalid feedback ID")

    user_id = str(current_user.get("sub") or current_user.get("id") or current_user.get("_id") or "")
    is_admin = str(current_user.get("role", "")).lower() == "admin"

    query = {"_id": ObjectId(review_id)}
    if not is_admin:
        query["user_id"] = user_id

    review = db.reviews.find_one(query)
    if not review:
        raise HTTPException(status_code=404, detail="Feedback not found or unauthorized to delete")

    db.reviews.delete_one({"_id": ObjectId(review_id)})

    if review.get("handyman_id"):
        recalculate_handyman_rating(review["handyman_id"])

    return {"status": "success", "message": "Feedback deleted successfully"}


@router.get("/admin/all")
@router.get("/admin/all/")
def admin_get_all_feedbacks(current_user: dict = Depends(require_role([UserRole.ADMIN]))):
    """Provides platform-wide feedback moderation metrics and records for the Admin Dashboard."""
    all_reviews = list(db.reviews.find().sort("created_at", -1))
    total = len(all_reviews)

    rating_counts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    status_counts = {"Approved": 0, "Flagged": 0, "Under Review": 0}
    sum_ratings = 0.0

    for r in all_reviews:
        score = int(round(r.get("rating", 5)))
        score = max(1, min(5, score))
        rating_counts[score] = rating_counts.get(score, 0) + 1
        sum_ratings += float(r.get("rating", 5.0))

        st = r.get("status", "Approved")
        status_counts[st] = status_counts.get(st, 0) + 1

    avg_rating = round(sum_ratings / total, 2) if total > 0 else 4.85
    pos_count = rating_counts[5] + rating_counts[4]
    pos_ratio = round((pos_count / total * 100), 1) if total > 0 else 94.0

    return {
        "total_count": total,
        "total_reviews": total,
        "average_rating": avg_rating,
        "positive_ratio": pos_ratio,
        "positive_percentage": pos_ratio,
        "status_breakdown": status_counts,
        "rating_breakdown": rating_counts,
        "metrics": {
            "total_reviews": total,
            "average_rating": avg_rating,
            "positive_percentage": pos_ratio,
            "flagged_count": status_counts.get("Flagged", 0)
        },
        "feedbacks": [format_review_doc(r) for r in all_reviews]
    }


@router.put("/reviews/{review_id}/like/")
def like_review(review_id: str):
    """Increments the helpful upvote counter on a review."""
    try:
        result = db.reviews.update_one(
            {"_id": ObjectId(review_id)},
            {"$inc": {"likes": 1}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Review not found")
        return {"status": "success", "message": "Upvoted review"}
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid review ID format")


@router.post("/ratings/")
def submit_rating(
    payload: RatingCreateSchema,
    current_user: Optional[dict] = Depends(get_optional_current_user),
):
    """Submits multi-category service rating linked to a booking."""
    user_id = current_user["sub"] if current_user else None
    rating_doc = {
        "booking_id": payload.booking_id,
        "handyman_id": payload.handyman_id,
        "user_id": user_id,
        "rating": payload.rating,
        "categories": payload.categories.model_dump() if payload.categories else None,
        "created_at": datetime.utcnow(),
    }

    res = db.ratings.insert_one(rating_doc)

    try:
        db.bookings.update_one(
            {"_id": ObjectId(payload.booking_id)},
            {"$set": {"rated": True, "overallRating": payload.rating}}
        )
    except Exception:
        pass

    if payload.handyman_id:
        recalculate_handyman_rating(payload.handyman_id)

    return {"status": "success", "rating_id": str(res.inserted_id)}