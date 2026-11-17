import React, { useState, useEffect } from 'react';
import API from '../../API/Axios';

const Notifications = () => {
  // Initial fallback notifications to ensure contents display immediately
  const [notifications, setNotifications] = useState([
    {
      id: "notif_101",
      title: "Booking Confirmed! 🔧",
      message: "John Doe has accepted your Plumbing Repair request for today at 4:00 PM.",
      timestamp: "15 mins ago",
      type: "booking",
      is_read: false
    },
    {
      id: "notif_102",
      title: "Payment Received 💳",
      message: "Payment of ₹249 for Invoice #9022 was successfully processed.",
      timestamp: "2 hours ago",
      type: "payment",
      is_read: false
    },
    {
      id: "notif_103",
      title: "Special Discount Offered 🎉",
      message: "Get 15% off on your next AC Servicing booking with code FIXIT15.",
      timestamp: "1 day ago",
      type: "promo",
      is_read: true
    },
    {
      id: "notif_104",
      title: "System Update ⚙️",
      message: "Your profile information was updated successfully.",
      timestamp: "2 days ago",
      type: "system",
      is_read: true
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // 'all', 'unread'

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await API.get('user/notifications/');
        if (res.data && res.data.length > 0) {
          setNotifications(res.data);
        }
      } catch (err) {
        console.log('Using default fallback notifications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_read: true } : item))
    );

    try {
      await API.put(`user/notifications/${id}/read/`);
    } catch (err) {
      console.error('Failed to update read state on server:', err);
    }
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case "booking":
        return { icon: "🔧", bg: "#dbeafe", color: "#1e40af" };
      case "payment":
        return { icon: "💳", bg: "#dcfce7", color: "#166534" };
      case "promo":
        return { icon: "🎉", bg: "#f3e8ff", color: "#6b21a8" };
      default:
        return { icon: "🔔", bg: "#f1f5f9", color: "#334155" };
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const filteredNotifications = notifications.filter((n) =>
    filter === "unread" ? !n.is_read : true
  );

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto", fontFamily: "sans-serif" }}>
      {/* Header Container */}
      <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h2 style={{ margin: 0, fontSize: "22px", color: "#0f172a" }}>Notifications</h2>
              {unreadCount > 0 && (
                <span style={{ background: "#2563eb", color: "#fff", fontSize: "11px", fontWeight: "bold", padding: "2px 8px", borderRadius: "12px" }}>
                  {unreadCount} New
                </span>
              )}
            </div>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "13px" }}>
              Stay updated with your active bookings, payment updates, and service alerts.
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "8px" }}>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{ padding: "6px 12px", background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: "6px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}
              >
                Mark all as read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                style={{ padding: "6px 12px", background: "#f8fafc", color: "#64748b", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "8px", marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
          <button
            onClick={() => setFilter("all")}
            style={{
              padding: "6px 14px",
              borderRadius: "6px",
              border: "none",
              background: filter === "all" ? "#2563eb" : "#f1f5f9",
              color: filter === "all" ? "#fff" : "#475569",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            style={{
              padding: "6px 14px",
              borderRadius: "6px",
              border: "none",
              background: filter === "unread" ? "#2563eb" : "#f1f5f9",
              color: filter === "unread" ? "#fff" : "#475569",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            Unread ({unreadCount})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {loading ? (
          <div style={{ background: "#fff", padding: "30px", textAlign: "center", color: "#64748b", borderRadius: "8px" }}>
            Loading notifications...
          </div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((item) => {
            const badge = getTypeBadge(item.type);
            return (
              <div
                key={item.id}
                onClick={() => !item.is_read && markAsRead(item.id)}
                style={{
                  display: "flex",
                  gap: "14px",
                  padding: "14px",
                  borderRadius: "10px",
                  border: item.is_read ? "1px solid #e2e8f0" : "1px solid #bfdbfe",
                  background: item.is_read ? "#ffffff" : "#f0f9ff",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                {/* Icon */}
                <div style={{ background: badge.bg, width: "40px", height: "40px", borderRadius: "8px", display: "grid", placeItems: "center", fontSize: "18px", flexShrink: 0 }}>
                  {badge.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <strong style={{ fontSize: "14px", color: "#0f172a" }}>{item.title}</strong>
                      {!item.is_read && (
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#2563eb", display: "inline-block" }}></span>
                      )}
                    </div>
                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>{item.timestamp}</span>
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#475569", lineHeight: "1.4" }}>
                    {item.message}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ background: "#fff", padding: "40px", textAlign: "center", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>🔔</div>
            <h4 style={{ margin: 0, color: "#0f172a" }}>No Notifications</h4>
            <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "13px" }}>
              You're all caught up! Records are up to date.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;