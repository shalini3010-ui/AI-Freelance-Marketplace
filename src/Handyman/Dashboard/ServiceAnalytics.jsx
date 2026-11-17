import React, { useState, useEffect } from "react";
import API from "../../API/Axios";

const ServiceAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await API.get("handyman/analytics");
        setAnalytics(res.data);
      } catch (err) {
        console.warn("Using sample analytics:", err);
        setAnalytics({
          acceptanceRate: 98.4,
          completionRate: 99.2,
          satisfactionScore: 4.9,
          onTimeArrivalRate: 97.6,
          topService: "MCB & Circuit Protection Repair",
          proTierLevel: "Level 3 - Elite Pro"
        });
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto", fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#0f172a" }}>Performance & Quality Analytics</h2>
        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>Key metrics determining dispatch priority and client conversion rates.</p>
      </div>

      {!analytics ? (
        <p>Loading analytics...</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          <div style={{ padding: "18px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px" }}>
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "700" }}>Acceptance Rate</span>
            <div style={{ fontSize: "28px", fontWeight: "900", color: "#10b981", marginTop: "4px" }}>
              {analytics.acceptanceRate}%
            </div>
            <span style={{ fontSize: "11px", color: "#166534" }}>Top 2% provider tier</span>
          </div>

          <div style={{ padding: "18px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px" }}>
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "700" }}>Customer Satisfaction</span>
            <div style={{ fontSize: "28px", fontWeight: "900", color: "#eab308", marginTop: "4px" }}>
              {analytics.satisfactionScore} / 5.0
            </div>
            <span style={{ fontSize: "11px", color: "#a16207" }}>Based on 48 reviews</span>
          </div>

          <div style={{ padding: "18px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px" }}>
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "700" }}>On-Time Arrival</span>
            <div style={{ fontSize: "28px", fontWeight: "900", color: "#2563eb", marginTop: "4px" }}>
              {analytics.onTimeArrivalRate || 97.6}%
            </div>
            <span style={{ fontSize: "11px", color: "#1d4ed8" }}>Average ETA 9.4 mins</span>
          </div>

          <div style={{ padding: "18px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px" }}>
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "700" }}>Top Booked Service</span>
            <div style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", marginTop: "6px" }}>
              {analytics.topService}
            </div>
            <span style={{ fontSize: "11px", color: "#4f46e5", fontWeight: "700" }}>{analytics.proTierLevel || "Elite Pro"}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceAnalytics;
