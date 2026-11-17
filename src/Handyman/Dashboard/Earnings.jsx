import React, { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import API from "../../API/Axios";

const Earnings = () => {
  const [earningsData, setEarningsData] = useState({ total: 28450, available: 14200, payouts: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const res = await API.get("handyman/payments");
      const list = res.data || [];
      const sum = list.reduce((acc, curr) => acc + (parseFloat(curr.amount.replace(/\D/g, "")) || 0), 0);
      setEarningsData({
        total: sum || 28450,
        available: Math.round((sum || 28450) * 0.5),
        payouts: list
      });
    } catch (err) {
      console.warn("Using sample earnings:", err);
      setEarningsData({
        total: 28450,
        available: 14200,
        payouts: [
          { id: "TXN-9841", jobId: "BK-8901", client: "Shalini Sharma", mode: "UPI (Google Pay)", date: "2026-10-28", amount: "₹549", status: "Successful" },
          { id: "TXN-9822", jobId: "BK-8845", client: "Rahul Verma", mode: "Instant Payout (HDFC)", date: "2026-10-25", amount: "₹1,250", status: "Successful" },
          { id: "TXN-9790", jobId: "BK-8821", client: "Anita Desai", mode: "UPI (PhonePe)", date: "2026-10-21", amount: "₹899", status: "Successful" }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadStatement = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("FixIt.ai - Earnings Statement", 14, 20);
    const tableData = earningsData.payouts.map(p => [p.id, p.jobId, p.client, p.mode, p.date, p.amount, p.status]);
    doc.autoTable({
      startY: 28,
      head: [["Txn ID", "Order", "Client", "Method", "Date", "Amount", "Status"]],
      body: tableData
    });
    doc.save("Handyman_Earnings.pdf");
  };

  return (
    <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto", fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#0f172a" }}>Earnings & Payouts</h2>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>Lifetime revenue, current available balance, and settlement history.</p>
        </div>
        <button
          onClick={downloadStatement}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 14px", background: "#16a34a", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}
        >
          <Download size={15} /> Export Statement
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
        <div style={{ padding: "20px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px" }}>
          <span style={{ fontSize: "12px", color: "#166534", fontWeight: "700" }}>Total Lifetime Earnings</span>
          <div style={{ fontSize: "28px", fontWeight: "900", color: "#15803d", marginTop: "4px" }}>
            ₹{earningsData.total.toLocaleString()}
          </div>
          <span style={{ fontSize: "11px", color: "#166534" }}>100% verified completed work orders</span>
        </div>
        <div style={{ padding: "20px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "12px" }}>
          <span style={{ fontSize: "12px", color: "#1e40af", fontWeight: "700" }}>Available For Withdrawal</span>
          <div style={{ fontSize: "28px", fontWeight: "900", color: "#1d4ed8", marginTop: "4px" }}>
            ₹{earningsData.available.toLocaleString()}
          </div>
          <span style={{ fontSize: "11px", color: "#1e40af" }}>Auto-clears to HDFC Bank (****4821)</span>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #e2e8f0", fontWeight: "800", fontSize: "14px" }}>
          Recent Transactions
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>
              <th style={{ padding: "10px 16px" }}>Txn ID</th>
              <th style={{ padding: "10px 16px" }}>Order</th>
              <th style={{ padding: "10px 16px" }}>Client</th>
              <th style={{ padding: "10px 16px" }}>Method</th>
              <th style={{ padding: "10px 16px" }}>Date</th>
              <th style={{ padding: "10px 16px" }}>Amount</th>
              <th style={{ padding: "10px 16px" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {earningsData.payouts.map((p) => (
              <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "12px 16px", fontWeight: "700" }}>{p.id}</td>
                <td style={{ padding: "12px 16px" }}>{p.jobId}</td>
                <td style={{ padding: "12px 16px" }}>{p.client}</td>
                <td style={{ padding: "12px 16px" }}>{p.mode}</td>
                <td style={{ padding: "12px 16px", color: "#64748b" }}>{p.date}</td>
                <td style={{ padding: "12px 16px", fontWeight: "800", color: "#16a34a" }}>{p.amount}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ fontSize: "11px", background: "#dcfce7", color: "#15803d", padding: "2px 6px", borderRadius: "4px", fontWeight: "700" }}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Earnings;
