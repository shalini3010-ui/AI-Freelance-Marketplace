import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./Authentication/Login"; 
import Register from "./Authentication/Register";
import ForgotPassword from "./Authentication/ForgotPassword";
import ResetPassword from "./Authentication/ResetPassword";
import OTPVerification from "./Authentication/OTPVerification";

import UserDashboard from "./User/Dashboard/Dashboard";
import HandymanDashboard from "./Handyman/Dashboard/Dashboard";
import AdminDashboard from "./Admin/Dashboard";

// ─── DYNAMIC DASHBOARD REDIRECTOR ───
const DashboardRedirect = () => {
  const token = localStorage.getItem("token") || localStorage.getItem("access_token") || localStorage.getItem("access");
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const storedUserRaw = localStorage.getItem("user");
  let user = {};
  try {
    user = storedUserRaw ? JSON.parse(storedUserRaw) : {};
  } catch (e) {
    user = {};
  }

  const rawRole = localStorage.getItem("userRole") || user.role || "";
  const role = String(rawRole).trim().toLowerCase();

  if (role === "admin") return <Navigate to="/admin/dashboard" replace />;
  if (role === "handyman") return <Navigate to="/handyman/dashboard" replace />;
  return <Navigate to="/user/dashboard" replace />;
};

// ─── STABLE PROTECTED ROUTE GUARD ───
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem("token") || localStorage.getItem("access_token") || localStorage.getItem("access");
  const storedUserRaw = localStorage.getItem("user");
  
  let user = {};
  try {
    user = storedUserRaw ? JSON.parse(storedUserRaw) : {};
  } catch (e) {
    user = {};
  }

  const rawRole = localStorage.getItem("userRole") || user.role || "";
  const userRole = String(rawRole).trim().toLowerCase();
  const targetRole = String(allowedRole).trim().toLowerCase();

  // If token was wiped (e.g. during logout), return directly to /login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Redirect mismatched roles to their designated dashboards
  if (userRole && userRole !== targetRole && userRole !== "admin") {
    if (userRole === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (userRole === "handyman") return <Navigate to="/handyman/dashboard" replace />;
    if (userRole === "user" || userRole === "customer") return <Navigate to="/user/dashboard" replace />;
  }

  return children;
};

export default function App() {
  return (
    <Routes>
      {/* ─── PUBLIC / AUTH ROUTES ─── */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-otp" element={<OTPVerification />} />

      {/* ─── GENERIC DASHBOARD DISPATCHER ─── */}
      <Route path="/dashboard" element={<DashboardRedirect />} />

      {/* ─── CUSTOMER / USER PORTAL ─── */}
      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute allowedRole="User">
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      {/* ─── HANDYMAN / PROVIDER PORTAL ─── */}
      <Route
        path="/handyman/dashboard"
        element={
          <ProtectedRoute allowedRole="Handyman">
            <HandymanDashboard />
          </ProtectedRoute>
        }
      />

      {/* ─── ADMIN SYSTEM CONSOLE ─── */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRole="Admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* ─── FALLBACK ROUTE ─── */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}