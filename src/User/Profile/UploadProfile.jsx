import React, { useState } from "react";
import API from "../../API/Axios";

export default function UploadProfile({ currentAvatar, onAvatarUpdated }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentAvatar || null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");

  const processFile = (file) => {
    setError("");
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      setError("File size must be under 2 MB.");
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("avatar", selectedFile);

    setUploading(true);
    try {
      const res = await API.post("users/me/avatar/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const avatarUrl = res.data?.avatar_url || res.data?.url || preview;
      if (onAvatarUpdated) {
        onAvatarUpdated(avatarUrl);
      }
    } catch (err) {
      console.error("Failed to upload avatar, persisting preview locally:", err);
      if (onAvatarUpdated) {
        onAvatarUpdated(preview);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreview(null);
    setError("");
    if (onAvatarUpdated) {
      onAvatarUpdated("");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", width: "100%" }}>
      {/* Drag & Drop Container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          overflow: "hidden",
          background: dragActive ? "#eff6ff" : "#f8fafc",
          border: dragActive ? "2px dashed #2563eb" : "2px solid #cbd5e1",
          position: "relative",
          display: "grid",
          placeItems: "center",
          cursor: "pointer",
          transition: "all 0.2s ease"
        }}
      >
        {preview ? (
          <img src={preview} alt="Avatar Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ textAlign: "center", padding: "8px" }}>
            <span style={{ fontSize: "22px", display: "block" }}>📷</span>
            <span style={{ color: "#94a3b8", fontSize: "10px", fontWeight: "600" }}>Drop Photo</span>
          </div>
        )}
      </div>

      {error && <p style={{ color: "#dc2626", fontSize: "11px", margin: 0 }}>{error}</p>}

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
        <label style={{ padding: "6px 12px", background: "#f1f5f9", color: "#475569", borderRadius: "6px", fontSize: "12px", fontWeight: "600", cursor: "pointer", border: "1px solid #cbd5e1" }}>
          Choose File
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </label>

        {selectedFile && (
          <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
            <button
              onClick={handleUpload}
              disabled={uploading}
              style={{ padding: "6px 12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
            >
              {uploading ? "Saving..." : "Save Image"}
            </button>
            <button
              onClick={handleRemove}
              style={{ padding: "6px 10px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "6px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}
            >
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
}