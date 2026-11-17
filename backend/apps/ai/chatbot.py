import re
from typing import Optional, List, Dict, Any
from database import db

# Default fallback worker database with rich profiles
VERIFIED_WORKERS: Dict[str, List[Dict[str, Any]]] = {
    "plumber": [
        {
            "name": "Vikram Singh",
            "role": "Master Plumber & Pipe Specialist",
            "rating": 5.0,
            "reviews": 38,
            "rate": "₹249 - ₹350",
            "phone": "+91 9123456780",
            "area": "Bangalore & Doddaballapur",
            "experience": "6 years",
            "verified": True,
            "badge": "Top Rated Pro"
        },
        {
            "name": "John Doe",
            "role": "Plumbing Fix & Leakage Specialist",
            "rating": 4.9,
            "reviews": 28,
            "rate": "₹249",
            "phone": "+91 9876501234",
            "area": "Local Area & Doddaballapur",
            "experience": "5 years",
            "verified": True,
            "badge": "Fast Dispatch"
        },
        {
            "name": "Ramesh Kumar",
            "role": "Bathroom Fitting & Drain Master",
            "rating": 4.8,
            "reviews": 21,
            "rate": "₹299",
            "phone": "+91 9845123456",
            "area": "Bangalore North",
            "experience": "4 years",
            "verified": True,
            "badge": "Verified"
        }
    ],
    "electrician": [
        {
            "name": "Alex Smith",
            "role": "Certified Electrician & Wiring Pro",
            "rating": 4.9,
            "reviews": 45,
            "rate": "₹299",
            "phone": "+91 9876543210",
            "area": "Local Area & Doddaballapur",
            "experience": "5 years",
            "verified": True,
            "badge": "Top Rated Pro"
        },
        {
            "name": "Priya Sharma",
            "role": "Appliance Wiring & MCB Specialist",
            "rating": 4.8,
            "reviews": 32,
            "rate": "₹349",
            "phone": "+91 9811223344",
            "area": "Bangalore & Surroundings",
            "experience": "4 years",
            "verified": True,
            "badge": "Verified"
        }
    ],
    "cleaning": [
        {
            "name": "Sarah Connor",
            "role": "Home Sanitation & Deep Cleaning",
            "rating": 4.8,
            "reviews": 34,
            "rate": "₹499",
            "phone": "+91 9822334455",
            "area": "Local Area & Doddaballapur",
            "experience": "4 years",
            "verified": True,
            "badge": "Customer Choice"
        },
        {
            "name": "Anita Verma",
            "role": "Kitchen & Bathroom Sanitizer",
            "rating": 4.7,
            "reviews": 26,
            "rate": "₹399",
            "phone": "+91 9833445566",
            "area": "Local Area",
            "experience": "3 years",
            "verified": True,
            "badge": "Verified"
        }
    ],
    "appliance": [
        {
            "name": "Mike Taylor",
            "role": "AC & Major Appliance Repair Tech",
            "rating": 4.9,
            "reviews": 42,
            "rate": "₹399",
            "phone": "+91 9844556677",
            "area": "Local Area & Doddaballapur",
            "experience": "7 years",
            "verified": True,
            "badge": "Master Tech"
        },
        {
            "name": "Suresh Patel",
            "role": "Refrigerator & Washing Machine Expert",
            "rating": 4.8,
            "reviews": 29,
            "rate": "₹349",
            "phone": "+91 9855667788",
            "area": "Local Area",
            "experience": "5 years",
            "verified": True,
            "badge": "Verified"
        }
    ],
    "carpenter": [
        {
            "name": "David Wilson",
            "role": "Custom Furniture & Door Fitting",
            "rating": 4.8,
            "reviews": 22,
            "rate": "₹349",
            "phone": "+91 9866778899",
            "area": "Local Area",
            "experience": "6 years",
            "verified": True,
            "badge": "Verified"
        }
    ],
    "painter": [
        {
            "name": "Arun Kumar",
            "role": "Wall Painting & Waterproofing Expert",
            "rating": 4.8,
            "reviews": 18,
            "rate": "₹499",
            "phone": "+91 9877889900",
            "area": "Local Area",
            "experience": "5 years",
            "verified": True,
            "badge": "Verified"
        }
    ]
}


