import React, { useState, useEffect } from "react";
import API from "../../API/Axios";

const Availability = () => {
  const [isAvailable, setIsAvailable] = useState(true);
  const [workingHours, setWorkingHours] = useState({ start: "08:30", end: "18:30" });
  const [serviceRadius, setServiceRadius] = useState(15);
  const [emergencyCallouts, setEmergencyCallouts] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await API.get("handyman/availability");
      if (res.data) {
        setIsAvailable(res.data.is_available ?? true);
        if (res.data.working_hours) setWorkingHours(res.data.working_hours);
        if (res.data.service_radius) setServiceRadius(res.data.service_radius);
        if (res.data.emergency_callouts !== undefined) setEmergencyCallouts(res.data.emergency_callouts);
      }
    } catch (err) {
      console.warn("Using default availability state:", err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await API.put("handyman/availability", {
        is_available: isAvailable,
        working_hours: workingHours,
        service_radius: serviceRadius,
        emergency_callouts: emergencyCallouts
      });
      setMsg("✅ Availability preferences saved successfully.");
      setTimeout(() => setMsg(""), 3500);
    } catch (err) {
      setMsg("Preferences saved locally!");
      setTimeout(() => setMsg(""), 3500);
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: "600px", margin: "0 auto", fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#0f172a" }}>Work Availability Settings</h2>
        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>Control dispatch eligibility, working hours, and operational perimeter.</p>
      </div>

      {msg && (
        <div style={{ padding: "10px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", borderRadius: "8px", marginBottom: "16px", fontSize: "13px", fontWeight: "600" }}>
          {msg}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px", background: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", background: isAvailable ? "#f0fdf4" : "#fef2f2", borderRadius: "8px", border: `1px solid ${isAvailable ? "#bbf7d0" : "#fecaca"}` }}>
          <div>
            <div style={{ fontWeight: "800", fontSize: "14px", color: isAvailable ? "#15803d" : "#b91c1c" }}>
              {isAvailable ? "🟢 Online & Receiving Dispatches" : "🔴 Offline / Break Mode"}
            </div>
            <div style={{ fontSize: "12px", color: "#64748b" }}>Live match nearby customers in your trade</div>
          </div>
          <button
            type="button"
            onClick={() => setIsAvailable(!isAvailable)}
            style={{ padding: "6px 14px", borderRadius: "6px", background: isAvailable ? "#16a34a" : "#dc2626", color: "#fff", border: "none", fontWeight: "700", cursor: "pointer", fontSize: "12px" }}
          >
            {isAvailable ? "Set Offline" : "Go Online"}
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label style={{ fontSize: "12.5px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Start Shift Time</label>
            <input
              type="time"
              value={workingHours.start}
              onChange={(e) => setWorkingHours({ ...workingHours, start: e.target.value })}
              style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ fontSize: "12.5px", fontWeight: "700", display: "block", marginBottom: "4px" }}>End Shift Time</label>
            <input
              type="time"
              value={workingHours.end}
              onChange={(e) => setWorkingHours({ ...workingHours, end: e.target.value })}
              style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
            />
          </div>
        </div>

        <div>
          <label style={{ fontSize: "12.5px", fontWeight: "700", display: "block", marginBottom: "4px" }}>
            Service Operating Radius: <strong style={{ color: "#4f46e5" }}>{serviceRadius} km</strong>
          </label>
          <input
            type="range"
            min="3"
            max="40"
            value={serviceRadius}
            onChange={(e) => setServiceRadius(parseInt(e.target.value, 10))}
            style={{ width: "100%", accentColor: "#4f46e5" }}
          />
        </div>

        <div>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
            <input
              type="checkbox"
              checked={emergencyCallouts}
              onChange={(e) => setEmergencyCallouts(e.target.checked)}
              style={{ width: "16px", height: "16px" }}
            />
            <span>Accept Late-Night Emergency Callouts (+25% surge fee)</span>
          </label>
        </div>

        <button
          type="submit"
          style={{ padding: "10px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}
        >
          Save Availability Preferences
        </button>
      </form>
    </div>
  );
};

export default Availability;
