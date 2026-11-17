import React, { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import API from "../../API/Axios";

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Electrical");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const res = await API.get("handyman/portfolio");
      setPortfolio(res.data || []);
    } catch (err) {
      console.warn("Using sample portfolio:", err);
      setPortfolio([
        {
          id: "p-1",
          title: "Industrial MCB & Circuit Protection Setup",
          category: "Electrical",
          description: "Installed dual RCD protection board with surge suppressor for commercial office space.",
          image_url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80",
          date: "Oct 2026"
        },
        {
          id: "p-2",
          title: "Smart Inverter & Solar Backup Wiring",
          category: "Energy & Solar",
          description: "Installed 3.5kVA pure sine wave inverter system with seamless automatic transfer switch.",
          image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80",
          date: "Sep 2026"
        }
      ]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const newItem = {
      id: `p-${Date.now()}`,
      title: title.trim(),
      category,
      description: description.trim(),
      image_url: imageUrl.trim() || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
      date: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })
    };

    try {
      await API.post("handyman/portfolio", newItem);
    } catch (err) {
      console.warn("Saved locally:", err);
    }

    setPortfolio([newItem, ...portfolio]);
    setTitle("");
    setDescription("");
    setImageUrl("");
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`handyman/portfolio?project_id=${id}`);
    } catch (err) {
      console.warn("Deleted locally:", err);
    }
    setPortfolio(portfolio.filter(p => p.id !== id));
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto", fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#0f172a" }}>My Portfolio & Work Samples</h2>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>Showcase completed project photos to verified prospective clients.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 14px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}
        >
          <Plus size={16} /> Add Work Sample
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleUpload} style={{ background: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <h4 style={{ margin: 0, fontSize: "15px" }}>Upload Project Details</h4>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "10px" }}>
            <input
              type="text"
              placeholder="Project Title (e.g., Water Heater & MCB Wiring)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
            >
              <option value="Electrical">Electrical</option>
              <option value="Lighting">Lighting</option>
              <option value="Energy & Solar">Energy & Solar</option>
              <option value="Plumbing">Plumbing</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Project Image URL (optional)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
          />
          <textarea
            rows={2}
            placeholder="Work Description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", resize: "none" }}
          />
          <div style={{ display: "flex", gap: "8px" }}>
            <button type="submit" style={{ padding: "8px 16px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "700", cursor: "pointer", fontSize: "12px" }}>
              Publish Sample
            </button>
            <button type="button" onClick={() => setShowForm(false)} style={{ padding: "8px 16px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "6px", color: "#475569", fontWeight: "700", cursor: "pointer", fontSize: "12px" }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "18px" }}>
        {portfolio.map((item) => (
          <div key={item.id} style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <img src={item.image_url} alt={item.title} style={{ width: "100%", height: "160px", objectFit: "cover" }} />
            <div style={{ padding: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#4f46e5" }}>{item.category}</span>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>{item.date}</span>
              </div>
              <h4 style={{ margin: "0 0 6px", fontSize: "15px" }}>{item.title}</h4>
              <p style={{ margin: "0 0 12px", fontSize: "12.5px", color: "#64748b", lineHeight: 1.4 }}>{item.description}</p>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={() => handleDelete(item.id)}
                  style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: "11.5px", fontWeight: "700" }}
                >
                  <Trash2 size={13} /> Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Portfolio;