def _fetch_db_workers(category_keyword: str) -> List[Dict[str, Any]]:
    """Fetches real registered handymen from MongoDB users collection if available."""
    try:
        if db is None or not hasattr(db, "users"):
            return []
        regex = {"$regex": category_keyword, "$options": "i"}
        query = {
            "role": "Handyman",
            "$or": [
                {"handyman_profile.skills": regex},
                {"handyman_profile.category": regex},
                {"area": regex}
            ]
        }
        docs = list(db.users.find(query, {"password_hash": 0}).limit(5))
        workers = []
        for d in docs:
            hp = d.get("handyman_profile") or {}
            skills = hp.get("skills") or [category_keyword.capitalize()]
            skill_text = ", ".join(skills) if isinstance(skills, list) else str(skills)
            hourly_rate = hp.get("hourly_rate", 0)
            rate_str = f"₹{int(hourly_rate)}" if hourly_rate > 0 else "₹249 - ₹350"
            workers.append({
                "name": d.get("full_name") or d.get("name") or "Verified Handyman",
                "role": f"{skill_text} Specialist",
                "rating": float(hp.get("average_rating") or 4.9),
                "reviews": int(hp.get("total_reviews") or 25),
                "rate": rate_str,
                "phone": d.get("phone") or "+91 9876543210",
                "area": d.get("area") or "Local Area",
                "experience": "5+ years",
                "verified": bool(d.get("is_verified", True)),
                "badge": "Verified Pro"
            })
        return workers
    except Exception as e:
        print(f"Error fetching DB workers: {e}")
        return []


