from database import db

def semantic_smart_search(search_term: str) -> list[dict]:
    """Performs full-text token matching across services and descriptions."""
    tokens = search_term.lower().split()
    query = {
        "$or": [
            {"title": {"$regex": search_term, "$options": "i"}},
            {"tags": {"$in": tokens}}
        ]
    }
    cursor = db.services.find(query)
    results = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        results.append(doc)
    return results