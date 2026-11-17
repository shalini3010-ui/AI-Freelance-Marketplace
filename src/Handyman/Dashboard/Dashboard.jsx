import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wrench,
  Calendar,
  DollarSign,
  Star,
  Clock,
  Image as ImageIcon,
  TrendingUp,
  Bell,
  Phone,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Navigation,
  Truck,
  ShieldCheck,
  LogOut,
  Search,
  Download,
  Plus,
  Trash2,
  Edit3,
  User,
  MapPin,
  X,
  ArrowUpRight,
  Check,
  Award
} from "lucide-react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

export default function HandymanDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("dispatcher");
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);

  // Modals state
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  // Dynamic Handyman Profile
  const [handyman, setHandyman] = useState({
    name: "Shalini Mahadeva",
    category: "Master Electrician & Smart Home Pro",
    exp: "8+ Years",
    phone: "+91 98450 12345",
    whatsapp: "+91 98450 12345",
    area: "Indiranagar, Bangalore",
    rating: "4.9 ⭐",
    bio: "Certified electrical contractor specializing in smart home panels, MCB protection, concealed wiring, and emergency troubleshooting.",
    hourlyRate: 350,
    serviceRadius: 15
  });

  // Key Operational Metrics
  const [metrics, setMetrics] = useState({
    total_earnings: 28450.0,
    available_balance: 14200.0,
    completed_jobs_count: 24,
    pending_jobs_count: 3,
    acceptance_rate: 98.4,
    on_time_rate: 97.6
  });

  // ─── 1. DISPATCHES STATE ───
  const [dispatches, setDispatches] = useState([
    {
      id: "DISP-8901",
      booking_id: "BK-8901",
      customer_name: "Anita Desai",
      customer_phone: "+91 98234 56789",
      service_title: "Main Breaker Tripping & Fuse Repair",
      urgency: "Emergency",
      status: "Pending",
      price: "₹749",
      amount: 749,
      location_address: "Flat 304, Prestige Ozone, Indiranagar, Bangalore",
      distance: "1.8 km (~6 mins drive)",
      created_at: "8 mins ago",
      notes: "Main 32A MCB switch trips continuously when inverter switches on."
    },
    {
      id: "DISP-8845",
      booking_id: "BK-8845",
      customer_name: "Rahul Verma",
      customer_phone: "+91 98123 45678",
      service_title: "Dual Ceiling Fan & Smart Switchboard Setup",
      urgency: "Standard",
      status: "Accepted",
      price: "₹899",
      amount: 899,
      location_address: "12th Main Road, HAL 2nd Stage, Bangalore",
      distance: "3.2 km (~11 mins drive)",
      created_at: "25 mins ago",
      notes: "Install 2 BLDC fans and connect 4-gang smart modular switch."
    },
    {
      id: "DISP-8821",
      booking_id: "BK-8821",
      customer_name: "Vikram Sengupta",
      customer_phone: "+91 98765 11223",
      service_title: "Geyser Power Socket Overheating Check",
      urgency: "High",
      status: "En Route",
      price: "₹499",
      amount: 499,
      location_address: "Villa 18, Windmills of Your Mind, Whitefield, Bangalore",
      distance: "5.4 km (~18 mins drive)",
      created_at: "1 hour ago",
      notes: "16A socket shows mild charring marks; needs replacement with ceramic base."
    }
  ]);
  const [dispatchFilter, setDispatchFilter] = useState("all");

  // ─── 2. BOOKINGS STATE ───
  const [bookings, setBookings] = useState([
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
      amount: 699,
      status: "Accepted",
      urgency: "High",
      notes: "Main trip switch keeps failing whenever heavy appliances are powered on."
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
      amount: 899,
      status: "Pending",
      urgency: "Standard",
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
      amount: 549,
      status: "Completed",
      urgency: "Emergency",
      notes: "Under-sink water inlet valve replaced with brass quarter-turn valve."
    },
    {
      id: "bk-4",
      bookingId: "BK-8750",
      clientName: "Karthik Subramanian",
      phone: "+91 99000 88776",
      serviceTitle: "Commercial Lighting & LED Driver Setup",
      date: "2026-10-25",
      time: "10:00 AM",
      address: "Koramangala 4th Block, 80 Feet Road, Bangalore",
      price: "₹2,100",
      amount: 2100,
      status: "Completed",
      urgency: "Standard",
      notes: "Architectural ceiling track lights installed across design studio."
    }
  ]);
  const [bookingFilter, setBookingFilter] = useState("all");

  // ─── 3. EARNINGS & PAYMENTS STATE ───
  const [paymentHistory, setPaymentHistory] = useState([
    {
      id: "TXN-9841",
      jobId: "BK-8901",
      client: "Shalini Sharma",
      mode: "UPI (Google Pay)",
      date: "2026-10-28",
      amount: "₹549",
      amountNum: 549,
      type: "Credit",
      status: "Successful"
    },
    {
      id: "TXN-9822",
      jobId: "BK-8845",
      client: "Rahul Verma",
      mode: "Instant Payout (HDFC)",
      date: "2026-10-25",
      amount: "₹1,250",
      amountNum: 1250,
      type: "Credit",
      status: "Successful"
    },
    {
      id: "TXN-9810",
      jobId: "WTH-2041",
      client: "Self (Bank Payout)",
      mode: "Bank Transfer (NEFT)",
      date: "2026-10-23",
      amount: "₹5,000",
      amountNum: 5000,
      type: "Debit",
      status: "Successful"
    },
    {
      id: "TXN-9790",
      jobId: "BK-8821",
      client: "Anita Desai",
      mode: "UPI (PhonePe)",
      date: "2026-10-21",
      amount: "₹899",
      amountNum: 899,
      type: "Credit",
      status: "Successful"
    },
    {
      id: "TXN-9745",
      jobId: "BK-8750",
      client: "Karthik Subramanian",
      mode: "Direct Deposit",
      date: "2026-10-18",
      amount: "₹2,100",
      amountNum: 2100,
      type: "Credit",
      status: "Successful"
    }
  ]);
  const [withdrawForm, setWithdrawForm] = useState({
    amount: "2500",
    method: "bank",
    upiId: "fixit.shalini@okhdfc",
    bankAccount: "HDFC Bank (A/C ****4821 • IFSC: HDFC0001234)"
  });

  // ─── 4. CUSTOMER FEEDBACK STATE ───
  const [feedbacks, setFeedbacks] = useState([
    {
      id: "fb-1",
      userName: "Shalini Sharma",
      serviceTitle: "Electrical Wiring Fix",
      bookingId: "BK-8901",
      rating: 5,
      category: "Work Quality",
      wouldRecommend: true,
      comment: "Punctual, verified all circuits with professional testing tools, and solved the tripping breaker smoothly!",
      date: "2026-10-10",
      categories: { quality: 5, punctuality: 5, pricing: 5, communication: 5 },
      reply: {
        name: "Shalini Mahadeva",
        role: "Provider",
        text: "Thank you Shalini! It was a pleasure helping you ensure your home circuit was completely safe.",
        date: "2026-10-11"
      }
    },
    {
      id: "fb-2",
      userName: "Rahul Verma",
      serviceTitle: "Switchboard & Fan Installation",
      bookingId: "BK-8845",
      rating: 4.8,
      category: "Punctuality",
      wouldRecommend: true,
      comment: "Clean work and very transparent pricing. Arrived exactly on the agreed time slot with all original parts.",
      date: "2026-10-07",
      categories: { quality: 5, punctuality: 5, pricing: 4, communication: 5 },
      reply: null
    },
    {
      id: "fb-3",
      userName: "Anita Desai",
      serviceTitle: "Appliance Fault Diagnosis",
      bookingId: "BK-8821",
      rating: 4.5,
      category: "Professionalism",
      wouldRecommend: true,
      comment: "Helpful diagnosis. Minor delay due to heavy traffic on Indiranagar 100ft road, but communication was courteous.",
      date: "2026-10-04",
      categories: { quality: 5, punctuality: 4, pricing: 4, communication: 5 },
      reply: null
    }
  ]);
  const [feedbackFilter, setFeedbackFilter] = useState("all");
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  // ─── 5. AVAILABILITY & SCHEDULES STATE ───
  const [weeklySchedules, setWeeklySchedules] = useState([
    { day: "Monday", start_time: "08:30", end_time: "19:00", is_active: true },
    { day: "Tuesday", start_time: "08:30", end_time: "19:00", is_active: true },
    { day: "Wednesday", start_time: "08:30", end_time: "19:00", is_active: true },
    { day: "Thursday", start_time: "08:30", end_time: "19:00", is_active: true },
    { day: "Friday", start_time: "08:30", end_time: "19:00", is_active: true },
    { day: "Saturday", start_time: "09:00", end_time: "18:00", is_active: true },
    { day: "Sunday", start_time: "10:00", end_time: "15:00", is_active: false }
  ]);
  const [emergencyCallouts, setEmergencyCallouts] = useState(true);
  const [serviceRadius, setServiceRadius] = useState(15);

  // ─── 6. PORTFOLIO STATE ───
  const [portfolio, setPortfolio] = useState([
    {
      id: "p-1",
      title: "Commercial MCB & Surge Protection Setup",
      category: "Electrical",
      description: "Installed dual RCD protection board with surge suppressor for 3-story commercial tech office.",
      image_url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80",
      date: "Oct 2026",
      status: "Completed"
    },
    {
      id: "p-2",
      title: "Smart Inverter & Solar Backup Wiring",
      category: "Energy & Solar",
      description: "Installed 3.5kVA pure sine wave inverter system with seamless automatic transfer switch.",
      image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80",
      date: "Sep 2026",
      status: "Completed"
    },
    {
      id: "p-3",
      title: "Concealed Conduit & LED Downlight Routing",
      category: "Lighting",
      description: "Full false ceiling wiring with dimmable warm architectural lighting across 3 rooms.",
      image_url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
      date: "Aug 2026",
      status: "Completed"
    }
  ]);
  const [portfolioCategory, setPortfolioCategory] = useState("all");
  const [newProject, setNewProject] = useState({
    title: "",
    category: "Electrical",
    description: "",
    image_url: ""
  });

  // ─── 7. NOTIFICATIONS STATE ───
  const [notifications, setNotifications] = useState([
    { id: 1, type: "payment", title: "Payment Received", message: "₹899 received via UPI for Job #BK-8845.", time: "5 mins ago", unread: true },
    { id: 2, type: "dispatch", title: "Urgent Dispatch Alert", message: "New emergency request available 1.8km away in Indiranagar.", time: "12 mins ago", unread: true },
    { id: 3, type: "system", title: "Elite Pro Badge Active", message: "Your 4.9⭐ rating unlocks priority job assignments this week.", time: "3 hours ago", unread: false },
    { id: 4, type: "payout", title: "Bank Payout Processed", message: "₹5,000 transferred to HDFC Bank ****4821.", time: "1 day ago", unread: false }
  ]);
  const [notifFilter, setNotifFilter] = useState("all");

  // Show Toast Helper
  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // API Base URL
  const API_URL = useMemo(() => {
    return (process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api").replace(/\/+$/, "");
  }, []);

  // Fetch Dashboard & Live Sync
  const fetchDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      // 1. Fetch Dashboard Profile & Metrics
      const resStats = await fetch(`${API_URL}/handyman/dashboard`, { headers });
      if (resStats.ok) {
        const statsData = await resStats.json();
        setMetrics(prev => ({
          ...prev,
          total_earnings: statsData.total_earnings ?? prev.total_earnings,
          completed_jobs_count: statsData.completed_jobs_count ?? prev.completed_jobs_count,
          pending_jobs_count: statsData.pending_jobs_count ?? prev.pending_jobs_count
        }));
        setIsAvailable(statsData.is_available ?? true);
        if (statsData.full_name) {
          setHandyman(prev => ({
            ...prev,
            name: statsData.full_name,
            category: statsData.category || prev.category
          }));
        }
      }

      // 2. Fetch Dispatches
      const resJobs = await fetch(`${API_URL}/handyman/dispatches`, { headers });
      if (resJobs.ok) {
        const jobsData = await resJobs.json();
        if (Array.isArray(jobsData) && jobsData.length > 0) {
          const mapped = jobsData.map(d => ({
            id: d._id || d.id,
            booking_id: d.booking_id || d._id,
            customer_name: d.customer_name || d.client || "Verified Customer",
            customer_phone: d.customer_phone || d.phone || "+91 98765 43210",
            service_title: d.service_title || d.service || "Specialist Repair",
            urgency: d.urgency || "Standard",
            status: d.status || "Pending",
            price: typeof d.price === "number" ? `₹${d.price}` : d.price || "₹599",
            amount: typeof d.price === "number" ? d.price : 599,
            location_address: d.location_address || d.location || "Indiranagar, Bangalore",
            distance: d.distance || "2.1 km away",
            created_at: d.time || "Recently requested",
            notes: d.notes || "Customer requested inspection and repair."
          }));
          setDispatches(mapped);
        }
      }

      // 3. Fetch Bookings
      const resBookings = await fetch(`${API_URL}/handyman/bookings`, { headers });
      if (resBookings.ok) {
        const bookingsData = await resBookings.json();
        if (Array.isArray(bookingsData) && bookingsData.length > 0) {
          setBookings(bookingsData);
        }
      }

      // 4. Fetch Payments
      const resPayments = await fetch(`${API_URL}/handyman/payments`, { headers });
      if (resPayments.ok) {
        const paymentsData = await resPayments.json();
        if (Array.isArray(paymentsData) && paymentsData.length > 0) {
          setPaymentHistory(paymentsData);
        }
      }

      // 5. Fetch Availability Settings
      const resAvail = await fetch(`${API_URL}/handyman/availability`, { headers });
      if (resAvail.ok) {
        const availData = await resAvail.json();
        setIsAvailable(availData.is_available ?? true);
        if (availData.schedules) setWeeklySchedules(availData.schedules);
        if (availData.service_radius) setServiceRadius(availData.service_radius);
        if (availData.emergency_callouts !== undefined) setEmergencyCallouts(availData.emergency_callouts);
      }

      // 6. Fetch Portfolio
      const resPortfolio = await fetch(`${API_URL}/handyman/portfolio`, { headers });
      if (resPortfolio.ok) {
        const portfolioData = await resPortfolio.json();
        if (Array.isArray(portfolioData) && portfolioData.length > 0) {
          setPortfolio(portfolioData);
        }
      }
    } catch (err) {
      console.warn("API offline or sync error, using enhanced local state:", err);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ─── DISPATCH ACTIONS ───
  const handleAcceptDispatch = async (jobId) => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      await fetch(`${API_URL}/handyman/dispatches/${jobId}/accept`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      console.warn("Simulated accept:", e);
    }
    setDispatches(prev =>
      prev.map(d => (d.id === jobId ? { ...d, status: "Accepted" } : d))
    );
    showToast(`Dispatch #${jobId} accepted! Navigation details unlocked.`);
  };

  const handleUpdateDispatchStatus = async (jobId, newStatus) => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      await fetch(`${API_URL}/handyman/dispatches/${jobId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {
      console.warn("Simulated status update:", e);
    }

    setDispatches(prev =>
      prev.map(d => (d.id === jobId ? { ...d, status: newStatus } : d))
    );

    if (newStatus === "Completed") {
      const job = dispatches.find(d => d.id === jobId);
      const earned = job ? (typeof job.amount === "number" ? job.amount : 599) : 599;

      setMetrics(prev => ({
        ...prev,
        total_earnings: prev.total_earnings + earned,
        available_balance: prev.available_balance + earned,
        completed_jobs_count: prev.completed_jobs_count + 1
      }));

      // Add to payment history
      const newPayment = {
        id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
        jobId: job ? job.booking_id : `BK-${jobId.slice(-4)}`,
        client: job ? job.customer_name : "Verified Client",
        mode: "UPI (Instant)",
        date: new Date().toISOString().slice(0, 10),
        amount: `₹${earned}`,
        amountNum: earned,
        type: "Credit",
        status: "Successful"
      };
      setPaymentHistory(prev => [newPayment, ...prev]);

      showToast(`🎉 Job completed! ₹${earned} credited directly to your balance.`, "success");
    } else {
      showToast(`Status updated to "${newStatus}"!`);
    }
  };

  // Add Test Dispatch
  const handleAddTestDispatch = () => {
    const id = `DISP-${Math.floor(1000 + Math.random() * 9000)}`;
    const testItem = {
      id,
      booking_id: `BK-${id.slice(-4)}`,
      customer_name: "Sneha Nair",
      customer_phone: "+91 98455 67890",
      service_title: "Sub-meter & Smart Circuit Replacement",
      urgency: "Emergency",
      status: "Pending",
      price: "₹799",
      amount: 799,
      location_address: "B-201, Sobha Iris, Outer Ring Road, Bangalore",
      distance: "2.4 km (~8 mins drive)",
      created_at: "Just now",
      notes: "Sub-meter sparked during power restoration; needs immediate replacement."
    };
    setDispatches([testItem, ...dispatches]);
    showToast("⚡ New emergency work request dispatched to your console!", "info");
  };

  // ─── BOOKINGS ACTIONS ───
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      await fetch(`${API_URL}/handyman/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {
      console.warn("Booking update simulation:", e);
    }

    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status: newStatus } : b))
    );

    if (newStatus === "Completed") {
      const b = bookings.find(item => item.id === bookingId);
      const earned = b ? (typeof b.amount === "number" ? b.amount : 499) : 499;
      setMetrics(prev => ({
        ...prev,
        total_earnings: prev.total_earnings + earned,
        available_balance: prev.available_balance + earned,
        completed_jobs_count: prev.completed_jobs_count + 1
      }));
      showToast(`Booking #${bookingId} completed! Payment of ₹${earned} collected.`);
    } else {
      showToast(`Booking updated to ${newStatus}.`);
    }
  };

  // Export Bookings PDF
  const handleExportBookingsPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.setTextColor(79, 70, 229);
      doc.text("FixIt.ai - Handyman Work Schedule & Orders", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Provider: ${handyman.name} (${handyman.category})`, 14, 28);
      doc.text(`Exported on: ${new Date().toLocaleDateString()} | Total Bookings: ${bookings.length}`, 14, 34);

      const tableData = bookings.map(b => [
        b.bookingId || b.id,
        b.clientName,
        b.serviceTitle,
        `${b.date} • ${b.time}`,
        b.price,
        b.status
      ]);

      doc.autoTable({
        startY: 40,
        head: [["Booking ID", "Client", "Service Required", "Schedule Slot", "Amount", "Status"]],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [79, 70, 229] }
      });

      doc.save(`Work_Schedule_${handyman.name.replace(/\s+/g, "_")}.pdf`);
      showToast("📄 Work schedule exported to PDF successfully!");
    } catch (err) {
      console.error(err);
      showToast("Could not generate PDF. Please try again.", "error");
    }
  };

  // ─── WITHDRAWAL ACTIONS ───
  const handleExecuteWithdrawal = async (e) => {
    e.preventDefault();
    const withdrawAmt = parseFloat(withdrawForm.amount);
    if (!withdrawAmt || withdrawAmt <= 0) {
      showToast("Please enter a valid withdrawal amount.", "error");
      return;
    }
    if (withdrawAmt > metrics.available_balance) {
      showToast(`Amount exceeds your available balance of ₹${metrics.available_balance.toLocaleString()}.`, "error");
      return;
    }

    try {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      await fetch(`${API_URL}/payments/withdraw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: withdrawAmt,
          bank_details: {
            method: withdrawForm.method,
            account: withdrawForm.method === "upi" ? withdrawForm.upiId : withdrawForm.bankAccount
          }
        })
      });
    } catch (err) {
      console.warn("Withdrawal simulated:", err);
    }

    setMetrics(prev => ({
      ...prev,
      available_balance: Math.max(0, prev.available_balance - withdrawAmt)
    }));

    const newTxn = {
      id: `WTH-${Math.floor(1000 + Math.random() * 9000)}`,
      jobId: "Instant Payout",
      client: "Self (Bank Payout)",
      mode: withdrawForm.method === "upi" ? `UPI (${withdrawForm.upiId})` : "IMPS Bank Transfer",
      date: new Date().toISOString().slice(0, 10),
      amount: `₹${withdrawAmt.toLocaleString()}`,
      amountNum: withdrawAmt,
      type: "Debit",
      status: "Successful"
    };

    setPaymentHistory(prev => [newTxn, ...prev]);
    setShowWithdrawModal(false);
    showToast(`✅ Payout of ₹${withdrawAmt.toLocaleString()} transferred successfully to your account!`, "success");
  };

  // Download Statement PDF
  const handleDownloadStatement = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.setTextColor(22, 163, 74);
      doc.text("FixIt.ai - Handyman Earnings Statement", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Provider: ${handyman.name}`, 14, 28);
      doc.text(`Lifetime Earnings: ₹${metrics.total_earnings.toLocaleString()} | Available: ₹${metrics.available_balance.toLocaleString()}`, 14, 34);

      const tableData = paymentHistory.map(p => [
        p.id,
        p.jobId,
        p.client,
        p.mode,
        p.date,
        p.amount,
        p.status
      ]);

      doc.autoTable({
        startY: 42,
        head: [["Txn ID", "Reference", "Client / Destination", "Method", "Date", "Amount", "Status"]],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [22, 163, 74] }
      });

      doc.save(`Earnings_Statement_${handyman.name.replace(/\s+/g, "_")}.pdf`);
      showToast("💰 Financial statement downloaded successfully!");
    } catch (err) {
      console.error(err);
      showToast("Error generating statement PDF.", "error");
    }
  };

  // ─── FEEDBACK REPLY ACTIONS ───
  const handleSendFeedbackReply = async (reviewId) => {
    if (!replyText.trim()) return;
    setReplySubmitting(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      await fetch(`${API_URL}/feedback/${reviewId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reply_text: replyText.trim() })
      });
    } catch (err) {
      console.warn("Feedback reply simulation:", err);
    }

    setFeedbacks(prev =>
      prev.map(f =>
        f.id === reviewId
          ? {
              ...f,
              reply: {
                name: handyman.name || "Shalini Mahadeva",
                role: "Certified Provider",
                text: replyText.trim(),
                date: "Today"
              }
            }
          : f
      )
    );
    setReplyingId(null);
    setReplyText("");
    setReplySubmitting(false);
    showToast("Official response published to client review!");
  };

  // ─── AVAILABILITY ACTIONS ───
  const handleToggleOnlineStatus = async () => {
    const nextVal = !isAvailable;
    setIsAvailable(nextVal);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      await fetch(`${API_URL}/handyman/availability`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ is_available: nextVal })
      });
    } catch (e) {
      console.warn("Avail toggle simulated:", e);
    }
    showToast(nextVal ? "🟢 You are now ONLINE! Receiving real-time dispatches." : "🔴 You are now OFFLINE. Dispatches paused.");
  };

  const handleSaveAvailabilitySettings = async () => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      await fetch(`${API_URL}/handyman/availability`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          is_available: isAvailable,
          schedules: weeklySchedules,
          service_radius: serviceRadius,
          emergency_callouts: emergencyCallouts
        })
      });
      showToast("⏰ Weekly schedule and working radius saved successfully!");
    } catch (e) {
      showToast("Preferences saved locally!");
    }
  };

  // ─── PORTFOLIO ACTIONS ───
  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProject.title.trim() || !newProject.description.trim()) {
      showToast("Please provide both title and description.", "error");
      return;
    }

    const projectItem = {
      id: `p-${Date.now()}`,
      title: newProject.title.trim(),
      category: newProject.category || "Electrical",
      description: newProject.description.trim(),
      image_url:
        newProject.image_url.trim() ||
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
      date: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      status: "Completed"
    };

    try {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      await fetch(`${API_URL}/handyman/portfolio`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(projectItem)
      });
    } catch (err) {
      console.warn("Portfolio add simulation:", err);
    }

    setPortfolio([projectItem, ...portfolio]);
    setNewProject({ title: "", category: "Electrical", description: "", image_url: "" });
    setShowAddProjectModal(false);
    showToast("🖼️ New project showcase added to your public portfolio!");
  };

  const handleDeleteProject = async (projectId) => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      await fetch(`${API_URL}/handyman/portfolio?project_id=${projectId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      console.warn("Portfolio delete simulation:", e);
    }
    setPortfolio(portfolio.filter(p => p.id !== projectId));
    showToast("Project removed from portfolio.");
  };

  // ─── PROFILE UPDATE ACTION ───
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      await fetch(`${API_URL}/handyman/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: handyman.name,
          category: handyman.category,
          phone: handyman.phone,
          whatsapp: handyman.whatsapp,
          area: handyman.area,
          experience: handyman.exp,
          bio: handyman.bio,
          hourly_rate: handyman.hourlyRate,
          service_radius: handyman.serviceRadius
        })
      });
    } catch (err) {
      console.warn("Profile update simulation:", err);
    }
    setShowProfileModal(false);
    showToast("👤 Provider profile credentials updated successfully!");
  };

  // Filtered Dispatches
  const filteredDispatches = dispatches.filter(d => {
    const matchesSearch =
      (d.customer_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.service_title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.location_address || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (dispatchFilter === "all") return true;
    if (dispatchFilter === "urgent") return d.urgency === "Emergency" || d.urgency === "High";
    if (dispatchFilter === "active") return d.status === "Accepted" || d.status === "En Route";
    return true;
  });

  // Filtered Bookings
  const filteredBookings = bookings.filter(b => {
    const matchesSearch =
      (b.clientName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.serviceTitle || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.bookingId || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (bookingFilter === "all") return true;
    return b.status.toLowerCase() === bookingFilter.toLowerCase();
  });

  const unreadNotifsCount = notifications.filter(n => n.unread).length;

  const navItems = [
    { id: "dispatcher", label: "Work Dispatcher", icon: Wrench, badge: dispatches.filter(d => d.status === "Pending").length },
    { id: "bookings", label: "Manage Bookings", icon: Calendar, badge: bookings.filter(b => b.status === "Pending" || b.status === "Accepted").length },
    { id: "earnings", label: "Earnings & Payouts", icon: DollarSign },
    { id: "feedback", label: "Customer Reviews", icon: Star, badge: "4.9⭐" },
    { id: "availability", label: "Availability & Shifts", icon: Clock },
    { id: "portfolio", label: "Portfolio Showcase", icon: ImageIcon },
    { id: "analytics", label: "Growth Analytics", icon: TrendingUp },
    { id: "notifications", label: "Alerts & Messages", icon: Bell, badge: unreadNotifsCount > 0 ? unreadNotifsCount : null }
  ];

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f8fafc", fontFamily: "Inter, system-ui, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "4px solid #e2e8f0", borderTopColor: "#4f46e5", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <h3 style={{ margin: 0, color: "#1e293b", fontSize: "16px" }}>Opening Handyman Command Center...</h3>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "Inter, system-ui, -apple-system, sans-serif", color: "#0f172a" }}>
      {/* ─── TOAST NOTIFICATION ─── */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: toast.type === "error" ? "#dc2626" : toast.type === "info" ? "#2563eb" : "#0f172a",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: "10px",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.25)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "13px",
            fontWeight: "600",
            animation: "slideUp 0.2s ease-out"
          }}
        >
          {toast.type === "error" ? <AlertCircle size={18} /> : <CheckCircle size={18} color="#4ade80" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ─── SIDEBAR ─── */}
      <aside
        style={{
          width: "260px",
          background: "#ffffff",
          borderRight: "1px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flexShrink: 0
        }}
      >
        <div>
          {/* Brand Header */}
          <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  boxShadow: "0 4px 10px rgba(79, 70, 229, 0.3)"
                }}
              >
                <Wrench size={20} />
              </div>
              <div>
                <div style={{ fontWeight: "800", fontSize: "16px", letterSpacing: "-0.3px", color: "#0f172a" }}>
                  FixIt <span style={{ color: "#4f46e5" }}>PRO</span>
                </div>
                <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>Provider Workspace</div>
              </div>
            </div>
          </div>

          {/* Provider Compact Card */}
          <div
            onClick={() => setShowProfileModal(true)}
            style={{
              margin: "12px 14px",
              padding: "12px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "#e0e7ff",
                  color: "#4338ca",
                  fontWeight: "800",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px"
                }}
              >
                {handyman.name ? handyman.name.charAt(0) : "P"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "13px", fontWeight: "700", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {handyman.name}
                </div>
                <div style={{ fontSize: "11px", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {handyman.category}
                </div>
              </div>
              <Edit3 size={14} color="#94a3b8" />
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ padding: "0 10px", display: "flex", flexDirection: "column", gap: "2px" }}>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "none",
                    background: isActive ? "#4f46e5" : "transparent",
                    color: isActive ? "#ffffff" : "#475569",
                    fontWeight: isActive ? "700" : "500",
                    fontSize: "13px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    textAlign: "left"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Icon size={18} color={isActive ? "#ffffff" : "#64748b"} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      style={{
                        fontSize: "10px",
                        padding: "2px 7px",
                        borderRadius: "10px",
                        background: isActive ? "rgba(255,255,255,0.25)" : "#e2e8f0",
                        color: isActive ? "#fff" : "#334155",
                        fontWeight: "700"
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div style={{ padding: "16px", borderTop: "1px solid #f1f5f9" }}>
          {/* Quick Status Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: isAvailable ? "#ecfdf5" : "#fef2f2",
              border: `1px solid ${isAvailable ? "#a7f3d0" : "#fecaca"}`,
              padding: "8px 12px",
              borderRadius: "8px",
              marginBottom: "12px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: isAvailable ? "#10b981" : "#ef4444",
                  boxShadow: isAvailable ? "0 0 0 3px rgba(16, 185, 129, 0.2)" : "none"
                }}
              />
              <span style={{ fontSize: "11.5px", fontWeight: "700", color: isAvailable ? "#065f46" : "#991b1b" }}>
                {isAvailable ? "Online • Ready" : "Offline • Paused"}
              </span>
            </div>
            <button
              onClick={handleToggleOnlineStatus}
              style={{
                fontSize: "11px",
                fontWeight: "700",
                background: "transparent",
                border: "none",
                color: isAvailable ? "#047857" : "#b91c1c",
                cursor: "pointer",
                padding: 0
              }}
            >
              Switch
            </button>
          </div>

          <button
            onClick={() => {
              localStorage.clear();
              navigate("/");
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "9px",
              background: "#f1f5f9",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              color: "#334155",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT VIEW ─── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100vh", overflow: "hidden" }}>
        {/* Top Header Bar */}
        <header
          style={{
            height: "64px",
            background: "#ffffff",
            borderBottom: "1px solid #e2e8f0",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0
          }}
        >
          {/* Search Bar */}
          <div style={{ position: "relative", width: "320px" }}>
            <Search size={16} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search jobs, customers, bookings..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px 8px 36px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
                fontSize: "12.5px",
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>

          {/* Action Stats & Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {/* Quick Status Pill */}
            <button
              onClick={handleToggleOnlineStatus}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 12px",
                borderRadius: "20px",
                border: `1px solid ${isAvailable ? "#86efac" : "#fca5a5"}`,
                background: isAvailable ? "#f0fdf4" : "#fef2f2",
                color: isAvailable ? "#15803d" : "#b91c1c",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: isAvailable ? "#22c55e" : "#ef4444"
                }}
              />
              <span>{isAvailable ? "RECEIVING DISPATCHES" : "DISPATCHES PAUSED"}</span>
            </button>

            {/* Quick Balance Button */}
            <button
              onClick={() => setShowWithdrawModal(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "8px",
                background: "#ecfdf5",
                border: "1px solid #a7f3d0",
                color: "#065f46",
                fontSize: "12.5px",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              <DollarSign size={15} />
              <span>₹{metrics.available_balance.toLocaleString()} Payout</span>
            </button>

            {/* Notifications Bell */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#475569",
                  cursor: "pointer",
                  position: "relative"
                }}
              >
                <Bell size={18} />
                {unreadNotifsCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "6px",
                      right: "6px",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#ef4444"
                    }}
                  />
                )}
              </button>

              {/* Notifications Dropdown Preview */}
              {showNotificationsDropdown && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "46px",
                    width: "320px",
                    background: "#ffffff",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    zIndex: 100,
                    padding: "12px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <strong style={{ fontSize: "13px" }}>Notifications</strong>
                    <button
                      onClick={() => {
                        setNotifications(notifications.map(n => ({ ...n, unread: false })));
                        showToast("All notifications marked as read.");
                      }}
                      style={{ fontSize: "11px", color: "#4f46e5", background: "none", border: "none", cursor: "pointer", fontWeight: "600" }}
                    >
                      Mark all read
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "250px", overflowY: "auto" }}>
                    {notifications.slice(0, 4).map(n => (
                      <div key={n.id} style={{ padding: "8px", background: n.unread ? "#f8fafc" : "#fff", borderRadius: "8px", fontSize: "12px", border: "1px solid #f1f5f9" }}>
                        <div style={{ fontWeight: "700", color: "#0f172a" }}>{n.title}</div>
                        <div style={{ color: "#475569", fontSize: "11.5px", marginTop: "2px" }}>{n.message}</div>
                        <div style={{ color: "#94a3b8", fontSize: "10px", marginTop: "4px" }}>{n.time}</div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setTab("notifications");
                      setShowNotificationsDropdown(false);
                    }}
                    style={{ width: "100%", marginTop: "10px", padding: "6px", textAlign: "center", background: "#f1f5f9", border: "none", borderRadius: "6px", fontSize: "11.5px", fontWeight: "700", color: "#4f46e5", cursor: "pointer" }}
                  >
                    View All Notifications →
                  </button>
                </div>
              )}
            </div>

            {/* Quick Profile Pill */}
            <div
              onClick={() => setShowProfileModal(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: "8px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0"
              }}
            >
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#4f46e5", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700" }}>
                {handyman.name.charAt(0)}
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "12px", fontWeight: "700", lineHeight: 1.2 }}>{handyman.name.split(" ")[0]}</div>
                <div style={{ fontSize: "10px", color: "#16a34a", fontWeight: "700" }}>★ 4.9 Pro</div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TAB 1: WORK DISPATCHER                                         */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {tab === "dispatcher" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Header Title & Filter Bar */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#0f172a" }}>Real-Time Work Dispatcher</h2>
                    <span style={{ fontSize: "11px", background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "10px", fontWeight: "700" }}>
                      ● Live Satellite Radar
                    </span>
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                    Active customer service calls assigned within your {serviceRadius} km working radius.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={handleAddTestDispatch}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 14px",
                      background: "#eef2ff",
                      color: "#4338ca",
                      border: "1px solid #c7d2fe",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer"
                    }}
                  >
                    <Plus size={14} />
                    <span>Simulate Incoming Request</span>
                  </button>
                  {["all", "urgent", "active"].map(f => (
                    <button
                      key={f}
                      onClick={() => setDispatchFilter(f)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "8px",
                        border: dispatchFilter === f ? "1px solid #4f46e5" : "1px solid #cbd5e1",
                        background: dispatchFilter === f ? "#4f46e5" : "#ffffff",
                        color: dispatchFilter === f ? "#ffffff" : "#475569",
                        fontSize: "12px",
                        fontWeight: "700",
                        cursor: "pointer"
                      }}
                    >
                      {f === "all" ? "All Dispatches" : f === "urgent" ? "🚨 Urgent / Emergency" : "🚗 In-Transit / Active"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Dispatch List */}
              {filteredDispatches.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                  <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#64748b" }}>
                    <Wrench size={24} />
                  </div>
                  <h3 style={{ margin: "0 0 6px", fontSize: "16px" }}>No Dispatches Matching Filter</h3>
                  <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#64748b" }}>
                    All requests within your radius have been handled or cleared.
                  </p>
                  <button onClick={handleAddTestDispatch} style={btnSolid("#4f46e5")}>
                    Generate Test Work Order
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {filteredDispatches.map(d => {
                    const mapQuery = encodeURIComponent(d.location_address || "Bangalore, India");
                    const isUrgent = d.urgency === "Emergency" || d.urgency === "High";

                    return (
                      <div
                        key={d.id}
                        style={{
                          background: "#ffffff",
                          borderRadius: "16px",
                          border: isUrgent ? "1.5px solid #fecaca" : "1px solid #e2e8f0",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                          overflow: "hidden"
                        }}
                      >
                        {/* Top Bar */}
                        <div
                          style={{
                            padding: "12px 18px",
                            background: isUrgent ? "#fff5f5" : "#f8fafc",
                            borderBottom: "1px solid #f1f5f9",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: "800",
                                padding: "3px 8px",
                                borderRadius: "6px",
                                background: isUrgent ? "#dc2626" : "#2563eb",
                                color: "#ffffff"
                              }}
                            >
                              {d.urgency || "Standard"}
                            </span>
                            <span style={{ fontSize: "12px", fontWeight: "700", color: "#4f46e5" }}>{d.id}</span>
                            <span style={{ fontSize: "12px", color: "#94a3b8" }}>• {d.created_at}</span>
                          </div>
                          <div style={{ fontSize: "18px", fontWeight: "900", color: "#16a34a" }}>{d.price}</div>
                        </div>

                        {/* Card Body */}
                        <div style={{ padding: "18px", display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "20px" }}>
                          <div>
                            <h3 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>
                              {d.service_title}
                            </h3>
                            <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#334155", background: "#f8fafc", padding: "8px 12px", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                              <strong>Notes:</strong> {d.notes}
                            </p>

                            <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <User size={15} color="#64748b" />
                                <span>
                                  <strong>Customer:</strong> {d.customer_name}
                                </span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <MapPin size={15} color="#dc2626" />
                                <span>
                                  <strong>Address:</strong> {d.location_address}
                                </span>
                              </div>
                              {d.distance && (
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#2563eb", fontWeight: "600", fontSize: "12px" }}>
                                  <Navigation size={14} />
                                  <span>{d.distance}</span>
                                </div>
                              )}
                            </div>

                            {/* Customer Communication Quick Buttons */}
                            <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
                              <a
                                href={`tel:${d.customer_phone}`}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  padding: "6px 12px",
                                  background: "#eff6ff",
                                  border: "1px solid #bfdbfe",
                                  borderRadius: "6px",
                                  color: "#1d4ed8",
                                  fontSize: "12px",
                                  fontWeight: "700",
                                  textDecoration: "none"
                                }}
                              >
                                <Phone size={14} />
                                <span>Call {d.customer_phone}</span>
                              </a>
                              <a
                                href={`https://wa.me/${d.customer_phone.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  padding: "6px 12px",
                                  background: "#f0fdf4",
                                  border: "1px solid #bbf7d0",
                                  borderRadius: "6px",
                                  color: "#15803d",
                                  fontSize: "12px",
                                  fontWeight: "700",
                                  textDecoration: "none"
                                }}
                              >
                                <MessageCircle size={14} />
                                <span>WhatsApp</span>
                              </a>
                            </div>
                          </div>

                          {/* Live Embedded Map Preview */}
                          <div style={{ height: "150px", borderRadius: "10px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                            <iframe
                              title={`Map-${d.id}`}
                              width="100%"
                              height="100%"
                              style={{ border: 0 }}
                              loading="lazy"
                              src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                            />
                          </div>
                        </div>

                        {/* Bottom Action Footer */}
                        <div
                          style={{
                            padding: "12px 18px",
                            background: "#f8fafc",
                            borderTop: "1px solid #f1f5f9",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", fontWeight: "700" }}>
                            <span>Status:</span>
                            <span
                              style={{
                                padding: "2px 8px",
                                borderRadius: "6px",
                                background:
                                  d.status === "Completed"
                                    ? "#dcfce7"
                                    : d.status === "En Route"
                                    ? "#dbeafe"
                                    : d.status === "Accepted"
                                    ? "#fef3c7"
                                    : "#f1f5f9",
                                color:
                                  d.status === "Completed"
                                    ? "#15803d"
                                    : d.status === "En Route"
                                    ? "#1d4ed8"
                                    : d.status === "Accepted"
                                    ? "#b45309"
                                    : "#475569"
                              }}
                            >
                              {d.status}
                            </span>
                          </div>

                          <div style={{ display: "flex", gap: "8px" }}>
                            {d.status === "Pending" && (
                              <button onClick={() => handleAcceptDispatch(d.id)} style={btnSolid("#4f46e5")}>
                                Accept Dispatch ✓
                              </button>
                            )}

                            {d.status === "Accepted" && (
                              <button onClick={() => handleUpdateDispatchStatus(d.id, "En Route")} style={btnSolid("#2563eb")}>
                                <Truck size={14} style={{ marginRight: "4px" }} /> Start Driving (En Route)
                              </button>
                            )}

                            {d.status === "En Route" && (
                              <button onClick={() => handleUpdateDispatchStatus(d.id, "In Progress")} style={btnSolid("#f59e0b")}>
                                <Wrench size={14} style={{ marginRight: "4px" }} /> Arrived & Start Work
                              </button>
                            )}

                            {d.status === "In Progress" && (
                              <button onClick={() => handleUpdateDispatchStatus(d.id, "Completed")} style={btnSolid("#16a34a")}>
                                <Check size={14} style={{ marginRight: "4px" }} /> Complete Job & Collect ₹{d.amount}
                              </button>
                            )}

                            {d.status === "Completed" && (
                              <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                <CheckCircle size={16} /> Fully Paid & Closed
                              </span>
                            )}

                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "7px 12px",
                                background: "#ffffff",
                                border: "1px solid #cbd5e1",
                                borderRadius: "8px",
                                color: "#334155",
                                fontSize: "12px",
                                fontWeight: "700",
                                textDecoration: "none"
                              }}
                            >
                              <span>Open GPS</span>
                              <ArrowUpRight size={14} />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TAB 2: MANAGE BOOKINGS & WORK ORDERS                           */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {tab === "bookings" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#0f172a" }}>Work Orders & Bookings Calendar</h2>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                    Track scheduled appointments, job details, and customer verification status.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={handleExportBookingsPDF} style={btnOutline("#4f46e5")}>
                    <Download size={14} style={{ marginRight: "4px" }} /> Export Schedule (PDF)
                  </button>
                  {["all", "accepted", "pending", "completed"].map(st => (
                    <button
                      key={st}
                      onClick={() => setBookingFilter(st)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "8px",
                        border: bookingFilter === st ? "1px solid #4f46e5" : "1px solid #cbd5e1",
                        background: bookingFilter === st ? "#4f46e5" : "#ffffff",
                        color: bookingFilter === st ? "#ffffff" : "#475569",
                        fontSize: "12px",
                        fontWeight: "700",
                        cursor: "pointer"
                      }}
                    >
                      {st === "all" ? "All Bookings" : st.charAt(0).toUpperCase() + st.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bookings Table / Card View */}
              <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>
                        <th style={thStyle}>Order ID</th>
                        <th style={thStyle}>Customer</th>
                        <th style={thStyle}>Service Details</th>
                        <th style={thStyle}>Schedule Slot</th>
                        <th style={thStyle}>Location</th>
                        <th style={thStyle}>Price</th>
                        <th style={thStyle}>Status</th>
                        <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                            No work orders found matching your criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredBookings.map(b => (
                          <tr key={b.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                            <td style={tdStyle}>
                              <span style={{ fontWeight: "800", color: "#4f46e5" }}>{b.bookingId || b.id}</span>
                            </td>
                            <td style={tdStyle}>
                              <div>
                                <div style={{ fontWeight: "700", color: "#0f172a" }}>{b.clientName}</div>
                                <div style={{ fontSize: "11px", color: "#64748b" }}>{b.phone}</div>
                              </div>
                            </td>
                            <td style={tdStyle}>
                              <div style={{ fontWeight: "600", color: "#1e293b" }}>{b.serviceTitle}</div>
                              <div style={{ fontSize: "11px", color: "#64748b", maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {b.notes}
                              </div>
                            </td>
                            <td style={tdStyle}>
                              <div style={{ fontWeight: "600" }}>{b.date}</div>
                              <div style={{ fontSize: "11px", color: "#64748b" }}>{b.time}</div>
                            </td>
                            <td style={tdStyle}>
                              <div style={{ maxWidth: "180px", fontSize: "12px", color: "#334155" }}>{b.address}</div>
                            </td>
                            <td style={{ ...tdStyle, fontWeight: "800", color: "#16a34a" }}>{b.price}</td>
                            <td style={tdStyle}>
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  padding: "3px 8px",
                                  borderRadius: "6px",
                                  background:
                                    b.status === "Completed"
                                      ? "#dcfce7"
                                      : b.status === "Accepted"
                                      ? "#dbeafe"
                                      : b.status === "Cancelled"
                                      ? "#fee2e2"
                                      : "#fef3c7",
                                  color:
                                    b.status === "Completed"
                                      ? "#15803d"
                                      : b.status === "Accepted"
                                      ? "#1d4ed8"
                                      : b.status === "Cancelled"
                                      ? "#b91c1c"
                                      : "#b45309"
                                }}
                              >
                                {b.status}
                              </span>
                            </td>
                            <td style={{ ...tdStyle, textAlign: "right" }}>
                              <div style={{ display: "inline-flex", gap: "6px" }}>
                                {b.status === "Pending" && (
                                  <button onClick={() => handleUpdateBookingStatus(b.id, "Accepted")} style={btnSolid("#4f46e5", "6px 10px")}>
                                    Accept
                                  </button>
                                )}
                                {b.status === "Accepted" && (
                                  <button onClick={() => handleUpdateBookingStatus(b.id, "Completed")} style={btnSolid("#16a34a", "6px 10px")}>
                                    Mark Done
                                  </button>
                                )}
                                <a
                                  href={`tel:${b.phone}`}
                                  style={{
                                    padding: "6px 10px",
                                    background: "#f1f5f9",
                                    border: "1px solid #cbd5e1",
                                    borderRadius: "6px",
                                    color: "#334155",
                                    fontSize: "11px",
                                    fontWeight: "700",
                                    textDecoration: "none"
                                  }}
                                >
                                  Call
                                </a>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TAB 3: EARNINGS & PAYOUTS                                      */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {tab === "earnings" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#0f172a" }}>Earnings & Payout Ledger</h2>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                    Automated payouts, transaction histories, and verified UPI/Bank settlements.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={handleDownloadStatement} style={btnOutline("#16a34a")}>
                    <Download size={14} style={{ marginRight: "4px" }} /> Download Statement (PDF)
                  </button>
                  <button onClick={() => setShowWithdrawModal(true)} style={btnSolid("#16a34a")}>
                    <DollarSign size={14} style={{ marginRight: "4px" }} /> Instant Payout
                  </button>
                </div>
              </div>

              {/* 4 Metric Banner Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                <div style={{ ...cardStyle, background: "#f0fdf4", borderColor: "#bbf7d0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: "#166534", fontWeight: "700" }}>Total Lifetime Earnings</span>
                    <TrendingUp size={16} color="#16a34a" />
                  </div>
                  <div style={{ fontSize: "26px", fontWeight: "900", color: "#15803d", marginTop: "6px" }}>
                    ₹{metrics.total_earnings.toLocaleString()}
                  </div>
                  <span style={{ fontSize: "11px", color: "#166534" }}>+18.4% growth this month</span>
                </div>

                <div style={{ ...cardStyle, background: "#eff6ff", borderColor: "#bfdbfe" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: "#1e40af", fontWeight: "700" }}>Available For Payout</span>
                    <DollarSign size={16} color="#2563eb" />
                  </div>
                  <div style={{ fontSize: "26px", fontWeight: "900", color: "#1d4ed8", marginTop: "6px" }}>
                    ₹{metrics.available_balance.toLocaleString()}
                  </div>
                  <span style={{ fontSize: "11px", color: "#1e40af" }}>Ready for instant IMPS / UPI</span>
                </div>

                <div style={{ ...cardStyle, background: "#fdf4ff", borderColor: "#f0abfc" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: "#86198f", fontWeight: "700" }}>Completed Paid Jobs</span>
                    <CheckCircle size={16} color="#c026d3" />
                  </div>
                  <div style={{ fontSize: "26px", fontWeight: "900", color: "#a21caf", marginTop: "6px" }}>
                    {metrics.completed_jobs_count}
                  </div>
                  <span style={{ fontSize: "11px", color: "#86198f" }}>100% verified customer ratings</span>
                </div>

                <div style={{ ...cardStyle, background: "#fffbeb", borderColor: "#fde68a" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: "#92400e", fontWeight: "700" }}>Linked Bank</span>
                    <ShieldCheck size={16} color="#d97706" />
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: "800", color: "#b45309", marginTop: "8px" }}>
                    HDFC Bank (****4821)
                  </div>
                  <span style={{ fontSize: "11px", color: "#92400e" }}>Auto-deposit enabled weekly</span>
                </div>
              </div>

              {/* Transaction History Table */}
              <div style={{ ...cardStyle, padding: "0", overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "800" }}>Transaction Ledger & Payout History</h3>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>{paymentHistory.length} total entries</span>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>
                        <th style={thStyle}>Transaction ID</th>
                        <th style={thStyle}>Order Ref</th>
                        <th style={thStyle}>Client / Destination</th>
                        <th style={thStyle}>Method</th>
                        <th style={thStyle}>Date</th>
                        <th style={thStyle}>Amount</th>
                        <th style={thStyle}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentHistory.map(item => (
                        <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={tdStyle}>
                            <strong>{item.id}</strong>
                          </td>
                          <td style={tdStyle}>{item.jobId}</td>
                          <td style={tdStyle}>{item.client}</td>
                          <td style={tdStyle}>{item.mode}</td>
                          <td style={{ ...tdStyle, color: "#64748b" }}>{item.date}</td>
                          <td
                            style={{
                              ...tdStyle,
                              fontWeight: "800",
                              color: item.type === "Debit" ? "#dc2626" : "#16a34a"
                            }}
                          >
                            {item.type === "Debit" ? `-${item.amount}` : `+${item.amount}`}
                          </td>
                          <td style={tdStyle}>
                            <span style={{ fontSize: "11px", background: "#dcfce7", color: "#15803d", padding: "2px 8px", borderRadius: "4px", fontWeight: "700" }}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TAB 4: CUSTOMER REVIEWS & REPUTATION                           */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {tab === "feedback" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#0f172a" }}>Client Feedback & Reputation</h2>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                    Read ratings left by verified customers and post official provider replies.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {["all", "5", "4", "critical"].map(f => (
                    <button
                      key={f}
                      onClick={() => setFeedbackFilter(f)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "8px",
                        border: feedbackFilter === f ? "1px solid #4f46e5" : "1px solid #cbd5e1",
                        background: feedbackFilter === f ? "#4f46e5" : "#ffffff",
                        color: feedbackFilter === f ? "#ffffff" : "#475569",
                        fontSize: "12px",
                        fontWeight: "700",
                        cursor: "pointer"
                      }}
                    >
                      {f === "all" ? "All Reviews" : f === "critical" ? "⚠️ Under 4 Stars" : `${f} Stars Only`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating Overview Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "16px" }}>
                <div style={{ ...cardStyle, display: "flex", alignItems: "center", gap: "24px" }}>
                  <div style={{ textAlign: "center", minWidth: "120px", borderRight: "1px solid #f1f5f9", paddingRight: "20px" }}>
                    <div style={{ fontSize: "48px", fontWeight: "900", color: "#4f46e5", lineHeight: 1 }}>4.9</div>
                    <div style={{ color: "#eab308", fontSize: "18px", margin: "4px 0" }}>★★★★★</div>
                    <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Based on 48 verified reviews</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#1e293b" }}>Rating Distribution</h4>
                    {[
                      { stars: 5, pct: 92, count: 44 },
                      { stars: 4, pct: 8, count: 4 },
                      { stars: 3, pct: 0, count: 0 },
                      { stars: 2, pct: 0, count: 0 },
                      { stars: 1, pct: 0, count: 0 }
                    ].map(item => (
                      <div key={item.stars} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", fontSize: "11.5px" }}>
                        <span style={{ width: "36px", color: "#64748b" }}>{item.stars} ★</span>
                        <div style={{ flex: 1, height: "6px", background: "#f1f5f9", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ width: `${item.pct}%`, height: "100%", background: "#10b981", borderRadius: "3px" }} />
                        </div>
                        <span style={{ width: "24px", color: "#94a3b8", textAlign: "right" }}>{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ ...cardStyle, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                    <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700" }}>Work Quality</span>
                    <div style={{ fontSize: "20px", fontWeight: "900", color: "#10b981", marginTop: "2px" }}>5.0 / 5.0</div>
                    <span style={{ fontSize: "10px", color: "#15803d" }}>Top Rated 🏆</span>
                  </div>
                  <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                    <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700" }}>Punctuality</span>
                    <div style={{ fontSize: "20px", fontWeight: "900", color: "#2563eb", marginTop: "2px" }}>4.8 / 5.0</div>
                    <span style={{ fontSize: "10px", color: "#1d4ed8" }}>On-Time Arrival ⏰</span>
                  </div>
                  <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                    <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700" }}>Fair Pricing</span>
                    <div style={{ fontSize: "20px", fontWeight: "900", color: "#8b5cf6", marginTop: "2px" }}>4.7 / 5.0</div>
                    <span style={{ fontSize: "10px", color: "#6d28d9" }}>Transparent Rates 💵</span>
                  </div>
                  <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                    <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700" }}>Communication</span>
                    <div style={{ fontSize: "20px", fontWeight: "900", color: "#06b6d4", marginTop: "2px" }}>5.0 / 5.0</div>
                    <span style={{ fontSize: "10px", color: "#0e7490" }}>Courteous & Clear 🤝</span>
                  </div>
                </div>
              </div>

              {/* Review Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {feedbacks
                  .filter(fb => {
                    if (feedbackFilter === "5") return Math.round(fb.rating) === 5;
                    if (feedbackFilter === "4") return Math.round(fb.rating) === 4;
                    if (feedbackFilter === "critical") return fb.rating < 4;
                    return true;
                  })
                  .map(fb => (
                    <div key={fb.id} style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <strong style={{ fontSize: "14px", color: "#0f172a" }}>{fb.userName}</strong>
                            <span style={{ fontSize: "10px", background: "#f1f5f9", padding: "2px 8px", borderRadius: "10px", color: "#64748b" }}>
                              {fb.bookingId}
                            </span>
                            <span style={{ fontSize: "10px", background: "#e0e7ff", color: "#4338ca", padding: "2px 8px", borderRadius: "10px", fontWeight: "700" }}>
                              {fb.category}
                            </span>
                          </div>
                          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>{fb.serviceTitle}</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ color: "#eab308", fontWeight: "800", fontSize: "14px" }}>
                            {"★".repeat(Math.round(fb.rating))} ({fb.rating})
                          </span>
                          <div style={{ fontSize: "11px", color: "#94a3b8" }}>{fb.date}</div>
                        </div>
                      </div>

                      <p style={{ margin: 0, fontSize: "13px", color: "#334155", fontStyle: "italic", lineHeight: 1.5 }}>
                        "{fb.comment}"
                      </p>

                      {fb.reply ? (
                        <div style={{ marginTop: "4px", padding: "10px 14px", background: "#f0fdf4", borderRadius: "8px", borderLeft: "3px solid #16a34a" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: "700", color: "#15803d", marginBottom: "2px" }}>
                            <span>💬 Your Official Response</span>
                            <span style={{ color: "#64748b" }}>{fb.reply.date}</span>
                          </div>
                          <p style={{ margin: 0, fontSize: "12px", color: "#166534" }}>{fb.reply.text}</p>
                        </div>
                      ) : replyingId === fb.id ? (
                        <div style={{ marginTop: "8px", padding: "12px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                          <span style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px" }}>
                            Post Public Response to {fb.userName}:
                          </span>
                          <textarea
                            rows={2}
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            placeholder="Thank the client or clarify service details professionally..."
                            style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", boxSizing: "border-box" }}
                          />
                          <div style={{ display: "flex", gap: "8px", marginTop: "8px", justifyContent: "flex-end" }}>
                            <button
                              onClick={() => {
                                setReplyingId(null);
                                setReplyText("");
                              }}
                              style={btnOutline("#475569")}
                            >
                              Cancel
                            </button>
                            <button disabled={replySubmitting} onClick={() => handleSendFeedbackReply(fb.id)} style={btnSolid("#4f46e5")}>
                              {replySubmitting ? "Posting..." : "Submit Response ✓"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                          <button
                            onClick={() => {
                              setReplyingId(fb.id);
                              setReplyText("");
                            }}
                            style={{ padding: "4px 10px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "11px", fontWeight: "700", color: "#4f46e5", cursor: "pointer" }}
                          >
                            💬 Reply to Customer
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TAB 5: AVAILABILITY & SHIFTS                                   */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {tab === "availability" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "900px" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#0f172a" }}>Availability & Working Shifts</h2>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                  Configure your weekly schedule, operational radius, and instant emergency dispatch response.
                </p>
              </div>

              {/* Master Switch Card */}
              <div style={{ ...cardStyle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: "800" }}>Live Satellite On-Duty Status</h3>
                  <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                    When enabled, the FixIt dispatch algorithm matches nearby emergencies to your phone.
                  </p>
                </div>
                <button
                  onClick={handleToggleOnlineStatus}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "10px",
                    border: "none",
                    background: isAvailable ? "#16a34a" : "#dc2626",
                    color: "#ffffff",
                    fontWeight: "800",
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#fff" }} />
                  <span>{isAvailable ? "Online (On Duty)" : "Offline (Paused)"}</span>
                </button>
              </div>

              {/* Weekly Day-by-Day Shifts */}
              <div style={cardStyle}>
                <h3 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: "800" }}>Weekly Working Schedule</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {weeklySchedules.map((item, idx) => (
                    <div
                      key={item.day}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        background: item.is_active ? "#f8fafc" : "#f1f5f9",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "140px" }}>
                        <input
                          type="checkbox"
                          checked={item.is_active}
                          onChange={e => {
                            const updated = [...weeklySchedules];
                            updated[idx].is_active = e.target.checked;
                            setWeeklySchedules(updated);
                          }}
                          id={`day-${item.day}`}
                          style={{ cursor: "pointer", width: "16px", height: "16px" }}
                        />
                        <label htmlFor={`day-${item.day}`} style={{ fontWeight: "700", fontSize: "13px", cursor: "pointer" }}>
                          {item.day}
                        </label>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Clock size={14} color="#64748b" />
                        <input
                          type="time"
                          disabled={!item.is_active}
                          value={item.start_time}
                          onChange={e => {
                            const updated = [...weeklySchedules];
                            updated[idx].start_time = e.target.value;
                            setWeeklySchedules(updated);
                          }}
                          style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                        />
                        <span style={{ color: "#94a3b8" }}>to</span>
                        <input
                          type="time"
                          disabled={!item.is_active}
                          value={item.end_time}
                          onChange={e => {
                            const updated = [...weeklySchedules];
                            updated[idx].end_time = e.target.value;
                            setWeeklySchedules(updated);
                          }}
                          style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                        />
                      </div>

                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          color: item.is_active ? "#16a34a" : "#94a3b8"
                        }}
                      >
                        {item.is_active ? "Active Shift" : "Rest Day"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service Radius & Emergency Options */}
              <div style={{ ...cardStyle, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <h4 style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: "800" }}>Service Operating Radius</h4>
                  <p style={{ margin: "0 0 12px", fontSize: "12px", color: "#64748b" }}>
                    Limit customer dispatches to your preferred driving perimeter.
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <input
                      type="range"
                      min="3"
                      max="40"
                      value={serviceRadius}
                      onChange={e => setServiceRadius(parseInt(e.target.value, 10))}
                      style={{ flex: 1, accentColor: "#4f46e5" }}
                    />
                    <span style={{ fontSize: "14px", fontWeight: "800", color: "#4f46e5", minWidth: "60px" }}>
                      {serviceRadius} km
                    </span>
                  </div>
                </div>

                <div>
                  <h4 style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: "800" }}>Emergency Night Callouts</h4>
                  <p style={{ margin: "0 0 12px", fontSize: "12px", color: "#64748b" }}>
                    Accept urgent late-night calls for a 25% surge surcharge.
                  </p>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
                    <input
                      type="checkbox"
                      checked={emergencyCallouts}
                      onChange={e => setEmergencyCallouts(e.target.checked)}
                      style={{ width: "16px", height: "16px", cursor: "pointer" }}
                    />
                    <span>Opt into Emergency Night Callouts (+25% fee)</span>
                  </label>
                </div>
              </div>

              <button onClick={handleSaveAvailabilitySettings} style={{ ...btnSolid("#4f46e5"), padding: "12px 24px", alignSelf: "flex-start" }}>
                Save Availability Preferences ✓
              </button>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TAB 6: PORTFOLIO SHOWCASE                                      */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {tab === "portfolio" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#0f172a" }}>Portfolio & Work Gallery</h2>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                    Showcase before/after pictures and job milestones to attract high-value clients.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {["all", "Electrical", "Lighting", "Energy & Solar"].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setPortfolioCategory(cat)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "8px",
                        border: portfolioCategory === cat ? "1px solid #4f46e5" : "1px solid #cbd5e1",
                        background: portfolioCategory === cat ? "#4f46e5" : "#ffffff",
                        color: portfolioCategory === cat ? "#ffffff" : "#475569",
                        fontSize: "12px",
                        fontWeight: "700",
                        cursor: "pointer"
                      }}
                    >
                      {cat === "all" ? "All Projects" : cat}
                    </button>
                  ))}
                  <button onClick={() => setShowAddProjectModal(true)} style={btnSolid("#4f46e5")}>
                    <Plus size={14} style={{ marginRight: "4px" }} /> Add Project
                  </button>
                </div>
              </div>

              {/* Projects Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "18px" }}>
                {portfolio
                  .filter(p => portfolioCategory === "all" || p.category === portfolioCategory)
                  .map(p => (
                    <div
                      key={p.id}
                      style={{
                        background: "#ffffff",
                        borderRadius: "14px",
                        border: "1px solid #e2e8f0",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
                      }}
                    >
                      <div style={{ height: "160px", background: "#f1f5f9", overflow: "hidden", position: "relative" }}>
                        <img
                          src={p.image_url}
                          alt={p.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={e => {
                            e.target.src = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80";
                          }}
                        />
                        <span
                          style={{
                            position: "absolute",
                            top: "10px",
                            left: "10px",
                            background: "rgba(15, 23, 42, 0.75)",
                            color: "#fff",
                            fontSize: "11px",
                            fontWeight: "700",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            backdropFilter: "blur(4px)"
                          }}
                        >
                          {p.category}
                        </span>
                      </div>
                      <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>{p.title}</h3>
                            <span style={{ fontSize: "11px", color: "#94a3b8" }}>{p.date}</span>
                          </div>
                          <p style={{ margin: "0 0 14px", fontSize: "12.5px", color: "#64748b", lineHeight: 1.5 }}>
                            {p.description}
                          </p>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "10px" }}>
                          <span style={{ fontSize: "11px", background: "#dcfce7", color: "#15803d", padding: "2px 8px", borderRadius: "4px", fontWeight: "700" }}>
                            Verified Completed ✓
                          </span>
                          <button
                            onClick={() => handleDeleteProject(p.id)}
                            style={{ background: "transparent", border: "none", color: "#dc2626", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TAB 7: GROWTH & PERFORMANCE ANALYTICS                           */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {tab === "analytics" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#0f172a" }}>Performance & Career Growth</h2>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                  Algorithmic metrics that drive your dispatch priority and search rankings.
                </p>
              </div>

              {/* Top 4 Performance Badges */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                <div style={cardStyle}>
                  <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "700" }}>Acceptance Rate</div>
                  <div style={{ fontSize: "26px", fontWeight: "900", color: "#10b981", marginTop: "4px" }}>98.4%</div>
                  <div style={{ height: "4px", background: "#e2e8f0", borderRadius: "2px", margin: "8px 0 4px", overflow: "hidden" }}>
                    <div style={{ width: "98.4%", height: "100%", background: "#10b981" }} />
                  </div>
                  <span style={{ fontSize: "11px", color: "#15803d" }}>Elite Tier (Top 2% of Providers)</span>
                </div>

                <div style={cardStyle}>
                  <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "700" }}>Completion Rate</div>
                  <div style={{ fontSize: "26px", fontWeight: "900", color: "#4f46e5", marginTop: "4px" }}>99.2%</div>
                  <div style={{ height: "4px", background: "#e2e8f0", borderRadius: "2px", margin: "8px 0 4px", overflow: "hidden" }}>
                    <div style={{ width: "99.2%", height: "100%", background: "#4f46e5" }} />
                  </div>
                  <span style={{ fontSize: "11px", color: "#4338ca" }}>Zero cancellations past 30 days</span>
                </div>

                <div style={cardStyle}>
                  <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "700" }}>On-Time Arrival</div>
                  <div style={{ fontSize: "26px", fontWeight: "900", color: "#2563eb", marginTop: "4px" }}>97.6%</div>
                  <div style={{ height: "4px", background: "#e2e8f0", borderRadius: "2px", margin: "8px 0 4px", overflow: "hidden" }}>
                    <div style={{ width: "97.6%", height: "100%", background: "#2563eb" }} />
                  </div>
                  <span style={{ fontSize: "11px", color: "#1d4ed8" }}>Average ETA: 9.4 minutes</span>
                </div>

                <div style={cardStyle}>
                  <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "700" }}>Satisfaction Score</div>
                  <div style={{ fontSize: "26px", fontWeight: "900", color: "#eab308", marginTop: "4px" }}>4.9 / 5.0</div>
                  <div style={{ height: "4px", background: "#e2e8f0", borderRadius: "2px", margin: "8px 0 4px", overflow: "hidden" }}>
                    <div style={{ width: "98%", height: "100%", background: "#eab308" }} />
                  </div>
                  <span style={{ fontSize: "11px", color: "#a16207" }}>Based on 48 customer reviews</span>
                </div>
              </div>

              {/* Visual Weekly Earnings & Category Breakdown */}
              <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "20px" }}>
                {/* Weekly Bar Chart */}
                <div style={cardStyle}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "800" }}>Weekly Revenue Trajectory (₹)</h3>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#16a34a" }}>Total: ₹11,000 this week</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: "160px", padding: "10px 0" }}>
                    {[
                      { day: "Mon", amt: 1250, jobs: 2 },
                      { day: "Tue", amt: 1800, jobs: 3 },
                      { day: "Wed", amt: 950, jobs: 1 },
                      { day: "Thu", amt: 2400, jobs: 4 },
                      { day: "Fri", amt: 1600, jobs: 2 },
                      { day: "Sat", amt: 3100, jobs: 5 },
                      { day: "Sun", amt: 850, jobs: 1 }
                    ].map(d => {
                      const maxVal = 3200;
                      const barHeight = (d.amt / maxVal) * 120;
                      return (
                        <div key={d.day} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flex: 1 }}>
                          <span style={{ fontSize: "10.5px", fontWeight: "700", color: "#475569" }}>₹{d.amt}</span>
                          <div
                            style={{
                              width: "32px",
                              height: `${barHeight}px`,
                              background: "linear-gradient(180deg, #4f46e5 0%, #818cf8 100%)",
                              borderRadius: "6px 6px 0 0",
                              transition: "height 0.3s ease"
                            }}
                          />
                          <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>{d.day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Pro Tier & Badges */}
                <div style={{ ...cardStyle, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                      <Award size={20} color="#eab308" />
                      <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "800" }}>FixIt Tier: Level 3 Elite Pro</h3>
                    </div>
                    <p style={{ margin: "0 0 14px", fontSize: "12.5px", color: "#64748b", lineHeight: 1.5 }}>
                      You are in the top 2% of technicians across Bangalore. You receive priority emergency dispatch routing.
                    </p>
                    <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>
                        <span>88 / 100 Points</span>
                        <span style={{ color: "#4f46e5" }}>12 pts to Master Platinum</span>
                      </div>
                      <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ width: "88%", height: "100%", background: "#4f46e5" }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#16a34a" }}>
                      <Check size={14} /> Priority algorithm placement in Indiranagar
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#16a34a" }}>
                      <Check size={14} /> Zero commission on instant bank withdrawals
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#16a34a" }}>
                      <Check size={14} /> Official Verified Pro badge visible to all clients
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TAB 8: NOTIFICATIONS & ALERTS                                  */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {tab === "notifications" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#0f172a" }}>Alerts & Payment Notifications</h2>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                    Stay informed with payment confirmations, new bookings, and urgent dispatches.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => {
                      setNotifications(notifications.map(n => ({ ...n, unread: false })));
                      showToast("All marked as read.");
                    }}
                    style={btnOutline("#4f46e5")}
                  >
                    Mark All as Read
                  </button>
                  {["all", "payment", "dispatch"].map(f => (
                    <button
                      key={f}
                      onClick={() => setNotifFilter(f)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "8px",
                        border: notifFilter === f ? "1px solid #4f46e5" : "1px solid #cbd5e1",
                        background: notifFilter === f ? "#4f46e5" : "#ffffff",
                        color: notifFilter === f ? "#ffffff" : "#475569",
                        fontSize: "12px",
                        fontWeight: "700",
                        cursor: "pointer"
                      }}
                    >
                      {f === "all" ? "All" : f === "payment" ? "💳 Payments" : "🚨 Dispatches"}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {notifications
                  .filter(n => notifFilter === "all" || n.type === notifFilter)
                  .map(n => (
                    <div
                      key={n.id}
                      style={{
                        ...cardStyle,
                        borderLeft: n.type === "payment" ? "4px solid #16a34a" : n.type === "dispatch" ? "4px solid #dc2626" : "4px solid #4f46e5",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "14px" }}>{n.type === "payment" ? "💳" : n.type === "dispatch" ? "🚨" : "📢"}</span>
                          <strong style={{ fontSize: "14px", color: n.type === "payment" ? "#15803d" : "#0f172a" }}>{n.title}</strong>
                          {n.unread && (
                            <span style={{ background: "#dc2626", color: "#fff", fontSize: "10px", padding: "1px 6px", borderRadius: "10px", fontWeight: "800" }}>
                              NEW
                            </span>
                          )}
                        </div>
                        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#334155" }}>{n.message}</p>
                      </div>
                      <span style={{ fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap" }}>{n.time}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MODAL: WITHDRAW FUNDS & PAYOUTS                                */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {showWithdrawModal && (
        <div style={modalBackdropStyle} onClick={() => setShowWithdrawModal(false)}>
          <div style={modalCardStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <DollarSign size={20} color="#16a34a" />
                <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800" }}>Instant Balance Payout</h3>
              </div>
              <button onClick={() => setShowWithdrawModal(false)} style={closeBtnStyle}>
                <X size={18} />
              </button>
            </div>

            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "14px", borderRadius: "10px", marginBottom: "16px" }}>
              <span style={{ fontSize: "12px", color: "#166534", fontWeight: "700" }}>Available For Withdrawal</span>
              <div style={{ fontSize: "28px", fontWeight: "900", color: "#15803d" }}>
                ₹{metrics.available_balance.toLocaleString()}
              </div>
            </div>

            <form onSubmit={handleExecuteWithdrawal} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12.5px", fontWeight: "700", display: "block", marginBottom: "6px" }}>
                  Withdrawal Amount (₹)
                </label>
                <input
                  type="number"
                  min="100"
                  max={metrics.available_balance}
                  value={withdrawForm.amount}
                  onChange={e => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                  style={inputStyle}
                  required
                />
                <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                  {["1000", "2500", "5000", `${metrics.available_balance}`].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setWithdrawForm({ ...withdrawForm, amount: amt })}
                      style={{ padding: "4px 8px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}
                    >
                      {amt === `${metrics.available_balance}` ? "Max All" : `₹${amt}`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12.5px", fontWeight: "700", display: "block", marginBottom: "6px" }}>
                  Destination Method
                </label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <label style={{ flex: 1, padding: "10px", border: withdrawForm.method === "bank" ? "2px solid #16a34a" : "1px solid #cbd5e1", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: "700" }}>
                    <input
                      type="radio"
                      name="payoutMethod"
                      checked={withdrawForm.method === "bank"}
                      onChange={() => setWithdrawForm({ ...withdrawForm, method: "bank" })}
                    />
                    <span>Bank (HDFC ****4821)</span>
                  </label>
                  <label style={{ flex: 1, padding: "10px", border: withdrawForm.method === "upi" ? "2px solid #16a34a" : "1px solid #cbd5e1", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: "700" }}>
                    <input
                      type="radio"
                      name="payoutMethod"
                      checked={withdrawForm.method === "upi"}
                      onChange={() => setWithdrawForm({ ...withdrawForm, method: "upi" })}
                    />
                    <span>Direct UPI ID</span>
                  </label>
                </div>
              </div>

              {withdrawForm.method === "upi" && (
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>
                    Your UPI VPA Address:
                  </label>
                  <input
                    type="text"
                    value={withdrawForm.upiId}
                    onChange={e => setWithdrawForm({ ...withdrawForm, upiId: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button type="button" onClick={() => setShowWithdrawModal(false)} style={{ ...btnOutline("#475569"), flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" style={{ ...btnSolid("#16a34a"), flex: 2, padding: "10px" }}>
                  Confirm Payout Now ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MODAL: ADD PORTFOLIO PROJECT                                   */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {showAddProjectModal && (
        <div style={modalBackdropStyle} onClick={() => setShowAddProjectModal(false)}>
          <div style={modalCardStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800" }}>Add Completed Project</h3>
              <button onClick={() => setShowAddProjectModal(false)} style={closeBtnStyle}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddProject} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12.5px", fontWeight: "700", display: "block", marginBottom: "4px" }}>
                  Project Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Inverter Installation & Dual MCB Setup"
                  value={newProject.title}
                  onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "12.5px", fontWeight: "700", display: "block", marginBottom: "4px" }}>
                  Category
                </label>
                <select
                  value={newProject.category}
                  onChange={e => setNewProject({ ...newProject, category: e.target.value })}
                  style={inputStyle}
                >
                  <option value="Electrical">Electrical</option>
                  <option value="Lighting">Lighting</option>
                  <option value="Energy & Solar">Energy & Solar</option>
                  <option value="Appliance Fix">Appliance Fix</option>
                  <option value="Plumbing">Plumbing</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12.5px", fontWeight: "700", display: "block", marginBottom: "4px" }}>
                  Project Image URL
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={newProject.image_url}
                  onChange={e => setNewProject({ ...newProject, image_url: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ fontSize: "12.5px", fontWeight: "700", display: "block", marginBottom: "4px" }}>
                  Detailed Work Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe tools used, parts installed, and verification steps taken..."
                  value={newProject.description}
                  onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                  style={{ ...inputStyle, resize: "none" }}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button type="button" onClick={() => setShowAddProjectModal(false)} style={{ ...btnOutline("#475569"), flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" style={{ ...btnSolid("#4f46e5"), flex: 2, padding: "10px" }}>
                  Publish to Portfolio ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MODAL: EDIT HANDYMAN PROFILE                                   */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {showProfileModal && (
        <div style={modalBackdropStyle} onClick={() => setShowProfileModal(false)}>
          <div style={modalCardStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <User size={20} color="#4f46e5" />
                <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800" }}>Edit Provider Profile</h3>
              </div>
              <button onClick={() => setShowProfileModal(false)} style={closeBtnStyle}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Full Name</label>
                  <input
                    type="text"
                    value={handyman.name}
                    onChange={e => setHandyman({ ...handyman, name: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Specialization</label>
                  <input
                    type="text"
                    value={handyman.category}
                    onChange={e => setHandyman({ ...handyman, category: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Phone Number</label>
                  <input
                    type="text"
                    value={handyman.phone}
                    onChange={e => setHandyman({ ...handyman, phone: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>WhatsApp Number</label>
                  <input
                    type="text"
                    value={handyman.whatsapp}
                    onChange={e => setHandyman({ ...handyman, whatsapp: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Service Area / City</label>
                  <input
                    type="text"
                    value={handyman.area}
                    onChange={e => setHandyman({ ...handyman, area: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Experience</label>
                  <input
                    type="text"
                    value={handyman.exp}
                    onChange={e => setHandyman({ ...handyman, exp: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Professional Bio</label>
                <textarea
                  rows={2}
                  value={handyman.bio}
                  onChange={e => setHandyman({ ...handyman, bio: e.target.value })}
                  style={{ ...inputStyle, resize: "none" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button type="button" onClick={() => setShowProfileModal(false)} style={{ ...btnOutline("#475569"), flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" style={{ ...btnSolid("#4f46e5"), flex: 2, padding: "10px" }}>
                  Save Profile Changes ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── STYLING HELPERS ───
const cardStyle = {
  background: "#ffffff",
  padding: "20px",
  borderRadius: "16px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 1px 3px rgba(15, 23, 42, 0.03)"
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  fontSize: "13px",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit"
};

const thStyle = {
  padding: "12px 16px",
  fontSize: "12px",
  fontWeight: "700"
};

const tdStyle = {
  padding: "14px 16px"
};

const btnSolid = (bg, padding = "8px 14px") => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding,
  background: bg,
  color: "#ffffff",
  border: "none",
  borderRadius: "8px",
  fontSize: "12.5px",
  fontWeight: "700",
  cursor: "pointer",
  textDecoration: "none"
});

const btnOutline = (color, padding = "8px 14px") => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding,
  background: "#ffffff",
  color: color,
  border: `1px solid #cbd5e1`,
  borderRadius: "8px",
  fontSize: "12.5px",
  fontWeight: "700",
  cursor: "pointer",
  textDecoration: "none"
});

const modalBackdropStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(15, 23, 42, 0.6)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000
};

const modalCardStyle = {
  background: "#ffffff",
  borderRadius: "16px",
  width: "100%",
  maxWidth: "480px",
  padding: "24px",
  boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)",
  maxHeight: "90vh",
  overflowY: "auto"
};

const closeBtnStyle = {
  background: "transparent",
  border: "none",
  color: "#94a3b8",
  cursor: "pointer",
  padding: "4px"
};
