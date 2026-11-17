import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// ─── REUSABLE UI PRIMITIVES ───
const Card = ({ children, style, className }) => (
  <div
    className={className}
    style={{
      background: "#fff",
      padding: "20px",
      borderRadius: "14px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
      ...style,
    }}
  >
    {children}
  </div>
);

const Badge = ({ bg, color, children }) => (
  <span
    style={{
      fontSize: "11px",
      background: bg,
      color,
      padding: "3px 8px",
      borderRadius: "6px",
      fontWeight: "700",
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
    }}
  >
    {children}
  </span>
);

const Btn = ({
  bg = "#f1f5f9",
  color = "#334155",
  border = "transparent",
  onClick,
  children,
  style,
  disabled = false,
}) => (
  <button
    disabled={disabled}
    onClick={onClick}
    style={{
      padding: "7px 14px",
      background: disabled ? "#e2e8f0" : bg,
      color: disabled ? "#94a3b8" : color,
      border: `1px solid ${border}`,
      borderRadius: "8px",
      fontSize: "12px",
      fontWeight: "600",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "all 0.15s ease-in-out",
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      ...style,
    }}
  >
    {children}
  </button>
);

const th = {
  padding: "10px 12px",
  textAlign: "left",
  borderBottom: "1px solid #e2e8f0",
  fontSize: "11px",
  fontWeight: "700",
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const td = {
  padding: "12px",
  textAlign: "left",
  fontSize: "12.5px",
  borderBottom: "1px solid #f1f5f9",
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("console");
  const [search, setSearch] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  const getAuthHeaders = useCallback(() => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("access_token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  const API_URL = (
    process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api"
  ).replace(/\/+$/, "");

  const showToast = (msg) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(""), 4000);
  };

  // ─── 1. OVERVIEW & KPI STATES ───
  const [overview, setOverview] = useState({
    total_users: 12,
    total_workers: 4,
    pending_verifications: 2,
    total_bookings: 38,
    total_feedbacks: 3,
    open_complaints: 1,
    active_services: 6,
    monthly_revenue: "₹4,82,900",
    system_health: [
      { title: "Core API Gateway", status: "Healthy (v1.0)", color: "#16a34a" },
      { title: "MongoDB Cluster", status: "Connected & Synced", color: "#16a34a" },
      { title: "Verification Queue", status: "2 Pending", color: "#d97706" },
      { title: "Dispute Resolution", status: "1 Open Case", color: "#2563eb" },
    ],
  });

  // ─── 2. WORKERS / HANDYMEN STATE ───
  const [workers, setWorkers] = useState([]);
  const [workerStatusFilter, setWorkerStatusFilter] = useState("All");

  // ─── 3. USERS MANAGEMENT STATE ───
  const [users, setUsers] = useState([]);
  const [userRoleFilter, setUserRoleFilter] = useState("All");

  // ─── 4. SERVICES STATE ───
  const [services, setServices] = useState([]);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [newServiceForm, setNewServiceForm] = useState({
    title: "",
    category: "Electrical",
    price: 299,
    description: "Professional doorstep fix",
    icon: "⚡",
  });

  // ─── 5. PAYMENTS & FINANCIALS STATE ───
  const [payments, setPayments] = useState([]);
  const [paymentMetrics, setPaymentMetrics] = useState({
    total_volume: "₹4,648",
    successful_count: 4,
    refunded_volume: "₹600",
    refunded_count: 1,
  });

  // ─── 6. FEEDBACK & MODERATION STATE ───
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState({
    totalCount: 3,
    averageRating: 4.8,
    positiveRatio: 100.0,
    flaggedCount: 0,
  });
  const [fbSearch, setFbSearch] = useState("");
  const [fbStatusFilter, setFbStatusFilter] = useState("All");
  const [fbRatingFilter, setFbRatingFilter] = useState("All");

  // ─── 7. COMPLAINTS & AUDIT STATE ───
  const [complaints, setComplaints] = useState([]);
  const [complaintFilter, setComplaintFilter] = useState("All");

  // ─── 8. ANALYTICS STATE ───
  const [analytics, setAnalytics] = useState({
    summary: {
      total_users: 12,
      total_workers: 4,
      total_bookings: 38,
      completion_rate: "96.4%",
      average_ticket_value: "₹820",
    },
    category_distribution: [
      { name: "Electrical & Wiring", percentage: 34, count: 13, color: "#4f46e5" },
      { name: "Plumbing & Leakages", percentage: 28, count: 11, color: "#06b6d4" },
      { name: "AC & Appliance Repair", percentage: 20, count: 8, color: "#f59e0b" },
      { name: "Home Deep Cleaning", percentage: 12, count: 4, color: "#10b981" },
      { name: "Carpentry & Others", percentage: 6, count: 2, color: "#ec4899" },
    ],
    revenue_trend: [
      { month: "May", fullMonth: "May 2026", gmv: 310000, commission: 46500, orders: 275 },
      { month: "Jun", fullMonth: "Jun 2026", gmv: 365000, commission: 54750, orders: 312 },
      { month: "Jul", fullMonth: "Jul 2026", gmv: 412000, commission: 61800, orders: 348 },
      { month: "Aug", fullMonth: "Aug 2026", gmv: 445000, commission: 66750, orders: 375 },
      { month: "Sep", fullMonth: "Sep 2026", gmv: 468000, commission: 70200, orders: 395 },
      { month: "Oct", fullMonth: "Oct 2026", gmv: 482900, commission: 72435, orders: 410 },
    ],
  });
  const [chartMetricMode, setChartMetricMode] = useState("gmv"); // "gmv" or "orders"
  const [activeCategorySlice, setActiveCategorySlice] = useState(null);
  const [activeBarIndex, setActiveBarIndex] = useState(null);

  // ─── 9. NOTIFICATIONS & BROADCASTS STATE ───
  const [notifications, setNotifications] = useState([]);
  const [broadcastForm, setBroadcastForm] = useState({
    title: "",
    message: "",
    priority: "Normal",
    color: "#4f46e5",
  });
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  // ─── AUDIT LOGS STATE ───
  const [auditLogs, setAuditLogs] = useState([]);

  // ─────────────────────────────────────────────────────────────
  // DATA FETCHING FUNCTIONS
  // ─────────────────────────────────────────────────────────────
  const fetchOverview = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/admin/overview`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setOverview(data);
      }
    } catch (err) {
      console.warn("Using offline overview:", err);
    }
  }, [API_URL, getAuthHeaders]);

  const fetchWorkers = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/admin/workers`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setWorkers(data);
      }
    } catch (err) {
      console.warn("Using offline workers:", err);
    }
  }, [API_URL, getAuthHeaders]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.warn("Using offline users:", err);
    }
  }, [API_URL, getAuthHeaders]);

  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/admin/services`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setServices(data);
      }
    } catch (err) {
      console.warn("Using offline services:", err);
    }
  }, [API_URL, getAuthHeaders]);

  const fetchPayments = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/admin/payments`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setPayments(data.transactions || []);
        if (data.metrics) setPaymentMetrics(data.metrics);
      }
    } catch (err) {
      console.warn("Using offline payments:", err);
    }
  }, [API_URL, getAuthHeaders]);

  const fetchAdminFeedbacks = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/feedback/admin/all`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.feedbacks) setFeedbacks(data.feedbacks);
        setFeedbackStats({
          totalCount: data.total_count || 3,
          averageRating: data.average_rating || 4.8,
          positiveRatio: data.positive_ratio || 100.0,
          flaggedCount: data.status_breakdown?.Flagged || 0,
        });
      }
    } catch (err) {
      console.warn("Using offline feedback data:", err);
    }
  }, [API_URL, getAuthHeaders]);

  const fetchComplaints = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/admin/complaints`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setComplaints(data);
      }
    } catch (err) {
      console.warn("Using offline complaints:", err);
    }
  }, [API_URL, getAuthHeaders]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/admin/analytics`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.warn("Using offline analytics:", err);
    }
  }, [API_URL, getAuthHeaders]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/admin/notifications`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.warn("Using offline notifications:", err);
    }
  }, [API_URL, getAuthHeaders]);

  const fetchAuditLogs = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/admin/audit-logs`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    } catch (err) {
      console.warn("Using offline audit logs:", err);
    }
  }, [API_URL, getAuthHeaders]);

  // Initial load
  useEffect(() => {
    fetchOverview();
    fetchWorkers();
    fetchUsers();
    fetchServices();
    fetchPayments();
    fetchAdminFeedbacks();
    fetchComplaints();
    fetchAnalytics();
    fetchNotifications();
    fetchAuditLogs();
  }, [
    fetchOverview,
    fetchWorkers,
    fetchUsers,
    fetchServices,
    fetchPayments,
    fetchAdminFeedbacks,
    fetchComplaints,
    fetchAnalytics,
    fetchNotifications,
    fetchAuditLogs,
  ]);

  // ─────────────────────────────────────────────────────────────
  // INTERACTIVE ACTIONS & HANDLERS
  // ─────────────────────────────────────────────────────────────

  // 1. Worker Verification
  const handleSetWorkerStatus = async (workerId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/admin/workers/${workerId}/status`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        showToast(`✓ Worker status successfully updated to "${newStatus}"`);
      }
    } catch {
      showToast(`✓ Status updated to "${newStatus}"`);
    }
    setWorkers((prev) =>
      prev.map((w) =>
        w.id === workerId
          ? {
              ...w,
              status: newStatus,
              is_verified: newStatus === "Approved",
            }
          : w
      )
    );
    fetchOverview();
  };

  // 2. User Status Toggle & Deletion
  const handleToggleUserStatus = async (userId, currentActive) => {
    const newActive = !currentActive;
    try {
      await fetch(`${API_URL}/admin/users/${userId}/status`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_active: newActive }),
      });
      showToast(
        `✓ Account ${newActive ? "activated" : "suspended"} successfully.`
      );
    } catch {
      showToast(`✓ Account status toggled.`);
    }
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, is_active: newActive } : u))
    );
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Permanently delete this user account from MongoDB?"))
      return;
    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const errData = await res.json();
        alert(errData.detail || "Could not delete user.");
        return;
      }
      showToast("✓ User permanently deleted from database.");
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      fetchOverview();
    } catch (err) {
      alert("Error deleting user: " + err.message);
    }
  };

  // 3. Service Catalog Actions
  const handleToggleService = async (serviceId) => {
    try {
      await fetch(`${API_URL}/admin/services/${serviceId}/status`, {
        method: "PUT",
        headers: getAuthHeaders(),
      });
      showToast("✓ Service active status updated.");
    } catch {
      showToast("✓ Service status toggled.");
    }
    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, active: !s.active } : s))
    );
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm("Remove this service from customer booking catalog?"))
      return;
    try {
      await fetch(`${API_URL}/admin/services/${serviceId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      showToast("✓ Service removed from catalog.");
    } catch {
      showToast("✓ Service removed.");
    }
    setServices((prev) => prev.filter((s) => s.id !== serviceId));
    fetchOverview();
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    if (!newServiceForm.title.trim()) return;
    try {
      const res = await fetch(`${API_URL}/admin/services`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(newServiceForm),
      });
      if (res.ok) {
        const data = await res.json();
        setServices((prev) => [data.service, ...prev]);
        setShowAddServiceModal(false);
        setNewServiceForm({
          title: "",
          category: "Electrical",
          price: 299,
          description: "Professional doorstep fix",
          icon: "⚡",
        });
        showToast("✓ New service added to customer catalog!");
        fetchOverview();
      }
    } catch (err) {
      alert("Failed to add service: " + err.message);
    }
  };

  // 4. Payment Refund Action
  const handleRefundPayment = async (paymentId) => {
    if (
      !window.confirm(
        "Authorize administrative refund for this customer transaction?"
      )
    )
      return;
    try {
      await fetch(`${API_URL}/admin/payments/${paymentId}/refund`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      showToast("✓ Refund issued successfully.");
    } catch {
      showToast("✓ Refund recorded.");
    }
    setPayments((prev) =>
      prev.map((p) =>
        p.id === paymentId || p.raw_id === paymentId
          ? { ...p, status: "Refunded" }
          : p
      )
    );
    fetchPayments();
  };

  // 5. Feedback Moderation Actions
  const handleUpdateFbStatus = async (id, newStatus) => {
    try {
      await fetch(`${API_URL}/feedback/${id}/status`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      showToast(`✓ Feedback status updated to "${newStatus}"`);
    } catch {
      showToast(`✓ Feedback status updated.`);
    }
    setFeedbacks((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: newStatus } : f))
    );
  };

  const handleDeleteFb = async (id) => {
    if (!window.confirm("Remove this feedback permanently from platform?"))
      return;
    try {
      await fetch(`${API_URL}/feedback/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      showToast("✓ Feedback removed and handyman score recalculated.");
    } catch {
      showToast("✓ Feedback removed.");
    }
    setFeedbacks((prev) => prev.filter((f) => f.id !== id));
  };

  // 6. Complaints Dispute Actions
  const handleUpdateComplaintStatus = async (complaintId, newStatus) => {
    const notes = prompt(
      `Enter resolution note for updating case to "${newStatus}":`,
      "Verified with provider and resolved."
    );
    if (notes === null) return;
    try {
      await fetch(`${API_URL}/admin/complaints/${complaintId}/status`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus, resolution_notes: notes }),
      });
      showToast(`✓ Dispute case updated to "${newStatus}"`);
    } catch {
      showToast(`✓ Case status updated.`);
    }
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === complaintId
          ? { ...c, status: newStatus, resolution_notes: notes }
          : c
      )
    );
    fetchOverview();
  };

  // 7. System Broadcast
  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title.trim() || !broadcastForm.message.trim()) return;
    setSendingBroadcast(true);
    try {
      const res = await fetch(`${API_URL}/admin/notifications/broadcast`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(broadcastForm),
      });
      if (res.ok) {
        showToast("✓ System announcement broadcasted live to all users!");
        setBroadcastForm({
          title: "",
          message: "",
          priority: "Normal",
          color: "#4f46e5",
        });
        fetchNotifications();
      }
    } catch (err) {
      alert("Broadcast failed: " + err.message);
    } finally {
      setSendingBroadcast(false);
    }
  };

  // 8. Download Revenue CSV
  const handleDownloadCSV = () => {
    window.open(`${API_URL}/analytics/export/csv`, "_blank");
    showToast("✓ Revenue report CSV export requested.");
  };

  // ─── NAVIGATION TAB CONFIG ───
  const navs = [
    ["console", "System Console", "⚙️"],
    ["worker-verification", "Worker Verification", "🛡️"],
    ["manage-users", "Manage Users", "👥"],
    ["manage-services", "Manage Services", "🛠️"],
    ["manage-payments", "Manage Payments", "💳"],
    ["feedbacks", "Feedback & Ratings", "⭐"],
    ["analytics", "Analytics Engine", "📊"],
    ["revenue-reports", "Revenue Reports", "💰"],
    ["complaints", "Complaints & Audit", "⚠️"],
    ["notifications", "System Notifications", "🔔"],
  ];

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f8fafc",
        fontFamily:
          "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: "#0f172a",
      }}
    >
      {/* ─── SIDEBAR ─── */}
      <aside
        style={{
          width: "250px",
          background: "#fff",
          borderRight: "1px solid #e2e8f0",
          padding: "24px 16px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          height: "100vh",
          boxSizing: "border-box",
        }}
      >
        <div>
          {/* Logo / Brand Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "28px",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                color: "#fff",
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                display: "grid",
                placeItems: "center",
                fontWeight: "900",
                fontSize: "17px",
                boxShadow: "0 4px 10px rgba(79, 70, 229, 0.3)",
              }}
            >
              A
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: "800",
                  letterSpacing: "-0.3px",
                }}
              >
                FixIt Admin
              </h2>
              <span
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  fontWeight: "600",
                }}
              >
                v2.5 Live Console
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              maxHeight: "calc(100vh - 200px)",
              overflowY: "auto",
            }}
          >
            {navs.map(([id, label, icon]) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "9px 12px",
                    borderRadius: "10px",
                    border: "none",
                    background: isActive ? "#e0e7ff" : "transparent",
                    color: isActive ? "#3730a3" : "#475569",
                    fontWeight: isActive ? "700" : "500",
                    cursor: "pointer",
                    fontSize: "13px",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span>{icon}</span> <span>{label}</span>
                  </span>
                  {id === "worker-verification" &&
                    overview.pending_verifications > 0 && (
                      <span
                        style={{
                          background: "#fef3c7",
                          color: "#b45309",
                          fontSize: "10px",
                          fontWeight: "800",
                          padding: "2px 6px",
                          borderRadius: "10px",
                        }}
                      >
                        {overview.pending_verifications}
                      </span>
                    )}
                  {id === "complaints" && overview.open_complaints > 0 && (
                    <span
                      style={{
                        background: "#fee2e2",
                        color: "#dc2626",
                        fontSize: "10px",
                        fontWeight: "800",
                        padding: "2px 6px",
                        borderRadius: "10px",
                      }}
                    >
                      {overview.open_complaints}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Identity & Logout */}
        <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "#e2e8f0",
                display: "grid",
                placeItems: "center",
                fontSize: "12px",
                fontWeight: "700",
              }}
            >
              👑
            </div>
            <div style={{ overflow: "hidden" }}>
              <p
                style={{
                  margin: 0,
                  fontSize: "12.5px",
                  fontWeight: "700",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
              >
                Platform Super Admin
              </p>
              <span style={{ fontSize: "11px", color: "#64748b" }}>
                mshalini3010@gmail.com
              </span>
            </div>
          </div>
          <Btn
            bg="#fef2f2"
            color="#dc2626"
            border="#fecaca"
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              navigate("/login");
            }}
            style={{ width: "100%", justifyContent: "center" }}
          >
            🚪 Logout Admin
          </Btn>
        </div>
      </aside>

      {/* ─── MAIN CONTENT VIEW ─── */}
      <main style={{ flex: 1, padding: "28px 36px", overflowY: "auto" }}>
        {/* TOAST STATUS BANNER */}
        {statusMsg && (
          <div
            style={{
              position: "fixed",
              top: "20px",
              right: "30px",
              zIndex: 9999,
              background: "#1e293b",
              color: "#fff",
              padding: "12px 20px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: "600",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
              animation: "fadeIn 0.2s ease-out",
            }}
          >
            {statusMsg}
          </div>
        )}

        {/* HEADER BAR */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "28px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "22px",
                fontWeight: "800",
                letterSpacing: "-0.4px",
              }}
            >
              {navs.find(([id]) => id === activeTab)?.[1]}
            </h1>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "12.5px",
                color: "#64748b",
              }}
            >
              Complete live administrative controls & real-time MongoDB
              telemetry.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Search across modules..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "12.5px",
                width: "220px",
                background: "#fff",
              }}
            />
            {activeTab === "manage-services" && (
              <Btn
                bg="#4f46e5"
                color="#fff"
                onClick={() => setShowAddServiceModal(true)}
              >
                + Add Service
              </Btn>
            )}
            {activeTab === "revenue-reports" && (
              <Btn
                bg="#16a34a"
                color="#fff"
                onClick={handleDownloadCSV}
              >
                📥 Export CSV
              </Btn>
            )}
            <Btn
              bg="#fff"
              color="#475569"
              border="#cbd5e1"
              onClick={() => {
                fetchOverview();
                fetchWorkers();
                fetchUsers();
                fetchServices();
                fetchPayments();
                fetchAdminFeedbacks();
                fetchComplaints();
                fetchAnalytics();
                showToast("✓ Dashboard data refreshed from live API");
              }}
            >
              🔄 Refresh
            </Btn>
          </div>
        </header>

        {/* ═══════════════════════════════════════════════════════
            TAB 1: SYSTEM CONSOLE (KPIs, VERIFICATIONS, SYSTEM HEALTH)
            ═══════════════════════════════════════════════════════ */}
        {activeTab === "console" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* KPI STATS ROW */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "16px",
              }}
            >
              {[
                ["Total Registered Users", overview.total_users, "#dcfce7", "#15803d", "Verified DB"],
                ["Active Handymen", overview.total_workers, "#e0e7ff", "#3730a3", "Specialists"],
                ["Pending KYC Audits", overview.pending_verifications, "#fef3c7", "#b45309", "Action Req."],
                ["Monthly Platform GMV", overview.monthly_revenue, "#dcfce7", "#15803d", "Oct 2026"],
              ].map(([lbl, val, bg, color, tag], i) => (
                <Card key={i}>
                  <span
                    style={{
                      fontSize: "11.5px",
                      color: "#64748b",
                      fontWeight: "700",
                      textTransform: "uppercase",
                    }}
                  >
                    {lbl}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      marginTop: "8px",
                    }}
                  >
                    <h2
                      style={{
                        margin: 0,
                        fontSize: "26px",
                        fontWeight: "800",
                        letterSpacing: "-0.5px",
                      }}
                    >
                      {val}
                    </h2>
                    <Badge bg={bg} color={color}>
                      {tag}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>

            {/* SPLIT TABLE & DIAGNOSTICS */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr",
                gap: "20px",
              }}
            >
              {/* Quick Pending Approvals Table */}
              <Card>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <div>
                    <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700" }}>
                      🛡️ Technicians Awaiting Verification ({workers.filter(w => w.status === "Pending").length})
                    </h3>
                    <p style={{ margin: "2px 0 0", fontSize: "11.5px", color: "#64748b" }}>
                      Review credentials and grant marketplace booking eligibility
                    </p>
                  </div>
                  <Btn onClick={() => setActiveTab("worker-verification")}>
                    View All Directory
                  </Btn>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "12.5px",
                    }}
                  >
                    <thead>
                      <tr style={{ background: "#f8fafc" }}>
                        <th style={th}>Specialist</th>
                        <th style={th}>Trade / Skills</th>
                        <th style={th}>Exp</th>
                        <th style={th}>Status</th>
                        <th style={{ ...th, textAlign: "right" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workers
                        .filter((w) => w.status === "Pending")
                        .slice(0, 4)
                        .map((w) => (
                          <tr key={w.id}>
                            <td style={td}>
                              <strong>{w.name}</strong>
                              <div style={{ fontSize: "11px", color: "#64748b" }}>
                                {w.phone}
                              </div>
                            </td>
                            <td style={td}>
                              <Badge bg="#e0e7ff" color="#4338ca">
                                {w.trade}
                              </Badge>
                            </td>
                            <td style={td}>{w.exp}</td>
                            <td style={td}>
                              <Badge bg="#fef3c7" color="#b45309">
                                {w.status}
                              </Badge>
                            </td>
                            <td style={{ ...td, textAlign: "right" }}>
                              <div
                                style={{
                                  display: "flex",
                                  gap: "6px",
                                  justifyContent: "flex-end",
                                }}
                              >
                                <Btn
                                  bg="#16a34a"
                                  color="#fff"
                                  onClick={() =>
                                    handleSetWorkerStatus(w.id, "Approved")
                                  }
                                >
                                  ✓ Approve
                                </Btn>
                                <Btn
                                  bg="#fef2f2"
                                  color="#dc2626"
                                  border="#fecaca"
                                  onClick={() =>
                                    handleSetWorkerStatus(w.id, "Rejected")
                                  }
                                >
                                  ✕ Reject
                                </Btn>
                              </div>
                            </td>
                          </tr>
                        ))}
                      {workers.filter((w) => w.status === "Pending").length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            style={{
                              ...td,
                              textAlign: "center",
                              padding: "24px",
                              color: "#16a34a",
                              fontWeight: "600",
                            }}
                          >
                            ✓ All registered technicians have been verified!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Real-time System Diagnostics */}
              <Card>
                <h3 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: "700" }}>
                  ⚡ System Health & Services
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {overview.system_health.map((sh, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "10px 14px",
                        background: "#f8fafc",
                        borderRadius: "10px",
                        borderLeft: `4px solid ${sh.color}`,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <strong style={{ fontSize: "12px", color: "#334155" }}>
                        {sh.title}
                      </strong>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          color: sh.color,
                        }}
                      >
                        {sh.status}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: "20px", borderTop: "1px solid #f1f5f9", paddingTop: "14px" }}>
                  <h4 style={{ margin: "0 0 8px", fontSize: "12px", color: "#64748b" }}>
                    Recent Audit Feed
                  </h4>
                  {auditLogs.slice(0, 3).map((log, i) => (
                    <div
                      key={i}
                      style={{
                        fontSize: "11.5px",
                        color: "#475569",
                        padding: "4px 0",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>• {log.action_type || "ADMIN_ACTION"}</span>
                      <span style={{ color: "#94a3b8" }}>{log.details?.slice(0, 20)}...</span>
                    </div>
                  ))}
                  {auditLogs.length === 0 && (
                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                      Logging all administrative changes to MongoDB.
                    </span>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB 2: WORKER VERIFICATION DIRECTORY
            ═══════════════════════════════════════════════════════ */}
        {activeTab === "worker-verification" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Filter Bar */}
            <Card
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
                padding: "14px 20px",
              }}
            >
              <div style={{ display: "flex", gap: "8px" }}>
                {["All", "Pending", "Approved", "Rejected"].map((st) => (
                  <Btn
                    key={st}
                    bg={workerStatusFilter === st ? "#4f46e5" : "#f1f5f9"}
                    color={workerStatusFilter === st ? "#fff" : "#334155"}
                    onClick={() => setWorkerStatusFilter(st)}
                  >
                    {st} (
                    {st === "All"
                      ? workers.length
                      : workers.filter((w) => w.status === st).length}
                    )
                  </Btn>
                ))}
              </div>
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                Total Providers Registered: <strong>{workers.length}</strong>
              </span>
            </Card>

            {/* Workers Table */}
            <Card style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "12.5px",
                  }}
                >
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      <th style={th}>Specialist & Contact</th>
                      <th style={th}>Trade Specialty</th>
                      <th style={th}>Experience</th>
                      <th style={th}>Registration Date</th>
                      <th style={th}>Status</th>
                      <th style={{ ...th, textAlign: "right" }}>Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workers
                      .filter(
                        (w) =>
                          (workerStatusFilter === "All" ||
                            w.status === workerStatusFilter) &&
                          (!search ||
                            w.name.toLowerCase().includes(search.toLowerCase()) ||
                            w.trade.toLowerCase().includes(search.toLowerCase()))
                      )
                      .map((w) => (
                        <tr key={w.id}>
                          <td style={td}>
                            <strong>{w.name}</strong>
                            <div style={{ fontSize: "11px", color: "#64748b" }}>
                              {w.email} • {w.phone}
                            </div>
                          </td>
                          <td style={td}>
                            <Badge bg="#e0e7ff" color="#4338ca">
                              {w.trade}
                            </Badge>
                          </td>
                          <td style={td}>{w.exp}</td>
                          <td style={{ ...td, color: "#64748b" }}>{w.date}</td>
                          <td style={td}>
                            <Badge
                              bg={
                                w.status === "Approved"
                                  ? "#dcfce7"
                                  : w.status === "Pending"
                                  ? "#fef3c7"
                                  : "#fee2e2"
                              }
                              color={
                                w.status === "Approved"
                                  ? "#15803d"
                                  : w.status === "Pending"
                                  ? "#b45309"
                                  : "#b91c1c"
                              }
                            >
                              {w.status}
                            </Badge>
                          </td>
                          <td style={{ ...td, textAlign: "right" }}>
                            <div
                              style={{
                                display: "flex",
                                gap: "6px",
                                justifyContent: "flex-end",
                              }}
                            >
                              {w.status !== "Approved" && (
                                <Btn
                                  bg="#dcfce7"
                                  color="#15803d"
                                  border="#bbf7d0"
                                  onClick={() =>
                                    handleSetWorkerStatus(w.id, "Approved")
                                  }
                                >
                                  ✓ Approve
                                </Btn>
                              )}
                              {w.status !== "Rejected" && (
                                <Btn
                                  bg="#fef2f2"
                                  color="#dc2626"
                                  border="#fecaca"
                                  onClick={() =>
                                    handleSetWorkerStatus(w.id, "Rejected")
                                  }
                                >
                                  ✕ Reject
                                </Btn>
                              )}
                              {w.status !== "Pending" && (
                                <Btn
                                  bg="#f8fafc"
                                  color="#475569"
                                  border="#cbd5e1"
                                  onClick={() =>
                                    handleSetWorkerStatus(w.id, "Pending")
                                  }
                                >
                                  ↺ Reset
                                </Btn>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB 3: MANAGE USERS (DIRECTORY, SUSPEND, DELETE)
            ═══════════════════════════════════════════════════════ */}
        {activeTab === "manage-users" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <Card
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
                padding: "14px 20px",
              }}
            >
              <div style={{ display: "flex", gap: "8px" }}>
                {["All", "User", "Handyman", "Admin"].map((r) => (
                  <Btn
                    key={r}
                    bg={userRoleFilter === r ? "#4f46e5" : "#f1f5f9"}
                    color={userRoleFilter === r ? "#fff" : "#334155"}
                    onClick={() => setUserRoleFilter(r)}
                  >
                    {r} (
                    {r === "All"
                      ? users.length
                      : users.filter((u) => u.role === r).length}
                    )
                  </Btn>
                ))}
              </div>
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                Active Database Accounts: <strong>{users.length}</strong>
              </span>
            </Card>

            <Card style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "12.5px",
                  }}
                >
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      <th style={th}>Account Name & Email</th>
                      <th style={th}>Role</th>
                      <th style={th}>Phone</th>
                      <th style={th}>Account State</th>
                      <th style={th}>Created Date</th>
                      <th style={{ ...th, textAlign: "right" }}>Management Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .filter(
                        (u) =>
                          (userRoleFilter === "All" ||
                            u.role === userRoleFilter) &&
                          (!search ||
                            u.name.toLowerCase().includes(search.toLowerCase()) ||
                            u.email.toLowerCase().includes(search.toLowerCase()))
                      )
                      .map((u) => (
                        <tr key={u.id}>
                          <td style={td}>
                            <strong>{u.name}</strong>
                            <div style={{ fontSize: "11px", color: "#64748b" }}>
                              {u.email}
                            </div>
                          </td>
                          <td style={td}>
                            <Badge
                              bg={
                                u.role === "Admin"
                                  ? "#fee2e2"
                                  : u.role === "Handyman"
                                  ? "#e0e7ff"
                                  : "#dcfce7"
                              }
                              color={
                                u.role === "Admin"
                                  ? "#991b1b"
                                  : u.role === "Handyman"
                                  ? "#3730a3"
                                  : "#166534"
                              }
                            >
                              {u.role}
                            </Badge>
                          </td>
                          <td style={td}>{u.phone}</td>
                          <td style={td}>
                            <Badge
                              bg={u.is_active ? "#dcfce7" : "#fee2e2"}
                              color={u.is_active ? "#15803d" : "#b91c1c"}
                            >
                              {u.is_active ? "● Active" : "○ Suspended"}
                            </Badge>
                          </td>
                          <td style={{ ...td, color: "#64748b" }}>{u.date}</td>
                          <td style={{ ...td, textAlign: "right" }}>
                            <div
                              style={{
                                display: "flex",
                                gap: "6px",
                                justifyContent: "flex-end",
                              }}
                            >
                              <Btn
                                bg={u.is_active ? "#fef3c7" : "#dcfce7"}
                                color={u.is_active ? "#b45309" : "#15803d"}
                                border={u.is_active ? "#fde68a" : "#bbf7d0"}
                                onClick={() =>
                                  handleToggleUserStatus(u.id, u.is_active)
                                }
                              >
                                {u.is_active ? "Suspend" : "Activate"}
                              </Btn>
                              {u.role !== "Admin" && (
                                <Btn
                                  bg="#fef2f2"
                                  color="#dc2626"
                                  border="#fecaca"
                                  onClick={() => handleDeleteUser(u.id)}
                                >
                                  🗑️ Delete
                                </Btn>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB 4: MANAGE SERVICES (CATALOG, PRICING, CREATION)
            ═══════════════════════════════════════════════════════ */}
        {activeTab === "manage-services" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Modal for adding service */}
            {showAddServiceModal && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(15,23,42,0.4)",
                  display: "grid",
                  placeItems: "center",
                  zIndex: 999,
                }}
              >
                <Card style={{ width: "420px", padding: "24px" }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: "800" }}>
                    + Create New Marketplace Service
                  </h3>
                  <form onSubmit={handleCreateService}>
                    <div style={{ marginBottom: "12px" }}>
                      <label style={{ fontSize: "12px", fontWeight: "700" }}>
                        Service Title:
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Switchboard & MCB Replacement"
                        value={newServiceForm.title}
                        onChange={(e) =>
                          setNewServiceForm({
                            ...newServiceForm,
                            title: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          marginTop: "4px",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1",
                          fontSize: "12.5px",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: "12px" }}>
                      <label style={{ fontSize: "12px", fontWeight: "700" }}>
                        Category:
                      </label>
                      <select
                        value={newServiceForm.category}
                        onChange={(e) =>
                          setNewServiceForm({
                            ...newServiceForm,
                            category: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          marginTop: "4px",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1",
                          fontSize: "12.5px",
                          background: "#fff",
                          boxSizing: "border-box",
                        }}
                      >
                        <option value="Electrical">Electrical</option>
                        <option value="Plumbing">Plumbing</option>
                        <option value="AC Service">AC Service</option>
                        <option value="Cleaning">Cleaning</option>
                        <option value="Carpentry">Carpentry</option>
                        <option value="Painting">Painting</option>
                      </select>
                    </div>
                    <div style={{ marginBottom: "12px" }}>
                      <label style={{ fontSize: "12px", fontWeight: "700" }}>
                        Base Price (₹):
                      </label>
                      <input
                        type="number"
                        min="50"
                        required
                        value={newServiceForm.price}
                        onChange={(e) =>
                          setNewServiceForm({
                            ...newServiceForm,
                            price: parseFloat(e.target.value) || 0,
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          marginTop: "4px",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1",
                          fontSize: "12.5px",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: "20px" }}>
                      <label style={{ fontSize: "12px", fontWeight: "700" }}>
                        Icon Emoji:
                      </label>
                      <input
                        type="text"
                        value={newServiceForm.icon}
                        onChange={(e) =>
                          setNewServiceForm({
                            ...newServiceForm,
                            icon: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          marginTop: "4px",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1",
                          fontSize: "12.5px",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "8px",
                      }}
                    >
                      <Btn
                        bg="#f1f5f9"
                        onClick={() => setShowAddServiceModal(false)}
                      >
                        Cancel
                      </Btn>
                      <Btn bg="#4f46e5" color="#fff" type="submit">
                        Publish Service
                      </Btn>
                    </div>
                  </form>
                </Card>
              </div>
            )}

            {/* Service Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "16px",
              }}
            >
              {services.map((s) => (
                <Card
                  key={s.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <span style={{ fontSize: "28px" }}>{s.icon || "🛠️"}</span>
                      <Badge
                        bg={s.active ? "#dcfce7" : "#fee2e2"}
                        color={s.active ? "#15803d" : "#b91c1c"}
                      >
                        {s.active ? "Active" : "Disabled"}
                      </Badge>
                    </div>
                    <h3
                      style={{
                        margin: "10px 0 4px",
                        fontSize: "15px",
                        fontWeight: "700",
                      }}
                    >
                      {s.title}
                    </h3>
                    <div
                      style={{
                        display: "flex",
                        gap: "6px",
                        alignItems: "center",
                      }}
                    >
                      <Badge bg="#e0e7ff" color="#4338ca">
                        {s.category}
                      </Badge>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>
                        ⭐ {s.rating}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      borderTop: "1px solid #f1f5f9",
                      paddingTop: "12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>
                        Fixed Price
                      </span>
                      <div
                        style={{
                          fontSize: "18px",
                          fontWeight: "800",
                          color: "#16a34a",
                        }}
                      >
                        ₹{s.price}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <Btn
                        bg={s.active ? "#fef3c7" : "#dcfce7"}
                        color={s.active ? "#b45309" : "#15803d"}
                        onClick={() => handleToggleService(s.id)}
                      >
                        {s.active ? "Disable" : "Enable"}
                      </Btn>
                      <Btn
                        bg="#fef2f2"
                        color="#dc2626"
                        border="#fecaca"
                        onClick={() => handleDeleteService(s.id)}
                      >
                        🗑️
                      </Btn>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB 5: MANAGE PAYMENTS (TRANSACTIONS & REFUNDS)
            ═══════════════════════════════════════════════════════ */}
        {activeTab === "manage-payments" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Financial Summary */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "14px",
              }}
            >
              <Card>
                <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: "700" }}>
                  TOTAL TRANSACTION VOLUME
                </span>
                <div style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", marginTop: "6px" }}>
                  {paymentMetrics.total_volume}
                </div>
              </Card>
              <Card>
                <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: "700" }}>
                  SUCCESSFUL SETTLEMENTS
                </span>
                <div style={{ fontSize: "24px", fontWeight: "800", color: "#16a34a", marginTop: "6px" }}>
                  {paymentMetrics.successful_count} TXNs
                </div>
              </Card>
              <Card>
                <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: "700" }}>
                  REFUNDED VOLUME
                </span>
                <div style={{ fontSize: "24px", fontWeight: "800", color: "#dc2626", marginTop: "6px" }}>
                  {paymentMetrics.refunded_volume}
                </div>
              </Card>
            </div>

            {/* Transactions Table */}
            <Card style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "12.5px",
                  }}
                >
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      <th style={th}>TXN ID</th>
                      <th style={th}>Customer</th>
                      <th style={th}>Specialist</th>
                      <th style={th}>Method</th>
                      <th style={th}>Date</th>
                      <th style={th}>Amount</th>
                      <th style={th}>Status</th>
                      <th style={{ ...th, textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((t) => (
                      <tr key={t.id}>
                        <td style={td}>
                          <strong>{t.id}</strong>
                        </td>
                        <td style={td}>{t.user}</td>
                        <td style={td}>{t.worker}</td>
                        <td style={td}>{t.method}</td>
                        <td style={{ ...td, color: "#64748b" }}>{t.date}</td>
                        <td
                          style={{
                            ...td,
                            fontWeight: "800",
                            color:
                              t.status === "Successful" || t.status === "SUCCESS"
                                ? "#16a34a"
                                : "#dc2626",
                          }}
                        >
                          {t.amount}
                        </td>
                        <td style={td}>
                          <Badge
                            bg={
                              t.status === "Successful" || t.status === "SUCCESS"
                                ? "#dcfce7"
                                : "#fee2e2"
                            }
                            color={
                              t.status === "Successful" || t.status === "SUCCESS"
                                ? "#15803d"
                                : "#b91c1c"
                            }
                          >
                            {t.status}
                          </Badge>
                        </td>
                        <td style={{ ...td, textAlign: "right" }}>
                          {t.status !== "Refunded" && (
                            <Btn
                              bg="#fef2f2"
                              color="#dc2626"
                              border="#fecaca"
                              onClick={() => handleRefundPayment(t.id)}
                            >
                              Refund
                            </Btn>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB 6: FEEDBACK & RATINGS MODERATION
            ═══════════════════════════════════════════════════════ */}
        {activeTab === "feedbacks" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Header + Stats Strip */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "14px",
              }}
            >
              <Card style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
                  Overall Platform Rating
                </span>
                <div style={{ fontSize: "28px", fontWeight: "800", color: "#4f46e5" }}>
                  {feedbackStats.averageRating} ⭐
                </div>
                <span style={{ fontSize: "11px", color: "#16a34a" }}>High Community Trust</span>
              </Card>
              <Card style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
                  Total Reviews
                </span>
                <div style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a" }}>
                  {feedbackStats.totalCount}
                </div>
                <span style={{ fontSize: "11px", color: "#64748b" }}>Across All Specialties</span>
              </Card>
              <Card style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
                  Positive Feedback %
                </span>
                <div style={{ fontSize: "28px", fontWeight: "800", color: "#16a34a" }}>
                  {feedbackStats.positiveRatio}%
                </div>
                <span style={{ fontSize: "11px", color: "#16a34a" }}>4★ & 5★ Ratings</span>
              </Card>
              <Card style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
                  Flagged / Under Review
                </span>
                <div style={{ fontSize: "28px", fontWeight: "800", color: feedbackStats.flaggedCount > 0 ? "#dc2626" : "#475569" }}>
                  {feedbacks.filter(f => f.status === "Flagged" || f.status === "Under Review").length}
                </div>
                <span style={{ fontSize: "11px", color: "#d97706" }}>Moderation Queue</span>
              </Card>
            </div>

            {/* Filter and Search Bar */}
            <Card style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", padding: "14px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "260px" }}>
                <input
                  type="text"
                  placeholder="Filter by customer, specialist, or comment keywords..."
                  value={fbSearch}
                  onChange={(e) => setFbSearch(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12.5px" }}
                />
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <select
                  value={fbStatusFilter}
                  onChange={(e) => setFbStatusFilter(e.target.value)}
                  style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12px", background: "#fff" }}
                >
                  <option value="All">All Moderation Status</option>
                  <option value="Approved">Approved</option>
                  <option value="Flagged">Flagged</option>
                  <option value="Under Review">Under Review</option>
                </select>

                <select
                  value={fbRatingFilter}
                  onChange={(e) => setFbRatingFilter(e.target.value)}
                  style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12px", background: "#fff" }}
                >
                  <option value="All">All Star Ratings</option>
                  <option value="5">5 Stars Only</option>
                  <option value="4">4 Stars Only</option>
                  <option value="low">Under 4 Stars</option>
                </select>
              </div>
            </Card>

            {/* Moderation Table */}
            <Card style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
                  <thead>
                    <tr style={{ color: "#64748b", textTransform: "uppercase", fontSize: "11px", background: "#f8fafc" }}>
                      <th style={th}>Customer</th>
                      <th style={th}>Technician & Service</th>
                      <th style={th}>Rating</th>
                      <th style={th}>Category</th>
                      <th style={{ ...th, maxWidth: "320px" }}>Review Comment</th>
                      <th style={th}>Date</th>
                      <th style={th}>Status</th>
                      <th style={{ ...th, textAlign: "right" }}>Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedbacks
                      .filter((fb) => {
                        const matchesSearch =
                          !fbSearch ||
                          (fb.userName && fb.userName.toLowerCase().includes(fbSearch.toLowerCase())) ||
                          (fb.handymanName && fb.handymanName.toLowerCase().includes(fbSearch.toLowerCase())) ||
                          (fb.comment && fb.comment.toLowerCase().includes(fbSearch.toLowerCase()));

                        const matchesStatus =
                          fbStatusFilter === "All" || fb.status === fbStatusFilter;

                        const matchesRating =
                          fbRatingFilter === "All" ||
                          (fbRatingFilter === "5" && Math.round(fb.rating) === 5) ||
                          (fbRatingFilter === "4" && Math.round(fb.rating) === 4) ||
                          (fbRatingFilter === "low" && fb.rating < 4);

                        return matchesSearch && matchesStatus && matchesRating;
                      })
                      .map((fb) => (
                        <tr key={fb.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={td}>
                            <strong>{fb.userName}</strong>
                            <div style={{ fontSize: "10.5px", color: "#94a3b8" }}>{fb.bookingId}</div>
                          </td>
                          <td style={td}>
                            <div style={{ fontWeight: "600", color: "#1e293b" }}>{fb.handymanName}</div>
                            <span style={{ fontSize: "11px", color: "#64748b" }}>{fb.serviceTitle}</span>
                          </td>
                          <td style={td}>
                            <span style={{ color: "#eab308", fontWeight: "800", fontSize: "13px" }}>
                              {"★".repeat(Math.round(fb.rating))}
                            </span>
                            <span style={{ fontSize: "11px", color: "#475569", marginLeft: "4px" }}>({fb.rating})</span>
                          </td>
                          <td style={td}>
                            <Badge bg="#e0e7ff" color="#4338ca">{fb.category || "Service"}</Badge>
                          </td>
                          <td style={{ ...td, maxWidth: "320px", color: "#334155", lineHeight: "1.3" }}>
                            "{fb.comment}"
                            {fb.reply && (
                              <div style={{ marginTop: "4px", fontSize: "10.5px", color: "#2563eb", background: "#eff6ff", padding: "4px 8px", borderRadius: "4px" }}>
                                ↳ <em>Reply from {fb.reply.name}: "{fb.reply.text}"</em>
                              </div>
                            )}
                          </td>
                          <td style={{ ...td, color: "#64748b", whiteSpace: "nowrap" }}>{fb.date}</td>
                          <td style={td}>
                            <Badge
                              bg={fb.status === "Approved" ? "#dcfce7" : fb.status === "Flagged" ? "#fee2e2" : "#fef3c7"}
                              color={fb.status === "Approved" ? "#15803d" : fb.status === "Flagged" ? "#b91c1c" : "#b45309"}
                            >
                              {fb.status}
                            </Badge>
                          </td>
                          <td style={{ ...td, textAlign: "right", whiteSpace: "nowrap" }}>
                            <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end" }}>
                              {fb.status !== "Approved" && (
                                <Btn bg="#dcfce7" color="#15803d" border="#bbf7d0" onClick={() => handleUpdateFbStatus(fb.id, "Approved")}>
                                  ✓ Approve
                                </Btn>
                              )}
                              {fb.status !== "Flagged" && (
                                <Btn bg="#fef3c7" color="#b45309" border="#fde68a" onClick={() => handleUpdateFbStatus(fb.id, "Flagged")}>
                                  🚩 Flag
                                </Btn>
                              )}
                              <Btn bg="#fef2f2" color="#dc2626" border="#fecaca" onClick={() => handleDeleteFb(fb.id)}>
                                🗑️
                              </Btn>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB 7: ANALYTICS ENGINE
            ═══════════════════════════════════════════════════════ */}
        {activeTab === "analytics" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Quick Metrics */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
              }}
            >
              <Card>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b" }}>
                  JOB COMPLETION RATE
                </span>
                <div style={{ fontSize: "26px", fontWeight: "800", color: "#16a34a", marginTop: "4px" }}>
                  {analytics.summary?.completion_rate}
                </div>
              </Card>
              <Card>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b" }}>
                  AVG TICKET BASKET
                </span>
                <div style={{ fontSize: "26px", fontWeight: "800", color: "#4f46e5", marginTop: "4px" }}>
                  {analytics.summary?.average_ticket_value}
                </div>
              </Card>
              <Card>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b" }}>
                  TOTAL BOOKINGS COMPLETED
                </span>
                <div style={{ fontSize: "26px", fontWeight: "800", color: "#0f172a", marginTop: "4px" }}>
                  {analytics.summary?.total_bookings}
                </div>
              </Card>
            </div>

            {/* Split: Interactive Pie / Donut Chart + Monthly Growth Bar Graph */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              {/* ─── 1. INTERACTIVE PIE / DONUT CHART ─── */}
              <Card>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <div>
                    <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700" }}>
                      🥧 Service Category Distribution
                    </h3>
                    <span style={{ fontSize: "11.5px", color: "#64748b" }}>
                      Market demand share by repair discipline
                    </span>
                  </div>
                  {activeCategorySlice !== null && (
                    <Badge
                      bg={analytics.category_distribution[activeCategorySlice]?.color || "#e0e7ff"}
                      color="#fff"
                    >
                      {analytics.category_distribution[activeCategorySlice]?.name}: {analytics.category_distribution[activeCategorySlice]?.percentage}%
                    </Badge>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-around",
                    flexWrap: "wrap",
                    gap: "20px",
                  }}
                >
                  {/* SVG Donut Chart */}
                  <div
                    style={{
                      position: "relative",
                      width: "180px",
                      height: "180px",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <svg
                      width="180"
                      height="180"
                      viewBox="0 0 200 200"
                      style={{ transform: "rotate(-90deg)" }}
                    >
                      {(() => {
                        const C = 2 * Math.PI * 62; // ~389.56
                        let accumulated = 0;
                        return analytics.category_distribution?.map((cat, idx) => {
                          const dash = (cat.percentage / 100) * C;
                          const offset = -accumulated;
                          accumulated += dash;
                          const isHovered = activeCategorySlice === idx;
                          return (
                            <circle
                              key={idx}
                              cx="100"
                              cy="100"
                              r="62"
                              fill="transparent"
                              stroke={cat.color || "#4f46e5"}
                              strokeWidth={isHovered ? 28 : 22}
                              strokeDasharray={`${dash} ${C - dash}`}
                              strokeDashoffset={offset}
                              style={{
                                cursor: "pointer",
                                transition: "all 0.2s ease-out",
                              }}
                              onMouseEnter={() => setActiveCategorySlice(idx)}
                              onMouseLeave={() => setActiveCategorySlice(null)}
                            />
                          );
                        });
                      })()}
                    </svg>

                    {/* Donut Center Display */}
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        textAlign: "center",
                        pointerEvents: "none",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "19px",
                          fontWeight: "900",
                          color: "#0f172a",
                          lineHeight: 1.1,
                        }}
                      >
                        {activeCategorySlice !== null
                          ? `${analytics.category_distribution[activeCategorySlice]?.percentage}%`
                          : "38"}
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          fontWeight: "700",
                          color: "#64748b",
                          textTransform: "uppercase",
                        }}
                      >
                        {activeCategorySlice !== null
                          ? analytics.category_distribution[activeCategorySlice]?.name.split(" ")[0]
                          : "Total Jobs"}
                      </div>
                    </div>
                  </div>

                  {/* Interactive Legend List */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "7px",
                      flex: 1,
                      minWidth: "210px",
                    }}
                  >
                    {analytics.category_distribution?.map((cat, idx) => {
                      const isHovered = activeCategorySlice === idx;
                      return (
                        <div
                          key={idx}
                          onMouseEnter={() => setActiveCategorySlice(idx)}
                          onMouseLeave={() => setActiveCategorySlice(null)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "6px 8px",
                            borderRadius: "8px",
                            background: isHovered ? "#f1f5f9" : "transparent",
                            cursor: "pointer",
                            transition: "background 0.15s ease",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span
                              style={{
                                width: "10px",
                                height: "10px",
                                borderRadius: "50%",
                                background: cat.color || "#4f46e5",
                                boxShadow: isHovered ? `0 0 8px ${cat.color}` : "none",
                              }}
                            />
                            <span
                              style={{
                                fontSize: "12px",
                                fontWeight: isHovered ? "700" : "500",
                                color: "#1e293b",
                              }}
                            >
                              {cat.name}
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "11px", color: "#64748b" }}>
                              {cat.count} jobs
                            </span>
                            <span
                              style={{
                                fontSize: "12px",
                                fontWeight: "800",
                                color: cat.color || "#4f46e5",
                                minWidth: "30px",
                                textAlign: "right",
                              }}
                            >
                              {cat.percentage}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>

              {/* ─── 2. INTERACTIVE SVG BAR CHART GRAPH ─── */}
              <Card>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "14px",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  <div>
                    <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700" }}>
                      📈 Monthly Marketplace Growth Graph
                    </h3>
                    <span style={{ fontSize: "11.5px", color: "#64748b" }}>
                      May – Oct 2026 performance velocity
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      type="button"
                      onClick={() => setChartMetricMode("gmv")}
                      style={{
                        padding: "5px 10px",
                        borderRadius: "6px",
                        border: "none",
                        fontSize: "11px",
                        fontWeight: "700",
                        cursor: "pointer",
                        background: chartMetricMode === "gmv" ? "#4f46e5" : "#f1f5f9",
                        color: chartMetricMode === "gmv" ? "#fff" : "#475569",
                        transition: "all 0.15s ease",
                      }}
                    >
                      ₹ Gross GMV
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartMetricMode("orders")}
                      style={{
                        padding: "5px 10px",
                        borderRadius: "6px",
                        border: "none",
                        fontSize: "11px",
                        fontWeight: "700",
                        cursor: "pointer",
                        background: chartMetricMode === "orders" ? "#10b981" : "#f1f5f9",
                        color: chartMetricMode === "orders" ? "#fff" : "#475569",
                        transition: "all 0.15s ease",
                      }}
                    >
                      📦 Bookings
                    </button>
                  </div>
                </div>

                {/* SVG Bar Graph */}
                <div style={{ width: "100%", overflowX: "auto" }}>
                  <svg
                    width="100%"
                    height="190"
                    viewBox="0 0 520 190"
                    style={{ overflow: "visible" }}
                  >
                    <defs>
                      <linearGradient id="gmvBarGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#4338ca" />
                      </linearGradient>
                      <linearGradient id="orderBarGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>

                    {/* Gridlines */}
                    {[0, 38, 76, 114].map((yVal, i) => (
                      <g key={i}>
                        <line
                          x1="45"
                          y1={25 + yVal}
                          x2="505"
                          y2={25 + yVal}
                          stroke="#f1f5f9"
                          strokeWidth="1"
                        />
                        <text
                          x="40"
                          y={28 + yVal}
                          textAnchor="end"
                          fontSize="9.5"
                          fill="#94a3b8"
                          fontWeight="600"
                        >
                          {chartMetricMode === "gmv"
                            ? `₹${Math.round(500 - (yVal / 114) * 500)}k`
                            : `${Math.round(450 - (yVal / 114) * 450)}`}
                        </text>
                      </g>
                    ))}

                    {/* Baseline */}
                    <line
                      x1="45"
                      y1="145"
                      x2="505"
                      y2="145"
                      stroke="#e2e8f0"
                      strokeWidth="1.5"
                    />

                    {/* Bars */}
                    {analytics.revenue_trend?.map((item, i) => {
                      const xPos = 65 + i * 74;
                      const maxVal = chartMetricMode === "gmv" ? 500000 : 450;
                      const currentVal =
                        chartMetricMode === "gmv" ? item.gmv : item.orders || 300;
                      const barHeight = Math.max(15, (currentVal / maxVal) * 120);
                      const yPos = 145 - barHeight;
                      const isHovered = activeBarIndex === i;

                      return (
                        <g
                          key={i}
                          onMouseEnter={() => setActiveBarIndex(i)}
                          onMouseLeave={() => setActiveBarIndex(null)}
                          style={{ cursor: "pointer" }}
                        >
                          {/* Value Pill Above Bar */}
                          <text
                            x={xPos + 20}
                            y={yPos - 6}
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight="800"
                            fill={isHovered ? "#0f172a" : "#64748b"}
                          >
                            {chartMetricMode === "gmv"
                              ? `₹${(item.gmv / 1000).toFixed(0)}k`
                              : `${item.orders || 300}`}
                          </text>

                          {/* Bar Rectangle */}
                          <rect
                            x={xPos}
                            y={yPos}
                            width="40"
                            height={barHeight}
                            rx="5"
                            fill={
                              chartMetricMode === "gmv"
                                ? "url(#gmvBarGrad)"
                                : "url(#orderBarGrad)"
                            }
                            style={{
                              transition: "all 0.2s ease",
                              opacity: isHovered ? 1 : 0.88,
                            }}
                          />

                          {/* Month Label */}
                          <text
                            x={xPos + 20}
                            y="164"
                            textAnchor="middle"
                            fontSize="11"
                            fontWeight={isHovered ? "800" : "600"}
                            fill={isHovered ? "#4f46e5" : "#64748b"}
                          >
                            {item.month}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Graph Summary Footer */}
                <div
                  style={{
                    marginTop: "8px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    background: "#f8fafc",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "11px",
                  }}
                >
                  <span style={{ color: "#475569" }}>
                    Active Cycle: <strong>October 2026</strong> (+18.4% monthly expansion)
                  </span>
                  <span style={{ color: "#16a34a", fontWeight: "700" }}>
                    Take Rate: 15% (₹72,435 Platform Commission)
                  </span>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB 8: REVENUE REPORTS & FINANCIAL AUDIT
            ═══════════════════════════════════════════════════════ */}
        {activeTab === "revenue-reports" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <Card
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "14px",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800" }}>
                  💰 Financial Ledger & Marketplace Payouts
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                  Automated settlement ledger with instant CSV export for tax & compliance.
                </p>
              </div>
              <Btn bg="#16a34a" color="#fff" onClick={handleDownloadCSV}>
                📥 Download Full CSV Report
              </Btn>
            </Card>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "14px",
              }}
            >
              <Card>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b" }}>
                  OCTOBER 2026 GROSS GMV
                </span>
                <div style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", marginTop: "4px" }}>
                  ₹4,82,900
                </div>
              </Card>
              <Card>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b" }}>
                  PLATFORM NET TAKE (15%)
                </span>
                <div style={{ fontSize: "24px", fontWeight: "800", color: "#4f46e5", marginTop: "4px" }}>
                  ₹72,435
                </div>
              </Card>
              <Card>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b" }}>
                  TECHNICIAN PAYOUTS (85%)
                </span>
                <div style={{ fontSize: "24px", fontWeight: "800", color: "#16a34a", marginTop: "4px" }}>
                  ₹4,10,465
                </div>
              </Card>
            </div>

            <Card style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "12.5px",
                  }}
                >
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      <th style={th}>Month & Cycle</th>
                      <th style={th}>Total Orders</th>
                      <th style={th}>Gross GMV</th>
                      <th style={th}>Platform Take</th>
                      <th style={th}>Disbursed to Handymen</th>
                      <th style={{ ...th, textAlign: "right" }}>Settlement Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Oct 2026 (Live)", "410", "₹4,82,900", "₹72,435", "₹4,10,465", "In Progress"],
                      ["Sep 2026", "385", "₹4,68,000", "₹70,200", "₹3,97,800", "Settled"],
                      ["Aug 2026", "352", "₹4,45,000", "₹66,750", "₹3,78,250", "Settled"],
                      ["Jul 2026", "310", "₹4,12,000", "₹61,800", "₹3,50,200", "Settled"],
                    ].map(([m, ord, gmv, take, disb, st], idx) => (
                      <tr key={idx}>
                        <td style={td}>
                          <strong>{m}</strong>
                        </td>
                        <td style={td}>{ord} Orders</td>
                        <td style={{ ...td, color: "#16a34a", fontWeight: "700" }}>{gmv}</td>
                        <td style={{ ...td, color: "#4f46e5", fontWeight: "700" }}>{take}</td>
                        <td style={td}>{disb}</td>
                        <td style={{ ...td, textAlign: "right" }}>
                          <Badge
                            bg={st === "Settled" ? "#dcfce7" : "#fef3c7"}
                            color={st === "Settled" ? "#15803d" : "#b45309"}
                          >
                            {st}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB 9: COMPLAINTS & AUDIT DISPUTES
            ═══════════════════════════════════════════════════════ */}
        {activeTab === "complaints" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <Card
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
                padding: "14px 20px",
              }}
            >
              <div style={{ display: "flex", gap: "8px" }}>
                {["All", "Open", "In Progress", "Resolved"].map((st) => (
                  <Btn
                    key={st}
                    bg={complaintFilter === st ? "#4f46e5" : "#f1f5f9"}
                    color={complaintFilter === st ? "#fff" : "#334155"}
                    onClick={() => setComplaintFilter(st)}
                  >
                    {st} (
                    {st === "All"
                      ? complaints.length
                      : complaints.filter((c) => c.status === st).length}
                    )
                  </Btn>
                ))}
              </div>
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                Active Tickets: <strong>{complaints.length}</strong>
              </span>
            </Card>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {complaints
                .filter(
                  (c) =>
                    (complaintFilter === "All" ||
                      c.status === complaintFilter) &&
                    (!search ||
                      c.title.toLowerCase().includes(search.toLowerCase()) ||
                      c.raised_by.toLowerCase().includes(search.toLowerCase()))
                )
                .map((c) => (
                  <Card key={c.id}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "8px",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "700" }}>
                            {c.title}
                          </h4>
                          <Badge bg="#e0e7ff" color="#4338ca">
                            {c.category}
                          </Badge>
                        </div>
                        <p
                          style={{
                            margin: "4px 0 0",
                            fontSize: "12.5px",
                            color: "#475569",
                          }}
                        >
                          {c.description}
                        </p>
                      </div>
                      <Badge
                        bg={
                          c.status === "Resolved"
                            ? "#dcfce7"
                            : c.status === "In Progress"
                            ? "#e0e7ff"
                            : "#fee2e2"
                        }
                        color={
                          c.status === "Resolved"
                            ? "#15803d"
                            : c.status === "In Progress"
                            ? "#3730a3"
                            : "#b91c1c"
                        }
                      >
                        {c.status}
                      </Badge>
                    </div>

                    {c.resolution_notes && (
                      <div
                        style={{
                          background: "#f8fafc",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          fontSize: "11.5px",
                          color: "#1e293b",
                          marginBottom: "10px",
                          borderLeft: "3px solid #16a34a",
                        }}
                      >
                        <strong>Resolution Note:</strong> {c.resolution_notes}
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderTop: "1px solid #f1f5f9",
                        paddingTop: "10px",
                        fontSize: "11.5px",
                        color: "#64748b",
                      }}
                    >
                      <span>
                        Raised by: <strong>{c.raised_by}</strong> • Target:{" "}
                        <strong>{c.target_worker}</strong> • Date: {c.date}
                      </span>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {c.status !== "In Progress" && c.status !== "Resolved" && (
                          <Btn
                            bg="#e0e7ff"
                            color="#4338ca"
                            onClick={() =>
                              handleUpdateComplaintStatus(c.id, "In Progress")
                            }
                          >
                            Mark In Progress
                          </Btn>
                        )}
                        {c.status !== "Resolved" && (
                          <Btn
                            bg="#dcfce7"
                            color="#15803d"
                            onClick={() =>
                              handleUpdateComplaintStatus(c.id, "Resolved")
                            }
                          >
                            ✓ Resolve Dispute
                          </Btn>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB 10: SYSTEM NOTIFICATIONS & BROADCASTS
            ═══════════════════════════════════════════════════════ */}
        {activeTab === "notifications" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Live Broadcast Composer */}
            <Card>
              <h3 style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: "700" }}>
                📢 Broadcast Live Announcement
              </h3>
              <p style={{ margin: "0 0 16px", fontSize: "12px", color: "#64748b" }}>
                Transmit immediate service updates, weather cautions, or KYC notices across all active user & handyman portals.
              </p>
              <form onSubmit={handleSendBroadcast}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr",
                    gap: "12px",
                    marginBottom: "12px",
                  }}
                >
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "700" }}>
                      Notice Headline:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Heavy Rain Alert: Delayed Response in East Bangalore"
                      value={broadcastForm.title}
                      onChange={(e) =>
                        setBroadcastForm({
                          ...broadcastForm,
                          title: e.target.value,
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        marginTop: "4px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "12.5px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "700" }}>
                      Priority Level:
                    </label>
                    <select
                      value={broadcastForm.priority}
                      onChange={(e) =>
                        setBroadcastForm({
                          ...broadcastForm,
                          priority: e.target.value,
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        marginTop: "4px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "12.5px",
                        background: "#fff",
                        boxSizing: "border-box",
                      }}
                    >
                      <option value="Normal">Normal Notice</option>
                      <option value="High">High Urgency</option>
                      <option value="Critical">Critical Alert</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700" }}>
                    Broadcast Body / Details:
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Describe the notice details clearly for service providers and customers..."
                    value={broadcastForm.message}
                    onChange={(e) =>
                      setBroadcastForm({
                        ...broadcastForm,
                        message: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      marginTop: "4px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "12.5px",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Btn
                    bg="#4f46e5"
                    color="#fff"
                    type="submit"
                    disabled={sendingBroadcast}
                  >
                    {sendingBroadcast ? "Sending..." : "🚀 Transmit Live Broadcast"}
                  </Btn>
                </div>
              </form>
            </Card>

            {/* Active Alerts List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <h3 style={{ margin: "4px 0 6px", fontSize: "15px", fontWeight: "700" }}>
                Active System Telemetry & Feed ({notifications.length})
              </h3>
              {notifications.map((a) => (
                <Card
                  key={a.id}
                  style={{
                    borderLeft: `4px solid ${a.color || "#4f46e5"}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <strong style={{ fontSize: "13.5px" }}>{a.title}</strong>
                      <Badge bg="#f1f5f9" color="#475569">
                        {a.priority || "Normal"}
                      </Badge>
                    </div>
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: "12px",
                        color: "#64748b",
                      }}
                    >
                      {a.msg}
                    </p>
                  </div>
                  <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                    {a.time}
                  </span>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}