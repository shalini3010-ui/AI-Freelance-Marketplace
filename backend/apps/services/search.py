import inspect
from database import db

async def search_services(
    query: str = None, 
    category: str = None, 
    min_price: float = None, 
    max_price: float = None
) -> list[dict]:
    """Filters services dynamically based on search query, category, and price range."""
    filter_query = {}

    if category:
        filter_query["category"] = {"$regex": f"^{category}$", "$options": "i"}

    if min_price is not None or max_price is not None:
        price_bounds = {}
        if min_price is not None:
            price_bounds["$gte"] = min_price
        if max_price is not None:
            price_bounds["$lte"] = max_price
        filter_query["price"] = price_bounds

    if query:
        filter_query["$or"] = [
            {"title": {"$regex": query, "$options": "i"}},
            {"description": {"$regex": query, "$options": "i"}},
            {"handyman_name": {"$regex": query, "$options": "i"}},
            {"tags": {"$in": [query.lower()]}}
        ]

    cursor = db.services.find(filter_query)
    
    if hasattr(cursor, "to_list"):
        res = cursor.to_list(length=100)
        docs = await res if inspect.isawaitable(res) else res
    else:
        docs = list(cursor)

    results = []
    for doc in docs:
        doc["_id"] = str(doc["_id"])
        doc["id"] = doc["_id"]
        results.append(doc)

    return results