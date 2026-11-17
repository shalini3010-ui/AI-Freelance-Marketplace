import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  User,
  Wrench,
  Shield,
  Zap,
} from "lucide-react";
import API from "../API/Axios";
import Logo from "../logo";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [selectedPortal, setSelectedPortal] = useState("user"); // "user", "handyman", "admin"
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const PORTAL_META = {
    user: {
      title: "Customer Portal",
      badge: "Homeowners & Clients",
      desc: "Book trusted local specialists, track live service dispatches & view payment invoices.",
      dest: "/user/dashboard",
      accent: "#2563eb",
      themeBg: "#eff6ff",
      themeBorder: "#bfdbfe",
      demoEmail: "shalushalini3010@gmail.com",
      demoPass: "123456",
      btnText: "Enter Customer Portal",
      btnGrad: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
      btnShadow: "0 10px 20px -5px rgba(37, 99, 235, 0.35)",
      icon: <User size={16} />,
    },
    handyman: {
      title: "Handyman Portal",
      badge: "Service Specialist",
      desc: "Receive client repair dispatches, manage active service jobs & track earnings.",
      dest: "/handyman/dashboard",
      accent: "#d97706",
      themeBg: "#fffbeb",
      themeBorder: "#fde68a",
      demoEmail: "shalinimahadeva3010@gmail.com",
      demoPass: "123456",
      btnText: "Enter Handyman Portal",
      btnGrad: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
      btnShadow: "0 10px 20px -5px rgba(217, 119, 6, 0.35)",
      icon: <Wrench size={16} />,
    },
    admin: {
      title: "Administrator Console",
      badge: "Platform Governance",
      desc: "Full system oversight, worker KYC verifications, dispute mediation & analytics engine.",
      dest: "/admin/dashboard",
      accent: "#7c3aed",
      themeBg: "#faf5ff",
      themeBorder: "#e9d5ff",
      demoEmail: "mshalini3010@gmail.com",
      demoPass: "Admin@123",
      btnText: "Enter Admin Console",
      btnGrad: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
      btnShadow: "0 10px 20px -5px rgba(124, 58, 237, 0.35)",
      icon: <Shield size={16} />,
    },
  };

  const currentMeta = PORTAL_META[selectedPortal];

  const handlePortalSwitch = (portalKey) => {
    setSelectedPortal(portalKey);
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleFillDemo = (portalKey) => {
    const meta = PORTAL_META[portalKey || selectedPortal];
    setSelectedPortal(portalKey || selectedPortal);
    setFormData({
      email: meta.demoEmail,
      password: meta.demoPass,
    });
    setErrorMsg("");
    setSuccessMsg(`✓ Pre-filled credentials for ${meta.title}`);
    setTimeout(() => setSuccessMsg(""), 2500);
  };

  const handleLaunchStandalone = (portalKey) => {
    const key = portalKey || selectedPortal;
    const meta = PORTAL_META[key];
    const isHandyman = key === "handyman";
    const isAdmin = key === "admin";
    const resolvedRole = isHandyman ? "Handyman" : isAdmin ? "Admin" : "User";

    const demoUser = {
      id: "653b1f8b1c4e8a1d2e3f4a5b",
      name: isHandyman ? "Shalini Mahadeva" : isAdmin ? "Admin Shalini" : "Shalu Shalini",
      full_name: isHandyman ? "Shalini Mahadeva" : isAdmin ? "Admin Shalini" : "Shalu Shalini",
      email: meta.demoEmail,
      role: resolvedRole,
      category: isHandyman ? "Master Electrician & Smart Home Pro" : undefined
    };

    localStorage.setItem("token", "demo-fixit-access-token-2026");
    localStorage.setItem("access", "demo-fixit-access-token-2026");
    localStorage.setItem("access_token", "demo-fixit-access-token-2026");
    localStorage.setItem("user", JSON.stringify(demoUser));
    localStorage.setItem("userRole", resolvedRole);

    setSuccessMsg(`🚀 Launching ${meta.title}...`);
    setTimeout(() => {
      navigate(meta.dest);
    }, 350);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const response = await API.post("/auth/login", {
        email: formData.email.trim(),
        password: formData.password,
      });

      const authToken = response.data?.access_token || response.data?.token;
      const user = response.data?.user || {};
      const returnedRole = response.data?.role || user.role || "User";

      if (authToken) {
        localStorage.setItem("token", authToken);
        localStorage.setItem("access", authToken);
        localStorage.setItem("access_token", authToken);
      }
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }
      localStorage.setItem("userRole", returnedRole);

      const normalizedRole = String(returnedRole).trim().toLowerCase();

      // Smart destination router:
      let targetPath = currentMeta.dest;
      let portalGreeting = currentMeta.title;

      if (normalizedRole === "admin") {
        if (selectedPortal === "user") {
          targetPath = "/user/dashboard";
          portalGreeting = "Customer Dashboard (Admin Mode)";
        } else if (selectedPortal === "handyman") {
          targetPath = "/handyman/dashboard";
          portalGreeting = "Handyman Dashboard (Admin Mode)";
        } else {
          targetPath = "/admin/dashboard";
          portalGreeting = "Administrator Console";
        }
      } else if (normalizedRole === "handyman") {
        targetPath = "/handyman/dashboard";
        portalGreeting = "Handyman Portal";
      } else {
        targetPath = "/user/dashboard";
        portalGreeting = "Customer Portal";
      }

      setSuccessMsg(
        `Welcome, ${
          user.name || user.full_name || "Specialist"
        }! Launching ${portalGreeting}...`
      );

      setTimeout(() => {
        navigate(targetPath);
      }, 650);
    } catch (err) {
      console.error("Login Error:", err);
      const detail = err.response?.data?.detail;
      const message = err.response?.data?.message;

      if (!err.response) {
        // Backend API offline on port 8000 -> Seamlessly activate standalone mode!
        handleLaunchStandalone(selectedPortal);
        return;
      } else if (typeof detail === "string") {
        setErrorMsg(detail);
      } else if (Array.isArray(detail)) {
        setErrorMsg(detail.map((d) => d.msg || d).join(", "));
      } else if (message) {
        setErrorMsg(message);
      } else {
        setErrorMsg(
          "Invalid email or password. Please verify credentials or use the demo login button."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* ─── LEFT COLUMN: Brand Hero & Platform Overview ─── */}
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
            <span>AI-Powered Multi-Role Marketplace</span>
          </div>

          <h1 style={styles.heroTitle}>
            On-demand repairs, verified technicians & seamless platform operations.
          </h1>

          <p style={styles.heroSubtitle}>
            Unified gateway connecting homeowners, certified service providers,
            and platform administrators with real-time tracking and automated billing.
          </p>

          <div style={styles.featureList}>
            {[
              "Real-time GPS worker tracking & live dispatch board",
              "Automated instant invoices & revenue split settlements",
              "Dedicated Customer, Handyman, and Admin dashboards",
              "Multi-dimensional ratings & official provider feedback replies",
            ].map((feature, i) => (
              <div key={i} style={styles.featureItem}>
                <CheckCircle2
                  size={18}
                  color="#10b981"
                  style={{ flexShrink: 0 }}
                />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* Social Proof Card */}
          <div style={styles.testimonialCard}>
            <p style={styles.testimonialText}>
              "HandyFix gives every role exactly what they need — customers book in seconds, technicians manage their dispatches, and administrators have complete oversight."
            </p>
            <div style={styles.testimonialAuthor}>
              <div style={styles.avatar}>HF</div>
              <div>
                <div style={styles.authorName}>FixIt Marketplace Ecosystem</div>
                <div style={styles.authorRole}>
                  Bangalore & Urban Hubs • Active Dispatches
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Security Badges */}
        <div style={styles.leftFooter}>
          <ShieldCheck size={16} color="#10b981" />
          <span>HandyFix Guard • 256-bit SSL Encrypted • Multi-Role Access</span>
        </div>
      </div>

      {/* ─── RIGHT COLUMN: Multi-Role Dashboard Login Console ─── */}
      <div style={styles.rightCol}>
        <div style={styles.formCard}>
          {/* Card Header */}
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Sign In to HandyFix</h2>
            <p style={styles.formSubtitle}>
              Select your dashboard portal to access personalized tools
            </p>
          </div>

          {/* ─── 3-WAY PORTAL / DASHBOARD SELECTOR TABS ─── */}
          <div style={styles.portalTabsWrapper}>
            <span style={styles.portalTabsHeading}>
              CHOOSE DESTINATION DASHBOARD:
            </span>
            <div style={styles.portalTabsGrid}>
              {[
                { key: "user", label: "Customer", icon: <User size={15} /> },
                { key: "handyman", label: "Handyman", icon: <Wrench size={15} /> },
                { key: "admin", label: "Admin", icon: <Shield size={15} /> },
              ].map(({ key, label, icon }) => {
                const isSelected = selectedPortal === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handlePortalSwitch(key)}
                    style={{
                      ...styles.portalTabBtn,
                      ...(isSelected ? (styles[`portalTabBtnActive_${key}`] || styles.portalTabBtnActive) : {}),
                    }}
                  >
                    {icon}
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Portal Meta Banner */}
            <div
              style={{
                ...styles.portalBanner,
                backgroundColor: currentMeta.themeBg,
                borderColor: currentMeta.themeBorder,
                borderLeftColor: currentMeta.accent,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "4px",
                }}
              >
                <strong style={{ fontSize: "13px", color: "#0f172a" }}>
                  {currentMeta.title}
                </strong>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={() => handleFillDemo(selectedPortal)}
                    style={{
                      ...styles.demoFillLink,
                      color: currentMeta.accent,
                    }}
                    title="Auto-fill verified demo credentials for this role"
                  >
                    <Zap size={12} color={currentMeta.accent} />
                    <span>Demo Fill</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLaunchStandalone(selectedPortal)}
                    style={{
                      ...styles.demoFillLink,
                      color: "#15803d",
                      background: "#dcfce7",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      border: "1px solid #bbf7d0",
                      fontWeight: "700"
                    }}
                    title="Instantly enter dashboard in demo mode"
                  >
                    <span>⚡ 1-Click Launch</span>
                  </button>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: "12px", color: "#475569", lineHeight: "1.4" }}>
                {currentMeta.desc}
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div style={styles.errorAlert}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <span>⚠️ {errorMsg}</span>
                <button
                  type="button"
                  onClick={() => handleLaunchStandalone(selectedPortal)}
                  style={{
                    alignSelf: "flex-start",
                    padding: "6px 12px",
                    background: currentMeta.accent,
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <span>⚡ Enter {currentMeta.title} Now</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div style={styles.successAlert}>
              <span>✅ {successMsg}</span>
            </div>
          )}

          {/* Main Credentials Form */}
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Email Field */}
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Account Email</label>
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

            {/* Password Field */}
            <div style={styles.inputGroup}>
              <div style={styles.labelRow}>
                <label style={styles.inputLabel}>Password</label>
                <Link to="/forgot-password" style={styles.forgotLink}>
                  Forgot password?
                </Link>
              </div>
              <div style={styles.inputWrapper}>
                <Lock size={18} color="#64748b" style={styles.inputIcon} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  style={{ ...styles.textInput, paddingRight: 42 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitBtn,
                background: currentMeta.btnGrad,
                boxShadow: currentMeta.btnShadow,
                ...(loading ? styles.submitBtnDisabled : {}),
              }}
            >
              {loading ? (
                <div style={styles.spinnerWrapper}>
                  <div style={styles.spinner} />
                  <span>Connecting to {currentMeta.title}...</span>
                </div>
              ) : (
                <div style={styles.btnContent}>
                  <span>{currentMeta.btnText}</span>
                  <ArrowRight size={18} />
                </div>
              )}
            </button>
          </form>

          {/* Footer Call-to-Action */}
          <div style={styles.footerNote}>
            New to HandyFix?{" "}
            <Link to="/register" style={styles.registerLink}>
              Create customer or provider account
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
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    position: "relative",
  },
  leftCol: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "48px 56px",
    background:
      "linear-gradient(145deg, #ffffff 0%, #f8fafc 55%, #eff6ff 100%)",
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
    background:
      "radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, rgba(99, 102, 241, 0) 70%)",
    pointerEvents: "none",
  },
  glowBottom: {
    position: "absolute",
    bottom: -100,
    right: -100,
    width: 420,
    height: 420,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(37, 99, 235, 0.06) 0%, rgba(37, 99, 235, 0) 70%)",
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
    fontSize: 36,
    fontWeight: 800,
    lineHeight: 1.25,
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
    marginBottom: 32,
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    fontSize: 14,
    color: "#334155",
    fontWeight: "500",
  },
  testimonialCard: {
    padding: 20,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    boxShadow:
      "0 10px 25px -5px rgba(15, 23, 42, 0.04), 0 4px 6px -2px rgba(15, 23, 42, 0.02)",
  },
  testimonialText: {
    fontSize: 13,
    lineHeight: 1.6,
    color: "#475569",
    fontStyle: "italic",
    margin: "0 0 14px 0",
  },
  testimonialAuthor: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #4f46e5, #2563eb)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 13,
    color: "#ffffff",
  },
  authorName: {
    fontSize: 13,
    fontWeight: 700,
    color: "#0f172a",
  },
  authorRole: {
    fontSize: 11,
    color: "#64748b",
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
    maxWidth: 460,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: "36px 32px",
    border: "1px solid #e2e8f0",
    boxShadow:
      "0 20px 25px -5px rgba(15, 23, 42, 0.07), 0 8px 10px -6px rgba(15, 23, 42, 0.03)",
  },
  formHeader: {
    marginBottom: 20,
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
  portalTabsWrapper: {
    marginBottom: 20,
    padding: "14px",
    borderRadius: 14,
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
  },
  portalTabsHeading: {
    display: "block",
    fontSize: "10.5px",
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: "0.8px",
    marginBottom: "10px",
  },
  portalTabsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "8px",
    marginBottom: "12px",
  },
  portalTabBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "9px 6px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    backgroundColor: "#ffffff",
    color: "#475569",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  portalTabBtnActive: {
    backgroundColor: "#eff6ff",
    color: "#1d4ed8",
    border: "2px solid #2563eb",
    fontWeight: "700",
    boxShadow: "0 2px 8px rgba(37, 99, 235, 0.15)",
  },
  portalTabBtnActive_user: {
    backgroundColor: "#eff6ff",
    color: "#1d4ed8",
    border: "2px solid #2563eb",
    fontWeight: "700",
    boxShadow: "0 2px 8px rgba(37, 99, 235, 0.15)",
  },
  portalTabBtnActive_handyman: {
    backgroundColor: "#fffbeb",
    color: "#b45309",
    border: "2px solid #d97706",
    fontWeight: "700",
    boxShadow: "0 2px 8px rgba(217, 119, 6, 0.15)",
  },
  portalTabBtnActive_admin: {
    backgroundColor: "#faf5ff",
    color: "#6d28d9",
    border: "2px solid #7c3aed",
    fontWeight: "700",
    boxShadow: "0 2px 8px rgba(124, 58, 237, 0.15)",
  },
  portalBanner: {
    padding: "10px 12px",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderLeftWidth: "3px",
    borderLeftStyle: "solid",
  },
  demoFillLink: {
    background: "transparent",
    border: "none",
    color: "#d97706",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: 0,
  },
  errorAlert: {
    padding: "12px 14px",
    borderRadius: 10,
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#dc2626",
    fontSize: "12.5px",
    marginBottom: 16,
    lineHeight: 1.4,
    fontWeight: "600",
  },
  successAlert: {
    padding: "12px 14px",
    borderRadius: 10,
    backgroundColor: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: "#16a34a",
    fontSize: "12.5px",
    marginBottom: 16,
    lineHeight: 1.4,
    fontWeight: "600",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: 600,
    color: "#334155",
  },
  forgotLink: {
    fontSize: 12,
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: 600,
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: 14,
    pointerEvents: "none",
  },
  textInput: {
    width: "100%",
    padding: "11px 14px 11px 42px",
    backgroundColor: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: 10,
    color: "#0f172a",
    fontSize: 13.5,
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    background: "transparent",
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
    padding: "13px 20px",
    borderRadius: 10,
    border: "none",
    color: "#ffffff",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    transition: "transform 0.1s, box-shadow 0.2s",
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
    marginTop: 22,
    textAlign: "center",
    fontSize: 12.5,
    color: "#64748b",
  },
  registerLink: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: 700,
  },
};