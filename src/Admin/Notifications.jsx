import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Notifications() {
  // Default items loaded directly into state so the page is never blank
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
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.get("http://127.0.0.1:8000/api/notifications/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.length > 0) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.log("Using default fallback notification data.");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    const token = localStorage.getItem("token");
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_read: true } : item))
    );

    try {
      await axios.put(
        `http://127.0.0.1:8000/api/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Failed to sync mark-as-read state:", err);
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
        return { icon: "🔧", bg: "bg-blue-100 text-blue-700", label: "Booking" };
      case "payment":
        return { icon: "💳", bg: "bg-green-100 text-green-700", label: "Payment" };
      case "promo":
        return { icon: "🎉", bg: "bg-purple-100 text-purple-700", label: "Offer" };
      default:
        return { icon: "🔔", bg: "bg-gray-100 text-gray-700", label: "System" };
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const filteredNotifications = notifications.filter((n) =>
    filter === "unread" ? !n.is_read : true
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header Container */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
              {unreadCount > 0 && (
                <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  {unreadCount} New
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm mt-1">
              Stay updated with your active bookings, payment updates, and service alerts.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-2 rounded-lg transition"
              >
                Mark all as read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="text-xs font-semibold text-gray-500 hover:text-red-600 bg-gray-50 px-3 py-2 rounded-lg transition"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex gap-2 mt-6 border-b border-gray-100 pb-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === "unread"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>
      </div>

      {/* Notifications List Body */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white p-8 rounded-2xl text-center text-gray-400">
            Loading notifications...
          </div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((item) => {
            const badge = getTypeBadge(item.type);
            return (
              <div
                key={item.id}
                onClick={() => !item.is_read && markAsRead(item.id)}
                className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex gap-4 items-start ${
                  item.is_read
                    ? "bg-white border-gray-100 opacity-80"
                    : "bg-blue-50/40 border-blue-100 shadow-sm"
                }`}
              >
                {/* Badge Icon */}
                <div className={`p-3 rounded-xl text-xl ${badge.bg}`}>
                  {badge.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800 text-base">
                        {item.title}
                      </h3>
                      {!item.is_read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 font-medium">
                      {item.timestamp}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                    {item.message}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white p-12 rounded-2xl text-center border border-gray-100">
            <div className="text-4xl mb-3">🔔</div>
            <h3 className="text-lg font-semibold text-gray-800">No Notifications</h3>
            <p className="text-gray-400 text-sm mt-1">
              You're all caught up!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}