import inspect
from database import db

async def get_all_categories() -> list[dict]:
    """Retrieves all distinct service categories from active services."""
    try:
        if hasattr(db, "services") and db.services is not None:
            categories_res = db.services.distinct("category")
            if inspect.isawaitable(categories_res):
                categories = await categories_res
            else:
                categories = categories_res
            
            if categories:
                return [{"name": cat} for cat in categories if cat]
    except Exception as e:
        print(f"Error fetching categories: {e}")

    # Default categories fallback
    return [
        {"name": "Plumbing"},
        {"name": "Electrical"},
        {"name": "Cleaning"},
        {"name": "Appliance"},
        {"name": "Painting"}
    ]