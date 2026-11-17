import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Wrench,
  CheckCircle2,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles
} from "lucide-react";
import API from "../API/Axios";
import Logo from "../logo";

const HANDYMAN_CATEGORIES = [
  "Electrician",
  "Plumber",
  "AC & Appliance Repair",
  "Carpenter",
  "Painter",
  "Home Cleaning",
  "General Handyman"
];

export default function Register() {
  const navigate = useNavigate();

  // Role: "User" (Customer) or "Handyman"
  const [selectedRole, setSelectedRole] = useState("User");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    area: "",
    category: "Electrician",
    password: "",
    confirmPassword: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // Client-side Validations
    if (!formData.name.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match. Please re-check.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        full_name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: selectedRole,
        phone: formData.phone.trim(),
        area: formData.area.trim(),
        ...(selectedRole === "Handyman" && { category: formData.category })
      };

      const response = await API.post("/auth/register", payload);

      const authToken = response.data?.access_token || response.data?.token;
      const user = response.data?.user || {};
      const role = response.data?.role || selectedRole;

      if (authToken) {
        localStorage.setItem("token", authToken);
        localStorage.setItem("access", authToken);
        localStorage.setItem("access_token", authToken);
      }
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }
      localStorage.setItem("userRole", role);

      setSuccessMsg(`Welcome to HandyFix, ${formData.name.trim()}! Redirecting to your dashboard...`);

      const normalizedRole = String(role).trim().toLowerCase();
      setTimeout(() => {
        if (normalizedRole === "handyman") {
          navigate("/handyman/dashboard");
        } else if (normalizedRole === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/user/dashboard");
        }
      }, 900);
    } catch (err) {
      console.error("Registration error:", err);
      const detail = err.response?.data?.detail;
      const message = err.response?.data?.message;

      if (typeof detail === "string") {
        setErrorMsg(detail);
      } else if (Array.isArray(detail)) {
        setErrorMsg(detail.map(d => d.msg || d).join(", "));
      } else if (message) {
        setErrorMsg(message);
      } else if (!err.response) {
        setErrorMsg("Unable to reach backend API. Please make sure the backend is active on port 8000.");
      } else {
        setErrorMsg("Registration failed. Please check your information and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* LEFT COLUMN: Brand Hero & Benefits */}
      <div style={styles.leftCol}>
        <div style={styles.glowTop} />
        <div style={styles.glowBottom} />

        {/* Brand Header */}
        <div style={styles.brandHeader}>
          <Logo size={42} showText={true} darkText={true} />
        </div>

        {/* Hero Pitch */}
        <div style={styles.heroContent}>
          <div style={styles.badge}>
            <Sparkles size={14} color="#2563eb" />
            <span>Join Our Growing Network</span>
          </div>

          <h1 style={styles.heroTitle}>
            Create your account & get started in minutes.
          </h1>

          <p style={styles.heroSubtitle}>
            Whether you need certified emergency home repairs or want to earn money providing expert services, HandyFix delivers the premier marketplace experience.
          </p>

          <div style={styles.featureList}>
            {[
              "100% verified specialists with vetted credentials",
              "Direct instant dispatch with live geolocation tracking",
              "Safe, digital transaction management & automated billing",
              "Exclusive 24/7 priority customer support & dispute resolution",
            ].map((feature, i) => (
              <div key={i} style={styles.featureItem}>
                <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0 }} />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* Social Proof */}
          <div style={styles.roleExplainerCard}>
            <div style={styles.explainerHeader}>
              <ShieldCheck size={18} color="#2563eb" />
              <span style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>
                {selectedRole === "Handyman" ? "Service Specialist Benefits" : "Customer Protection Guarantee"}
              </span>
            </div>
            <p style={{ margin: "8px 0 0 0", fontSize: 12, lineHeight: 1.5, color: "#475569" }}>
              {selectedRole === "Handyman"
                ? "Receive direct job dispatches in your area, set custom availability, and withdraw earnings directly to your bank account."
                : "Upfront pricing, transparent technician ratings, real-time map tracking, and satisfaction guaranteed on every booking."}
            </p>
          </div>
        </div>

        {/* Footer Security Badges */}
        <div style={styles.leftFooter}>
          <ShieldCheck size={16} color="#10b981" />
          <span>HandyFix Guard • 256-bit SSL Encrypted • Zero Spam</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Registration Form */}
      <div style={styles.rightCol}>
        <div style={styles.formCard}>
          {/* Header */}
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Create Account</h2>
            <p style={styles.formSubtitle}>
              Join HandyFix to book services or manage your trade business
            </p>
          </div>

          {/* Role Switcher */}
          <div style={styles.roleSelectorWrapper}>
            <label style={styles.roleLabel}>I WANT TO REGISTER AS:</label>
            <div style={styles.roleGrid}>
              <button
                type="button"
                onClick={() => setSelectedRole("User")}
                style={{
                  ...styles.roleOption,
                  ...(selectedRole === "User" ? styles.roleOptionActive : {}),
                }}
              >
                <User size={16} />
                <div style={{ textAlign: "left" }}>
                  <div style={styles.roleOptionTitle}>Customer</div>
                  <div style={styles.roleOptionSub}>Book services & hire pros</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole("Handyman")}
                style={{
                  ...styles.roleOption,
                  ...(selectedRole === "Handyman" ? styles.roleOptionActive : {}),
                }}
              >
                <Wrench size={16} />
                <div style={{ textAlign: "left" }}>
                  <div style={styles.roleOptionTitle}>Handyman</div>
                  <div style={styles.roleOptionSub}>Offer skills & get jobs</div>
                </div>
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div style={styles.errorAlert}>
              <span>⚠️ {errorMsg}</span>
            </div>
          )}

          {/* Success Alert */}
          {successMsg && (
            <div style={styles.successAlert}>
              <span>✅ {successMsg}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleRegister} style={styles.form}>
            {/* Full Name Field */}
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Full Name *</label>
              <div style={styles.inputWrapper}>
                <User size={18} color="#64748b" style={styles.inputIcon} />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Shalini M"
                  style={styles.textInput}
                />
              </div>
            </div>

            {/* Email Address Field */}
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Email Address *</label>
              <div style={styles.inputWrapper}>
                <Mail size={18} color="#64748b" style={styles.inputIcon} />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  style={styles.textInput}
                />
              </div>
            </div>

            {/* Two-column Row: Phone & Area */}
            <div style={styles.formRow}>
              <div style={{ ...styles.inputGroup, flex: 1 }}>
                <label style={styles.inputLabel}>Phone Number</label>
                <div style={styles.inputWrapper}>
                  <Phone size={16} color="#64748b" style={styles.inputIcon} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    style={styles.textInput}
                  />
                </div>
              </div>

              <div style={{ ...styles.inputGroup, flex: 1 }}>
                <label style={styles.inputLabel}>City / Area</label>
                <div style={styles.inputWrapper}>
                  <MapPin size={16} color="#64748b" style={styles.inputIcon} />
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    placeholder="e.g. Doddaballapur"
                    style={styles.textInput}
                  />
                </div>
              </div>
            </div>

            {/* Conditional Handyman Trade Skill */}
            {selectedRole === "Handyman" && (
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Trade Specialization *</label>
                <div style={styles.inputWrapper}>
                  <Wrench size={18} color="#64748b" style={styles.inputIcon} />
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    style={{ ...styles.textInput, cursor: "pointer" }}
                  >
                    {HANDYMAN_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} style={{ background: "#111827", color: "#f8fafc" }}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Two-column Row: Password & Confirm Password */}
            <div style={styles.formRow}>
              <div style={{ ...styles.inputGroup, flex: 1 }}>
                <label style={styles.inputLabel}>Password *</label>
                <div style={styles.inputWrapper}>
                  <Lock size={16} color="#64748b" style={styles.inputIcon} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="min. 6 chars"
                    style={{ ...styles.textInput, paddingRight: 36 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ ...styles.inputGroup, flex: 1 }}>
                <label style={styles.inputLabel}>Confirm Password *</label>
                <div style={styles.inputWrapper}>
                  <Lock size={16} color="#64748b" style={styles.inputIcon} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="re-enter password"
                    style={styles.textInput}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitBtn,
                ...(loading ? styles.submitBtnDisabled : {}),
              }}
            >
              {loading ? (
                <div style={styles.spinnerWrapper}>
                  <div style={styles.spinner} />
                  <span>Creating Account...</span>
                </div>
              ) : (
                <div style={styles.btnContent}>
                  <span>Register as {selectedRole}</span>
                  <ArrowRight size={18} />
                </div>
              )}
            </button>
          </form>

          {/* Footer Call-to-Action */}
          <div style={styles.footerNote}>
            Already have an account?{" "}
            <Link to="/login" style={styles.loginLink}>
              Sign In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    position: "relative",
  },
  leftCol: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "48px 56px",
    background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 55%, #eff6ff 100%)",
    borderRight: "1px solid #e2e8f0",
    position: "relative",
    overflow: "hidden",
  },
  glowTop: {
    position: "absolute",
    top: -100,
    left: -100,
    width: 380,
    height: 380,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, rgba(99, 102, 241, 0) 70%)",
    pointerEvents: "none",
  },
  glowBottom: {
    position: "absolute",
    bottom: -100,
    right: -100,
    width: 420,
    height: 420,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(37, 99, 235, 0.06) 0%, rgba(37, 99, 235, 0) 70%)",
    pointerEvents: "none",
  },
  brandHeader: {
    position: "relative",
    zIndex: 2,
  },
  heroContent: {
    position: "relative",
    zIndex: 2,
    maxWidth: 540,
    margin: "40px 0",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 14px",
    borderRadius: 9999,
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 38,
    fontWeight: 800,
    lineHeight: 1.2,
    letterSpacing: "-0.8px",
    color: "#0f172a",
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 1.6,
    color: "#475569",
    marginBottom: 28,
  },
  featureList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginBottom: 28,
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    fontSize: 14,
    color: "#334155",
    fontWeight: "500",
  },
  roleExplainerCard: {
    padding: 18,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.04), 0 4px 6px -2px rgba(15, 23, 42, 0.02)",
  },
  explainerHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  leftFooter: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 12,
    color: "#64748b",
    position: "relative",
    zIndex: 2,
  },
  rightCol: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "36px 24px",
    backgroundColor: "#f8fafc",
  },
  formCard: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: "32px 30px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 20px 25px -5px rgba(15, 23, 42, 0.07), 0 8px 10px -6px rgba(15, 23, 42, 0.03)",
  },
  formHeader: {
    marginBottom: 18,
  },
  formTitle: {
    fontSize: 26,
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: "-0.5px",
    margin: "0 0 6px 0",
  },
  formSubtitle: {
    fontSize: 13,
    color: "#64748b",
    margin: 0,
  },
  roleSelectorWrapper: {
    marginBottom: 18,
  },
  roleLabel: {
    display: "block",
    fontSize: 11,
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: 8,
  },
  roleGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },
  roleOption: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    backgroundColor: "#ffffff",
    color: "#475569",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  roleOptionActive: {
    backgroundColor: "#eff6ff",
    borderColor: "#2563eb",
    borderWidth: "2px",
    color: "#1d4ed8",
    boxShadow: "0 2px 8px rgba(37, 99, 235, 0.15)",
  },
  roleOptionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "#0f172a",
  },
  roleOptionSub: {
    fontSize: 11,
    color: "#64748b",
  },
  errorAlert: {
    padding: "12px 14px",
    borderRadius: 10,
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#dc2626",
    fontSize: 13,
    marginBottom: 14,
    lineHeight: 1.4,
    fontWeight: "600",
  },
  successAlert: {
    padding: "12px 14px",
    borderRadius: 10,
    backgroundColor: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: "#16a34a",
    fontSize: 13,
    marginBottom: 14,
    lineHeight: 1.4,
    fontWeight: "600",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  formRow: {
    display: "flex",
    gap: 12,
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: 600,
    color: "#334155",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: 12,
    pointerEvents: "none",
  },
  textInput: {
    width: "100%",
    padding: "10px 12px 10px 38px",
    backgroundColor: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: 10,
    color: "#0f172a",
    fontSize: 13.5,
    outline: "none",
    boxSizing: "border-box",
  },
  eyeButton: {
    position: "absolute",
    right: 10,
    background: "none",
    border: "none",
    color: "#64748b",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  submitBtn: {
    marginTop: 6,
    padding: "12px 18px",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    boxShadow: "0 10px 20px -5px rgba(37, 99, 235, 0.35)",
    transition: "transform 0.1s ease, box-shadow 0.15s ease",
  },
  submitBtnDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
  },
  btnContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  spinnerWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  spinner: {
    width: 16,
    height: 16,
    border: "2px solid rgba(255, 255, 255, 0.4)",
    borderTopColor: "#ffffff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  footerNote: {
    textAlign: "center",
    marginTop: 18,
    fontSize: 13,
    color: "#64748b",
  },
  loginLink: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: 700,
  },
};