def get_smart_chat_reply(
    user_query: str,
    location: Optional[str] = None,
    user_name: Optional[str] = None
) -> Dict[str, Any]:
    """
    Intelligent natural language query processor that dynamically returns
    custom answers, verified technician recommendations, live actions, and follow-ups.
    """
    raw_q = (user_query or "").strip()
    q = raw_q.lower()
    loc = location.strip() if location and location.strip() else "your local area"
    name_display = f" {user_name}" if user_name else ""

    # Normalize common typos and slang
    # Typo handling: 'plumbeer' -> 'plumber', 'electrisian' -> 'electrician', etc.
    q_norm = re.sub(r'\bplumb[e|a]+r*\b', 'plumber', q)
    q_norm = re.sub(r'\belectr[i|e][c|s]i[a|e]n*\b', 'electrician', q_norm)
    q_norm = re.sub(r'\bcl[e|a]+n[e|i|a]*r*\b', 'cleaner', q_norm)
    q_norm = re.sub(r'\bcarp[e|a]nt[e|a]r*\b', 'carpenter', q_norm)

    is_asking_name = any(k in q_norm for k in ["name", "who is", "who are", "suggest", "recommend", "best", "top", "list", "worker name"])
    is_asking_near_me = any(k in q_norm for k in ["near me", "around me", "in my area", "nearby", "local", "here", "available"])

    # ─────────────────────────────────────────────────────────────────
    # 1. PLUMBER INTENT
    # ─────────────────────────────────────────────────────────────────
    if any(k in q_norm for k in ["plumb", "pipe", "leak", "tap", "sink", "drain", "water tank", "flush", "faucet", "clog"]):
        db_workers = _fetch_db_workers("Plumber")
        workers_pool = db_workers + [w for w in VERIFIED_WORKERS["plumber"] if not any(dw["name"] == w["name"] for dw in db_workers)]
        top_workers = workers_pool[:3]

        worker_bullets = "\n".join([
            f"• 👨‍🔧 **{w['name']}** — ⭐ {w['rating']} ({w['reviews']} reviews) | Rate: {w['rate']}\n  _{w['role']} • {w['area']}_"
            for w in top_workers
        ])

        if is_asking_name or is_asking_near_me:
            reply = (
                f"🚰 Here are our top verified **Plumbers** available near **{loc}**:\n\n"
                f"{worker_bullets}\n\n"
                f"✨ **Recommended Action**: You can book **{top_workers[0]['name']}** directly from the Services tab, "
                f"or choose **🚨 Emergency Booking** for priority arrival within 20 minutes!"
            )
        else:
            reply = (
                f"🚰 Need a plumber? We have certified technicians ready in **{loc}**!\n\n"
                f"{worker_bullets}\n\n"
                f"Common fixes: Leaking pipes, tap replacement, bathroom drain unclogging, water tank repair. "
                f"Would you like me to book one of them or start an emergency dispatch?"
            )

        return {
            "reply": reply,
            "suggestions": [
                f"Book {top_workers[0]['name']}",
                "🚨 Emergency Plumber Now",
                "💰 Plumbing Price Rates",
                "📍 Track My Booking"
            ],
            "category": "Plumbing",
            "action": "services",
            "workers": top_workers
        }

    # ─────────────────────────────────────────────────────────────────
    # 2. ELECTRICIAN INTENT
    # ─────────────────────────────────────────────────────────────────
    if any(k in q_norm for k in ["electr", "wire", "wiring", "switch", "short circuit", "mcb", "fuse", "power", "fan", "spark", "light"]):
        db_workers = _fetch_db_workers("Electrician")
        workers_pool = db_workers + [w for w in VERIFIED_WORKERS["electrician"] if not any(dw["name"] == w["name"] for dw in db_workers)]
        top_workers = workers_pool[:3]

        worker_bullets = "\n".join([
            f"• ⚡ **{w['name']}** — ⭐ {w['rating']} ({w['reviews']} reviews) | Rate: {w['rate']}\n  _{w['role']} • {w['area']}_"
            for w in top_workers
        ])

        reply = (
            f"⚡ Here are our top-rated **Electricians** in **{loc}**:\n\n"
            f"{worker_bullets}\n\n"
            f"💡 **Safety First**: For burning smells or sparking circuits, please turn off the main switch and use **🚨 Emergency Booking** for 15-min arrival."
        )

        return {
            "reply": reply,
            "suggestions": [
                f"Book {top_workers[0]['name']}",
                "🚨 Emergency Electrician",
                "⚡ Check Electrical Rates",
                "📍 Service Tracking"
            ],
            "category": "Electrical",
            "action": "services",
            "workers": top_workers
        }

    # ─────────────────────────────────────────────────────────────────
    # 3. CLEANING INTENT
    # ─────────────────────────────────────────────────────────────────
    if any(k in q_norm for k in ["clean", "maid", "housekeep", "sanitat", "sweep", "mop", "dust", "deep clean"]):
        top_workers = VERIFIED_WORKERS["cleaning"]
        worker_bullets = "\n".join([
            f"• 🧹 **{w['name']}** — ⭐ {w['rating']} ({w['reviews']} reviews) | Rate: {w['rate']}\n  _{w['role']} • {w['area']}_"
            for w in top_workers
        ])
        reply = (
            f"🧹 Professional **Home Cleaning & Sanitation** specialists available near **{loc}**:\n\n"
            f"{worker_bullets}\n\n"
            f"Includes kitchen degreasing, bathroom scrubbing, floor polishing, and sofa shampooing. Transparent pricing starting at ₹499."
        )
        return {
            "reply": reply,
            "suggestions": [
                "Book Sarah Connor",
                "🧹 View Cleaning Services",
                "💳 Payment Options",
                "⭐ Reviews & Ratings"
            ],
            "category": "Cleaning",
            "action": "services",
            "workers": top_workers
        }

    # ─────────────────────────────────────────────────────────────────
    # 4. AC & APPLIANCE REPAIR INTENT
    # ─────────────────────────────────────────────────────────────────
    if any(k in q_norm for k in ["ac", "air condition", "cooling", "hvac", "fridge", "refrigerator", "washing machine", "appliance", "microwave", "oven"]):
        top_workers = VERIFIED_WORKERS["appliance"]
        worker_bullets = "\n".join([
            f"• ❄️ **{w['name']}** — ⭐ {w['rating']} ({w['reviews']} reviews) | Rate: {w['rate']}\n  _{w['role']} • {w['area']}_"
            for w in top_workers
        ])
        reply = (
            f"❄️ Certified **AC & Appliance Technicians** servicing **{loc}**:\n\n"
            f"{worker_bullets}\n\n"
            f"We handle gas refilling, cooling diagnostics, compressor fixes, and PCB repairs with a 30-day service warranty."
        )
        return {
            "reply": reply,
            "suggestions": [
                "Book Mike Taylor",
                "❄️ AC Deep Cleaning (₹399)",
                "🧺 Appliance Repair (₹349)",
                "📄 Download Invoices"
            ],
            "category": "Appliance",
            "action": "services",
            "workers": top_workers
        }

    # ─────────────────────────────────────────────────────────────────
    # 5. CARPENTRY & PAINTING
    # ─────────────────────────────────────────────────────────────────
    if any(k in q_norm for k in ["carpent", "wood", "door", "window", "furniture", "lock"]):
        top_workers = VERIFIED_WORKERS["carpenter"]
        return {
            "reply": (
                f"🔨 Top Carpenter available in **{loc}**:\n\n"
                f"• **{top_workers[0]['name']}** — ⭐ {top_workers[0]['rating']} ({top_workers[0]['reviews']} reviews)\n"
                f"  _{top_workers[0]['role']} | Rate: {top_workers[0]['rate']}_\n\n"
                f"Services include lock repairs, furniture assembly, hinge fixes, and custom shelf installation."
            ),
            "suggestions": ["Book David Wilson", "🔨 Carpentry Rates", "🚨 Emergency Booking"],
            "category": "Carpentry",
            "action": "services",
            "workers": top_workers
        }

    if any(k in q_norm for k in ["paint", "whitewash", "waterproof", "wall"]):
        top_workers = VERIFIED_WORKERS["painter"]
        return {
            "reply": (
                f"🎨 Professional Painter available in **{loc}**:\n\n"
                f"• **{top_workers[0]['name']}** — ⭐ {top_workers[0]['rating']} ({top_workers[0]['reviews']} reviews)\n"
                f"  _{top_workers[0]['role']} | Rate: {top_workers[0]['rate']}_\n\n"
                f"Services include interior/exterior wall painting, putty finishing, and waterproofing."
            ),
            "suggestions": ["Book Arun Kumar", "🎨 Painting Estimates", "💬 Customer Reviews"],
            "category": "Painting",
            "action": "services",
            "workers": top_workers
        }

    # ─────────────────────────────────────────────────────────────────
    # 6. EMERGENCY DISPATCH
    # ─────────────────────────────────────────────────────────────────
    if any(k in q_norm for k in ["emergency", "urgent", "fast", "asap", "immediate", "hazard", "burst", "flood"]):
        return {
            "reply": (
                f"🚨 **24/7 Priority Emergency Dispatch is Active!**\n\n"
                f"• Average technician arrival in **{loc}**: **15 to 25 minutes**.\n"
                f"• Live GPS vehicle tracking & real-time ETA.\n"
                f"• Certified background-verified technicians on standby.\n\n"
                f"👉 Switch to the **🚨 Emergency Booking** tab to confirm instant dispatch, "
                f"or let me know your trade (Plumber / Electrician) to assign one right now!"
            ),
            "suggestions": ["🚨 Dispatch Plumber Now", "🚨 Dispatch Electrician Now", "📍 Track Live Location"],
            "action": "emergency"
        }

    # ─────────────────────────────────────────────────────────────────
    # 7. TRACKING & STATUS
    # ─────────────────────────────────────────────────────────────────
    if any(k in q_norm for k in ["track", "status", "where is", "arrival", "progress", "on the way"]):
        return {
            "reply": (
                f"📍 **Live Service Tracking**\n\n"
                f"• You can track your assigned technician's live GPS route under the **📍 Service Tracking** tab.\n"
                f"• Active Booking Example: **#BK-8901 (Alex Smith - Electrical Wiring)** is currently **In Progress**.\n"
                f"• Real-time updates and technician phone contact are available on the tracking map."
            ),
            "suggestions": ["📍 Open Service Tracking", "📋 View Booking History", "💬 Contact Handyman"],
            "action": "tracking"
        }

    # ─────────────────────────────────────────────────────────────────
    # 8. PRICING & RATES
    # ─────────────────────────────────────────────────────────────────
    if any(k in q_norm for k in ["price", "cost", "how much", "rate", "fee", "charge", "pricing"]):
        return {
            "reply": (
                f"🏷️ **FixIt.ai Transparent Price Catalog:**\n\n"
                f"• 🔧 **Plumbing Fix**: From ₹249\n"
                f"• ⚡ **Electrical Work**: From ₹299\n"
                f"• ❄️ **AC Deep Cleaning**: From ₹399\n"
                f"• 🧹 **Home Deep Cleaning**: From ₹499\n"
                f"• 🧺 **Appliance Repair**: From ₹349\n"
                f"• 🔨 **Carpentry Fitting**: From ₹349\n\n"
                f"✨ **Guaranteed**: No surprise hidden fees, free quotes upfront, and 100% money-back escrow protection."
            ),
            "suggestions": ["🔧 Book Plumber (₹249)", "⚡ Book Electrician (₹299)", "💳 Payment Methods"],
            "action": "services"
        }

    # ─────────────────────────────────────────────────────────────────
    # 9. PAYMENTS, INVOICE & REFUND
    # ─────────────────────────────────────────────────────────────────
    if any(k in q_norm for k in ["pay", "upi", "card", "invoice", "receipt", "refund", "bill", "transaction"]):
        return {
            "reply": (
                f"💳 **Payments & Invoice Management:**\n\n"
                f"• **Accepted Payment Modes**: UPI (GPay, PhonePe, Paytm, BHIM), Credit/Debit Cards, and Net Banking.\n"
                f"• **Official Invoices**: Download GST-compliant PDF receipts anytime in the **📄 Download Invoice** tab.\n"
                f"• **Refund Policy**: If you cancel or are unsatisfied, refunds are initiated immediately and credited within 2-4 business days."
            ),
            "suggestions": ["📄 Download Invoice", "💳 Make a Payment", "📋 Booking History"],
            "action": "payments"
        }

    # ─────────────────────────────────────────────────────────────────
    # 10. CANCEL OR RESCHEDULE
    # ─────────────────────────────────────────────────────────────────
    if any(k in q_norm for k in ["cancel", "reschedule", "change time", "change date"]):
        return {
            "reply": (
                f"🔄 **Cancellation & Rescheduling:**\n\n"
                f"• You can cancel or reschedule any upcoming booking free of charge up to 30 minutes before technician arrival.\n"
                f"• Navigate to the **📋 Booking History** tab, select your booking, and tap **Cancel Booking** or **Reschedule**."
            ),
            "suggestions": ["📋 Open Booking History", "🚨 Emergency Booking", "💬 Contact Support"]
        }

    # ─────────────────────────────────────────────────────────────────
    # 11. GREETINGS & POLITE INTENTS
    # ─────────────────────────────────────────────────────────────────
    if any(k in q_norm for k in ["hi", "hello", "hey", "namaste", "good morning", "good evening", "good afternoon", "sup", "hlo"]):
        return {
            "reply": (
                f"👋 Hello{name_display}! I'm your FixIt.ai Smart Support Assistant.\n\n"
                f"How can I help you in **{loc}** today?\n"
                f"• 🔧 **Find & suggest top technicians** (Plumbers, Electricians, Cleaners)\n"
                f"• 🚨 **Instant Emergency Booking** (15-20 min arrival)\n"
                f"• 📍 **Track active technician & booking status**\n"
                f"• 💳 **Check rates, pay bills & download invoices**"
            ),
            "suggestions": [
                "🔧 Best Plumber Near Me",
                "⚡ Suggest Electrician",
                "🚨 Emergency Booking",
                "💰 Service Pricing"
            ]
        }

    # ─────────────────────────────────────────────────────────────────
    # 12. FALLBACK WITH CONTEXT SEARCH
    # ─────────────────────────────────────────────────────────────────
    return {
        "reply": (
            f"🤖 I'm here to assist with all your home services in **{loc}**!\n\n"
            f"You can ask me questions like:\n"
            f"• _'Suggest plumber name'_\n"
            f"• _'I want best plumber around me'_\n"
            f"• _'Who is the top electrician?'_\n"
            f"• _'How much does AC cleaning cost?'_\n"
            f"• _'Where is my technician?'_\n\n"
            f"Or click one of the quick options below to get started immediately!"
        ),
        "suggestions": [
            "🔧 Find Best Plumber",
            "⚡ Find Electrician",
            "🚨 Emergency Dispatch",
            "💰 View All Pricing"
        ]
    }


def process_chatbot_query(user_query: str) -> str:
    """Legacy compatibility function returning clean markdown text string."""
    result = get_smart_chat_reply(user_query)
    return result.get("reply", "I am FixIt.ai assistant! How can I assist you today?")