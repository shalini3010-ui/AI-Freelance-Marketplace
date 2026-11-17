import React, { useState, useEffect } from "react";
import API from "../../API/Axios";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await API.get("notifications");
      setNotifications(res.data || []);
    } catch (err) {
      console.warn("Using sample notifications:", err);
      setNotifications([
        { id: "1", type: "payment", title: "Payment Received", message: "₹899 received via UPI for Job #BK-8845.", timestamp: "5 mins ago", is_read: false },
        { id: "2", type: "dispatch", title: "Urgent Dispatch Alert", message: "New emergency request available 1.8km away in Indiranagar.", timestamp: "12 mins ago", is_read: false },
        { id: "3", type: "system", title: "Elite Pro Tier Active", message: "Your 4.9⭐ rating unlocks priority job assignments this week.", timestamp: "3 hours ago", is_read: true }
      ]);
    }
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  };

  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto", fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#0f172a" }}>Alerts & Notifications</h2>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>Payment receipts, dispatch alerts, and service order updates.</p>
        </div>
        <button
          onClick={markAllRead}
          style={{ padding: "6px 12px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer", color: "#475569" }}
        >
          Mark all read
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {notifications.map((item) => (
          <div
            key={item.id}
            style={{
              padding: "14px 18px",
              borderRadius: "10px",
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderLeft: item.type === "payment" ? "4px solid #16a34a" : "4px solid #4f46e5",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>{item.title || "Notification"}</strong>
                {!item.is_read && (
                  <span style={{ fontSize: "10px", background: "#dc2626", color: "#fff", padding: "1px 6px", borderRadius: "8px", fontWeight: "800" }}>
                    NEW
                  </span>
                )}
              </div>
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#475569" }}>{item.message}</p>
            </div>
            <span style={{ fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap" }}>{item.timestamp || item.time || "Recently"}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
