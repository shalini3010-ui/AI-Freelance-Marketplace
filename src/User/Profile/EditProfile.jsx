import React, { useState, useEffect } from "react";
import API from "../../API/Axios";

export default function EditProfile({ isOpen, onClose, onProfileUpdated }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    area: "",
    pincode: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    avatarUrl: "",
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    let isSubscribed = true;

    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await API.get("users/me/");
        if (isSubscribed && res.data) {
          const fetchedData = {
            name: res.data.name || res.data.full_name || "",
            email: res.data.email || "",
            phone: res.data.phone || "",
            area: res.data.area || res.data.address || "",
            pincode: res.data.pincode || res.data.zip_code || "",
            emergencyContactName: res.data.emergency_contact_name || "",
            emergencyContactPhone: res.data.emergency_contact_phone || "",
            avatarUrl: res.data.avatar || res.data.avatar_url || "",
          };
          setFormData(fetchedData);
          setAvatarPreview(fetchedData.avatarUrl);
          localStorage.setItem("user", JSON.stringify({ ...res.data, ...fetchedData }));
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        const stored = localStorage.getItem("user");
        if (stored && isSubscribed) {
          try {
            const parsed = JSON.parse(stored);
            const fallbackData = {
              name: parsed.name || parsed.full_name || "Shalini",
              email: parsed.email || "shalushalini3010@gmail.com",
              phone: parsed.phone || "+91 9876543210",
              area: parsed.area || parsed.address || "Doddaballapur, Bangalore",
              pincode: parsed.pincode || "561203",
              emergencyContactName: parsed.emergencyContactName || "Parent / Guardian",
              emergencyContactPhone: parsed.emergencyContactPhone || "+91 9123456789",
              avatarUrl: parsed.avatarUrl || parsed.avatar || "",
            };
            setFormData(fallbackData);
            setAvatarPreview(fallbackData.avatarUrl);
          } catch (e) {
            console.error("Error parsing stored user data:", e);
          }
        }
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };

    if (isOpen) {
      fetchProfile();
    }

    return () => {
      isSubscribed = false;
    };
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({
          ...prev,
          area: `${prev.area ? prev.area + " " : ""}(Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)})`,
        }));
        setLocating(false);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError("Unable to retrieve location. Please type manually.");
        setLocating(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      let updatedAvatarUrl = formData.avatarUrl;

      // Upload Avatar if file was changed
      if (avatarFile) {
        const avatarFormData = new FormData();
        avatarFormData.append("avatar", avatarFile);
        try {
          const avatarRes = await API.post("users/me/avatar/", avatarFormData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          updatedAvatarUrl = avatarRes.data?.avatar_url || avatarRes.data?.url || avatarPreview;
        } catch (avatarErr) {
          console.warn("Avatar upload failed, falling back to local preview:", avatarErr);
          updatedAvatarUrl = avatarPreview;
        }
      }

      const payload = {
        ...formData,
        avatarUrl: updatedAvatarUrl,
      };

      const res = await API.put("users/me/", payload);
      const updatedUser = res.data?.user || res.data || payload;

      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      const mergedUser = { ...stored, ...payload, ...updatedUser };
      localStorage.setItem("user", JSON.stringify(mergedUser));

      if (onProfileUpdated) {
        onProfileUpdated(mergedUser);
      }

      setSuccessMsg("Profile updated successfully!");
      setTimeout(() => {
        setSuccessMsg("");
        onClose();
      }, 1000);
    } catch (err) {
      console.error("Failed to update profile:", err);
      // Fallback local save on API offline
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      const mergedUser = { ...stored, ...formData, avatarUrl: avatarPreview };
      localStorage.setItem("user", JSON.stringify(mergedUser));
      
      if (onProfileUpdated) {
        onProfileUpdated(mergedUser);
      }
      setSuccessMsg("Profile saved locally!");
      setTimeout(() => {
        setSuccessMsg("");
        onClose();
      }, 1000);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={s.overlay}>
      <div style={s.modalCard}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#0f172a" }}>Edit Profile</h2>
          <button onClick={onClose} style={s.closeIconBtn}>✕</button>
        </div>

        {loading ? (
          <p style={{ color: "#64748b", fontSize: "13px" }}>Loading profile details...</p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {error && <p style={s.errText}>{error}</p>}
            {successMsg && <p style={s.successText}>{successMsg}</p>}

            {/* Avatar Section */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "8px", background: "#f8fafc", borderRadius: "8px" }}>
              <div style={{ width: "60px", height: "60px", borderRadius: "50%", overflow: "hidden", background: "#e2e8f0", flexShrink: 0, border: "2px solid #2563eb" }}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "#64748b", fontSize: "20px" }}>👤</div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ ...s.label, marginBottom: "2px" }}>PROFILE PHOTO</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ fontSize: "11px", color: "#64748b" }}
                />
              </div>
            </div>

            {/* Full Name & Email */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={s.label}>FULL NAME</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={s.input}
                  required
                />
              </div>
              <div>
                <label style={s.label}>EMAIL ADDRESS</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={{ ...s.input, background: "#f1f5f9", cursor: "not-allowed" }}
                  readOnly
                />
              </div>
            </div>

            {/* Phone & Pincode */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={s.label}>PHONE NUMBER</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={s.input}
                  required
                />
              </div>
              <div>
                <label style={s.label}>POSTAL / PIN CODE</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  style={s.input}
                />
              </div>
            </div>

            {/* Area Address */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <label style={{ ...s.label, marginBottom: 0 }}>SERVICE ADDRESS</label>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={locating}
                  style={{ background: "none", border: "none", color: "#2563eb", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}
                >
                  {locating ? "Locating..." : "📍 Auto-detect GPS"}
                </button>
              </div>
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleChange}
                style={s.input}
                placeholder="e.g. Indiranagar, Bangalore"
              />
            </div>

            {/* Emergency Contact */}
            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "8px" }}>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", display: "block", marginBottom: "8px" }}>EMERGENCY DISPATCH CONTACT</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={s.label}>CONTACT NAME</label>
                  <input
                    type="text"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleChange}
                    style={s.input}
                  />
                </div>
                <div>
                  <label style={s.label}>CONTACT PHONE</label>
                  <input
                    type="text"
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleChange}
                    style={s.input}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
              <button
                type="button"
                onClick={onClose}
                style={s.btnCancel}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                style={s.btnSave}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const s = {
  overlay: { position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "grid", placeItems: "center", zIndex: 1100 },
  modalCard: { background: "#fff", padding: "24px", borderRadius: "16px", width: "90%", maxWidth: "480px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)" },
  closeIconBtn: { background: "none", border: "none", fontSize: "16px", color: "#64748b", cursor: "pointer" },
  label: { display: "block", fontSize: "11px", fontWeight: "700", color: "#64748b", marginBottom: "4px" },
  input: { width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box", outline: "none" },
  btnCancel: { padding: "9px 16px", border: "1px solid #cbd5e1", background: "#fff", color: "#475569", borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: "pointer" },
  btnSave: { padding: "9px 16px", border: "none", background: "#2563eb", color: "#fff", borderRadius: "8px", fontSize: "12px", fontWeight: "700", cursor: "pointer" },
  errText: { color: "#dc2626", fontSize: "12px", margin: "0 0 8px", background: "#fef2f2", padding: "6px 10px", borderRadius: "6px" },
  successText: { color: "#166534", fontSize: "12px", margin: "0 0 8px", background: "#f0fdf4", padding: "6px 10px", borderRadius: "6px" },
};