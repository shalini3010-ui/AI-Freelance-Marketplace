import React, { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import API from "../../API/Axios";

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await API.get("handyman/bookings");
      setBookings(res.data || []);
    } catch (err) {
      console.warn("Using sample bookings:", err);
      setBookings([
        {
          id: "bk-1",
          bookingId: "BK-9042",
          clientName: "Pooja Hegde",
          phone: "+91 98450 12345",
          serviceTitle: "Complete Circuit & MCB Breaker Fix",
          date: "Today",
          time: "02:30 PM",
          address: "Flat 402, Green Glen Layout, Bellandur, Bangalore",
          price: "₹699",
          status: "Accepted",
          notes: "Main trip switch keeps failing when heavy appliances power on."
        },
        {
          id: "bk-2",
          bookingId: "BK-8988",
          clientName: "Arjun Rao",
          phone: "+91 98210 54321",
          serviceTitle: "Smart Geyser & Switchboard Installation",
          date: "Tomorrow",
          time: "11:00 AM",
          address: "Villa 12, Palm Meadows, Whitefield, Bangalore",
          price: "₹899",
          status: "Pending",
          notes: "Need installation of 25L water heater and dedicated 16A modular switch."
        },
        {
          id: "bk-3",
          bookingId: "BK-8901",
          clientName: "Shalini Sharma",
          phone: "+91 98111 22334",
          serviceTitle: "Emergency Pipe Leak Repair",
          date: "2026-10-28",
          time: "04:15 PM",
          address: "12th Main, 4th Cross, Indiranagar, Bangalore",
          price: "₹549",
          status: "Completed",
          notes: "Under-sink water inlet valve replaced with brass quarter-turn valve."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      await API.put(`handyman/bookings/${bookingId}/status`, { status });
    } catch (err) {
      console.warn("Status update fallback:", err);
    }
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
    );
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("FixIt.ai - Bookings & Work Orders", 14, 20);
    const tableData = bookings.map((b) => [
      b.bookingId || b.id,
      b.clientName,
      b.serviceTitle,
      `${b.date} • ${b.time}`,
      b.price,
      b.status
    ]);
    doc.autoTable({
      startY: 28,
      head: [["ID", "Customer", "Service", "Date & Time", "Price", "Status"]],
      body: tableData
    });
    doc.save("Handyman_Bookings.pdf");
  };

  const filtered = bookings.filter((b) => {
    const match =
      (b.clientName || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.serviceTitle || "").toLowerCase().includes(search.toLowerCase());
    if (!match) return false;
    if (filter === "all") return true;
    return (b.status || "").toLowerCase() === filter.toLowerCase();
  });

  return (
    <div style={{ padding: "24px", maxWidth: "1100px", margin: "0 auto", fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#0f172a" }}>Manage Work Orders</h2>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>Schedule slots, customer details, and live service progress.</p>
        </div>
        <button
          onClick={exportPDF}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 14px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}
        >
          <Download size={15} /> Export PDF
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", gap: "12px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search by customer or service..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", width: "280px", fontSize: "13px" }}
        />
        <div style={{ display: "flex", gap: "6px" }}>
          {["all", "accepted", "pending", "completed"].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: filter === st ? "1px solid #4f46e5" : "1px solid #cbd5e1",
                background: filter === st ? "#4f46e5" : "#fff",
                color: filter === st ? "#fff" : "#475569",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              {st === "all" ? "All" : st.charAt(0).toUpperCase() + st.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p>Loading bookings...</p>
      ) : (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>
                <th style={{ padding: "12px 16px" }}>Order ID</th>
                <th style={{ padding: "12px 16px" }}>Customer</th>
                <th style={{ padding: "12px 16px" }}>Service</th>
                <th style={{ padding: "12px 16px" }}>Slot</th>
                <th style={{ padding: "12px 16px" }}>Price</th>
                <th style={{ padding: "12px 16px" }}>Status</th>
                <th style={{ padding: "12px 16px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "14px 16px", fontWeight: "800", color: "#4f46e5" }}>{b.bookingId || b.id}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontWeight: "700" }}>{b.clientName}</div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>{b.phone}</div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontWeight: "600" }}>{b.serviceTitle}</div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>{b.address}</div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div>{b.date}</div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>{b.time}</div>
                  </td>
                  <td style={{ padding: "14px 16px", fontWeight: "800", color: "#16a34a" }}>{b.price}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        background: b.status === "Completed" ? "#dcfce7" : b.status === "Accepted" ? "#dbeafe" : "#fef3c7",
                        color: b.status === "Completed" ? "#15803d" : b.status === "Accepted" ? "#1d4ed8" : "#b45309"
                      }}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "6px" }}>
                      {b.status === "Pending" && (
                        <button
                          onClick={() => updateBookingStatus(b.id, "Accepted")}
                          style={{ padding: "4px 8px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: "4px", fontWeight: "700", fontSize: "11px", cursor: "pointer" }}
                        >
                          Accept
                        </button>
                      )}
                      {b.status === "Accepted" && (
                        <button
                          onClick={() => updateBookingStatus(b.id, "Completed")}
                          style={{ padding: "4px 8px", background: "#16a34a", color: "#fff", border: "none", borderRadius: "4px", fontWeight: "700", fontSize: "11px", cursor: "pointer" }}
                        >
                          Done ✓
                        </button>
                      )}
                      <a
                        href={`tel:${b.phone}`}
                        style={{ padding: "4px 8px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "4px", color: "#334155", fontWeight: "700", fontSize: "11px", textDecoration: "none" }}
                      >
                        Call
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageBookings;
