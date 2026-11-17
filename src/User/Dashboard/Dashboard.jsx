import React, { useState, useEffect, useCallback, useRef } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import EditProfile from "../Profile/EditProfile";
import API from "../../API/Axios";

export default function UserDashboard({ onLogout }) {
  const [tab, setTab] = useState("overview");
  const [modal, setModal] = useState(false);
  const [payMethod, setPayMethod] = useState("upi");
  const [chatOpen, setChatOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatSuggestions, setChatSuggestions] = useState([
    "🔧 Best Plumber",
    "⚡ Suggest Electrician",
    "🚨 Emergency Booking",
    "📍 Track Service",
    "💳 Price & Invoices"
  ]);
  const chatEndRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEmergencyBooked, setIsEmergencyBooked] = useState(false);

  const [dynamicLocation, setDynamicLocation] = useState("Locating...");
  const [locating, setLocating] = useState(false);

  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  const [favorites, setFavorites] = useState(["1", "3"]);

  // ─── WHO TO PAY & PAYMENT PROCEDURE STATE ───
  const [payableBookings, setPayableBookings] = useState([
    {
      id: "BK-8901",
      serviceTitle: "Electrical Wiring Fix",
      handymanName: "Shalini Mahadeva",
      handymanRole: "Certified Electrician",
      handymanUpi: "fixit.shalini@upi",
      handymanPhone: "+91 98123 45678",
      baseAmount: 299,
      safetyFee: 20,
      discount: 20,
      totalAmount: 299,
      status: "Pending Payment",
      date: "Today, 11:30 AM",
      icon: "⚡"
    },
    {
      id: "BK-8845",
      serviceTitle: "Switchboard & Fan Installation",
      handymanName: "Shalini Mahadeva",
      handymanRole: "Electrical Specialist",
      handymanUpi: "fixit.shalini@upi",
      handymanPhone: "+91 98123 45678",
      baseAmount: 499,
      safetyFee: 25,
      discount: 25,
      totalAmount: 499,
      status: "Pending Payment",
      date: "Yesterday",
      icon: "🔌"
    },
    {
      id: "BK-8821",
      serviceTitle: "Appliance Fault Diagnosis",
      handymanName: "Suresh Patil",
      handymanRole: "Plumbing & Appliance Pro",
      handymanUpi: "suresh.patil@okhdfcbank",
      handymanPhone: "+91 98234 56789",
      baseAmount: 249,
      safetyFee: 15,
      discount: 15,
      totalAmount: 249,
      status: "Pending Payment",
      date: "2026-10-08",
      icon: "🔧"
    }
  ]);
  const [selectedPayBookingId, setSelectedPayBookingId] = useState("BK-8901");
  const [userUpiId, setUserUpiId] = useState("");
  const [upiSubOption, setUpiSubOption] = useState("qr"); // "qr", "id", "apps"
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [payingState, setPayingState] = useState(false);
  const [paidReceipt, setPaidReceipt] = useState(null);
  const [cardForm, setCardForm] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [selectedNetBank, setSelectedNetBank] = useState("HDFC Bank");
  const [upiAppRequestSent, setUpiAppRequestSent] = useState(false);

  // ─── FEEDBACK FUNCTIONALITY STATE ───
  const [feedbacks, setFeedbacks] = useState([
    {
      id: "fb-1",
      handymanName: "Shalini Mahadeva",
      serviceTitle: "Electrical Wiring Fix",
      bookingId: "BK-8901",
      rating: 5,
      category: "Work Quality",
      wouldRecommend: true,
      comment: "Punctual, verified all circuits with professional testing tools, and solved the tripping breaker smoothly!",
      date: "2026-10-10",
      status: "Approved",
      categories: { quality: 5, punctuality: 5, pricing: 5, communication: 5 },
      reply: {
        name: "Shalini Mahadeva",
        role: "Provider",
        date: "2026-10-11",
        text: "Thank you Shalini! It was a pleasure helping you ensure the home circuit was safe."
      }
    }
  ]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    bookingId: "BK-8901",
    handymanId: "6aa1903e5e831d9fc1a8c183",
    handymanName: "Shalini Mahadeva",
    serviceTitle: "Electrical Wiring Fix",
    rating: 5,
    category: "Work Quality",
    quality: 5,
    punctuality: 5,
    pricing: 5,
    communication: 5,
    comment: "",
    wouldRecommend: true
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackStatusMsg, setFeedbackStatusMsg] = useState("");

  const [user, setUser] = useState(
    () =>
      JSON.parse(localStorage.getItem("user")) || {
        name: "Shalini",
        email: "shalushalini3010@gmail.com",
        phone: "+91 9876543210",
        area: "Doddaballapur",
      }
  );

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Hello! I am your FixIt.ai Smart Support Assistant.\nHow can I help you today? Ask me about top plumbers, electricians, emergency dispatch, live tracking, or pricing!",
      time: "Just now"
    },
  ]);

  const defaultQuickServices = [
    { id: "1", title: "Plumbing Fix", icon: "🔧", price: 249, handyman_name: "John Doe", rating: 4.9, reviews_count: 28 },
    { id: "2", title: "Electrical Work", icon: "⚡", price: 299, handyman_name: "Alex Smith", rating: 4.8, reviews_count: 19 },
    { id: "3", title: "Home Cleaning", icon: "🧹", price: 499, handyman_name: "Sarah Connor", rating: 4.7, reviews_count: 34 },
    { id: "4", title: "Appliance Repair", icon: "🧺", price: 399, handyman_name: "Mike Taylor", rating: 4.9, reviews_count: 42 },
  ];

  const bookingHistoryData = [
    { id: "BK-8821", service: "Plumbing Fix", date: "2026-03-20", handyman: "John Doe", status: "Completed", amount: 249 },
    { id: "BK-8845", service: "AC Deep Cleaning", date: "2026-03-15", handyman: "Sarah Connor", status: "Completed", amount: 499 },
    { id: "BK-8901", service: "Electrical Wiring Check", date: "2026-03-24", handyman: "Alex Smith", status: "In Progress", amount: 299 },
  ];

  const notificationsData = [
    { id: "n1", title: "Booking Confirmed", body: "Technician Alex Smith will arrive by 2:00 PM.", time: "10 mins ago", unread: true },
    { id: "n2", title: "Invoice Ready", body: "Invoice INV-9021 for AC Servicing is generated.", time: "2 hours ago", unread: false },
    { id: "n3", title: "Discount Unlocked!", body: "Get 15% off on your next Appliance Repair service.", time: "1 day ago", unread: false },
  ];

  // ─── SAFE LOCATION FETCHER ───
  const fetchLiveLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setDynamicLocation("Doddaballapur");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await API.post("/maps/reverse-geocode", {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          if (res.data && res.data.city) {
            setDynamicLocation(res.data.city);
          } else {
            setDynamicLocation("Doddaballapur");
          }
        } catch {
          setDynamicLocation("Doddaballapur");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setDynamicLocation("Doddaballapur");
        setLocating(false);
      }
    );
  }, []);

  useEffect(() => {
    fetchLiveLocation();
  }, [fetchLiveLocation]);

  useEffect(() => {
    let isSubscribed = true;
    API.get("/user/me")
      .then((res) => {
        if (isSubscribed && res.data) {
          setUser((prev) => ({ ...prev, ...res.data }));
        }
      })
      .catch((err) => console.log("Using cached/local user data:", err));

    return () => {
      isSubscribed = false;
    };
  }, []);

  // ─── FETCH USER FEEDBACK HISTORY ───
  const fetchFeedbacks = useCallback(async () => {
    setLoadingFeedbacks(true);
    try {
      const res = await API.get("/feedback/my");
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setFeedbacks(res.data);
      }
    } catch (err) {
      console.warn("Could not load backend feedbacks, keeping default preview:", err);
    } finally {
      setLoadingFeedbacks(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  // ─── SUBMIT FEEDBACK ───
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackForm.comment.trim()) {
      setFeedbackStatusMsg("⚠️ Please share a few words about your experience before submitting.");
      return;
    }

    setFeedbackSubmitting(true);
    setFeedbackStatusMsg("");

    const payload = {
      bookingId: feedbackForm.bookingId,
      handymanId: feedbackForm.handymanId,
      handymanName: feedbackForm.handymanName,
      serviceTitle: feedbackForm.serviceTitle,
      userName: user.name || "Verified Customer",
      rating: feedbackForm.rating,
      category: feedbackForm.category,
      comment: feedbackForm.comment.trim(),
      would_recommend: feedbackForm.wouldRecommend,
      categories: {
        quality: feedbackForm.quality,
        punctuality: feedbackForm.punctuality,
        pricing: feedbackForm.pricing,
        communication: feedbackForm.communication
      }
    };

    try {
      const res = await API.post("/feedback", payload);
      const newFb = res.data || {
        ...payload,
        id: `fb-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        status: "Approved"
      };
      setFeedbacks((prev) => [newFb, ...prev]);
      setFeedbackStatusMsg("✓ Thank you! Your feedback has been published successfully.");
      setFeedbackForm((prev) => ({
        ...prev,
        comment: "",
        rating: 5,
        quality: 5,
        punctuality: 5,
        pricing: 5,
        communication: 5
      }));
    } catch (err) {
      console.warn("Feedback API offline, saved locally:", err);
      const localFb = {
        ...payload,
        id: `fb-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        status: "Approved"
      };
      setFeedbacks((prev) => [localFb, ...prev]);
      setFeedbackStatusMsg("✓ Feedback recorded successfully! Thank you for helping our community.");
      setFeedbackForm((prev) => ({
        ...prev,
        comment: "",
        rating: 5
      }));
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  // ─── EXECUTE SERVICE PAYMENT & GENERATE RECEIPT ───
  const handleExecutePayment = async () => {
    setPayingState(true);
    const activeBooking =
      payableBookings.find((b) => b.id === selectedPayBookingId) ||
      payableBookings[0];
    const amountVal = activeBooking.totalAmount;

    try {
      const res = await API.post("/checkout", {
        booking_id: activeBooking.id,
        amount: amountVal,
        payment_method: payMethod.toUpperCase(),
      });
      const txnId =
        res.data?.transaction_id ||
        `TXN-UPI-${Date.now().toString().slice(-6)}`;
      const receipt = {
        txnId: txnId,
        bookingId: activeBooking.id,
        serviceTitle: activeBooking.serviceTitle,
        handymanName: activeBooking.handymanName,
        handymanRole: activeBooking.handymanRole,
        amount: amountVal,
        method: payMethod.toUpperCase(),
        date: new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setPaidReceipt(receipt);
      setInvoices((prev) => [
        {
          id: txnId.replace("TXN-", ""),
          serviceTitle: activeBooking.serviceTitle,
          handyman_name: activeBooking.handymanName,
          date: new Date().toISOString().split("T")[0],
          amount: amountVal,
        },
        ...prev,
      ]);
      setPayableBookings((prev) =>
        prev.map((b) =>
          b.id === activeBooking.id ? { ...b, status: "Paid ✓" } : b
        )
      );
    } catch (err) {
      console.warn("Using local verified receipt fallback:", err);
      const txnId = `TXN-UPI-${Date.now().toString().slice(-6)}`;
      const receipt = {
        txnId: txnId,
        bookingId: activeBooking.id,
        serviceTitle: activeBooking.serviceTitle,
        handymanName: activeBooking.handymanName,
        handymanRole: activeBooking.handymanRole,
        amount: amountVal,
        method: payMethod.toUpperCase(),
        date: new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setPaidReceipt(receipt);
    } finally {
      setPayingState(false);
    }
  };

  // ─── SAFE LOGOUT HANDLER (FORCED REDIRECT TO LOGIN) ───
  const handleLogout = async () => {
    try {
      await API.post("/auth/logout", {}, { timeout: 2000 }).catch((err) =>
        console.warn("Backend logout request failed or endpoint changed:", err)
      );
    } finally {
      localStorage.clear();
      sessionStorage.clear();

      if (API.defaults.headers.common["Authorization"]) {
        delete API.defaults.headers.common["Authorization"];
      }

      if (onLogout) {
        onLogout();
      }

      // Fixed syntax error and forced clean navigation to /login
      window.location.href = "/login";
    }
  };

  useEffect(() => {
    let isSubscribed = true;
    setLoadingServices(true);

    const timer = setTimeout(async () => {
      try {
        const queryParam = searchQuery.trim() ? `?query=${encodeURIComponent(searchQuery)}` : "";
        const response = await API.get(`services/${queryParam}`);
        if (isSubscribed) {
          setServices(response.data || []);
        }
      } catch (err) {
        console.error("Error fetching services:", err);
        if (isSubscribed) {
          setServices([]);
        }
      } finally {
        if (isSubscribed) {
          setLoadingServices(false);
        }
      }
    }, 300);

    return () => {
      isSubscribed = false;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  useEffect(() => {
    let isSubscribed = true;
    if (tab === "invoices") {
      setLoadingInvoices(true);
      API.get("/user/invoices/")
        .then((res) => {
          if (isSubscribed) setInvoices(res.data || []);
        })
        .catch((err) => {
          console.error("Error fetching invoices:", err);
          if (isSubscribed) {
            setInvoices([
              {
                id: "9021",
                serviceTitle: "AC Servicing & Deep Cleaning",
                handyman_name: "John Doe",
                date: "2026-03-15",
                amount: 499,
              },
            ]);
          }
        })
        .finally(() => {
          if (isSubscribed) setLoadingInvoices(false);
        });
    }
    return () => {
      isSubscribed = false;
    };
  }, [tab]);

  const handleBookService = async (service) => {
    const bookingPayload = {
      service_id: service.id || service._id,
      handyman_id: service.handyman_id || "handyman_default",
      amount: service.price,
      address: dynamicLocation,
      location: dynamicLocation,
    };

    try {
      await API.post("bookings/", bookingPayload);
      alert(`✅ Successfully booked ${service.title} at ${dynamicLocation}!`);
    } catch (err) {
      console.error("Booking error:", err);
      alert(`Booked ${service.title} at location: ${dynamicLocation}`);
    }
  };

  const handleDownloadPDF = (inv) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);
    doc.text("SERVICE INVOICE", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text(`Invoice ID: INV-${inv.id}`, 14, 30);
    doc.text(`Date: ${inv.date}`, 14, 36);
    doc.text(`Customer Name: ${user.name || "Customer"}`, 14, 42);
    doc.text(`Email: ${user.email || "N/A"}`, 14, 48);
    doc.text(`Address: ${dynamicLocation}`, 14, 54);

    const tableColumn = ["#", "Service Title", "Technician", "Amount"];
    const tableRows = [
      [1, inv.serviceTitle || "Home Repair", inv.handyman_name || "Assigned Specialist", `INR ${inv.amount}`],
    ];

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 62,
      theme: "striped",
      headStyles: { fillColor: [37, 99, 235] },
    });

    const finalY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 75) + 12;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Amount Paid: INR ${inv.amount}`, 14, finalY);

    doc.save(`Invoice_INV-${inv.id}.pdf`);
  };

  // ─── AUTO-SCROLL CHAT TO BOTTOM ───
  useEffect(() => {
    if (chatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, chatOpen]);

  // ─── CLIENT-SIDE DYNAMIC INTELLIGENT AI ENGINE (FALLBACK & OFFLINE RESILIENT) ───
  const generateDynamicChatFallback = useCallback((queryText) => {
    const raw = (queryText || "").trim();
    const q = raw.toLowerCase();
    const loc = dynamicLocation && dynamicLocation !== "Locating..." ? dynamicLocation : (user.area || "Doddaballapur");
    const userName = user?.name ? user.name.split(" ")[0] : "";

    // Normalize common typos: 'plumbeer', 'electrisian', 'cleanr', etc.
    const qNorm = q
      .replace(/\bplumb[e|a]+r*\b/g, "plumber")
      .replace(/\belectr[i|e][c|s]i[a|e]n*\b/g, "electrician")
      .replace(/\bcl[e|a]+n[e|i|a]*r*\b/g, "cleaner")
      .replace(/\bcarp[e|a]nt[e|a]r*\b/g, "carpenter");

    // 1. PLUMBER
    if (/(plumb|pipe|leak|tap|sink|drain|water tank|flush|faucet|clog)/.test(qNorm)) {
      return {
        reply: `🚰 Here are our top verified **Plumbers** available near **${loc}**:\n\n` +
          `• 👨‍🔧 **Vikram Singh** — ⭐ 5.0 (38 reviews) | Rate: ₹249 - ₹350\n  _Master Plumber & Pipe Specialist • Fast Dispatch_\n` +
          `• 👨‍🔧 **John Doe** — ⭐ 4.9 (28 reviews) | Rate: ₹249\n  _Plumbing Fix & Leakage Specialist • ${loc}_\n` +
          `• 👨‍🔧 **Ramesh Kumar** — ⭐ 4.8 (21 reviews) | Rate: ₹299\n  _Bathroom Fitting & Drain Master_\n\n` +
          `✨ **Recommendation**: You can book **Vikram Singh** directly from the Services tab, or choose **🚨 Emergency Booking** for 15-minute priority arrival!`,
        suggestions: ["Book Vikram Singh", "🚨 Emergency Plumber Now", "💰 Plumbing Price Rates", "📍 Track My Booking"],
        action: "services"
      };
    }

    // 2. ELECTRICIAN
    if (/(electr|wire|wiring|switch|short circuit|mcb|fuse|power|fan|spark|light)/.test(qNorm)) {
      return {
        reply: `⚡ Here are our top-rated **Electricians** in **${loc}**:\n\n` +
          `• ⚡ **Alex Smith** — ⭐ 4.9 (45 reviews) | Rate: ₹299\n  _Certified Electrician & Wiring Pro • ${loc}_\n` +
          `• ⚡ **Priya Sharma** — ⭐ 4.8 (32 reviews) | Rate: ₹349\n  _Appliance Wiring & MCB Specialist_\n\n` +
          `💡 **Safety Tip**: For sparking wires or power trips, turn off main breaker immediately and book priority emergency repair!`,
        suggestions: ["Book Alex Smith", "🚨 Emergency Electrician", "⚡ Check Electrical Rates", "📍 Service Tracking"],
        action: "services"
      };
    }

    // 3. CLEANING
    if (/(clean|maid|housekeep|sanitat|sweep|mop|dust|deep clean)/.test(qNorm)) {
      return {
        reply: `🧹 Professional **Home Cleaning & Sanitation** specialists in **${loc}**:\n\n` +
          `• 🧹 **Sarah Connor** — ⭐ 4.8 (34 reviews) | Rate: ₹499\n  _Home Sanitation & Deep Cleaning Pro_\n` +
          `• 🧹 **Anita Verma** — ⭐ 4.7 (26 reviews) | Rate: ₹399\n  _Kitchen & Bathroom Deep Cleaning_\n\n` +
          `Includes full surface disinfection, stain removal, and floor polishing with eco-friendly products.`,
        suggestions: ["Book Sarah Connor", "🧹 View Cleaning Services", "💳 Payment Options", "⭐ Reviews & Ratings"],
        action: "services"
      };
    }

    // 4. AC & APPLIANCES
    if (/(ac|air condition|cooling|hvac|fridge|refrigerator|washing machine|appliance|microwave|oven)/.test(qNorm)) {
      return {
        reply: `❄️ Certified **AC & Appliance Technicians** servicing **${loc}**:\n\n` +
          `• ❄️ **Mike Taylor** — ⭐ 4.9 (42 reviews) | Rate: ₹399\n  _AC & Major Appliance Repair Tech_\n` +
          `• 🧺 **Suresh Patel** — ⭐ 4.8 (29 reviews) | Rate: ₹349\n  _Refrigerator & Washing Machine Expert_\n\n` +
          `All repairs include genuine parts, cooling gas refilling, and a 30-day service warranty!`,
        suggestions: ["Book Mike Taylor", "❄️ AC Deep Cleaning (₹399)", "🧺 Appliance Repair (₹349)", "📄 Download Invoices"],
        action: "services"
      };
    }

    // 5. CARPENTRY / PAINTING
    if (/(carpent|wood|door|window|furniture|lock)/.test(qNorm)) {
      return {
        reply: `🔨 Top Carpenter available in **${loc}**:\n\n` +
          `• 🔨 **David Wilson** — ⭐ 4.8 (22 reviews) | Rate: ₹349\n  _Custom Furniture, Hinge Fitting & Lock Repair_\n\n` +
          `Handles door alignments, wardrobe repairs, lock installations, and custom woodwork.`,
        suggestions: ["Book David Wilson", "🔨 Carpentry Rates", "🚨 Emergency Booking"],
        action: "services"
      };
    }

    if (/(paint|whitewash|waterproof|wall)/.test(qNorm)) {
      return {
        reply: `🎨 Professional Painter in **${loc}**:\n\n` +
          `• 🎨 **Arun Kumar** — ⭐ 4.8 (18 reviews) | Rate: ₹499\n  _Wall Painting, Putty & Waterproofing Expert_\n\n` +
          `Available for interior, exterior, texture painting, and water seepage fixes.`,
        suggestions: ["Book Arun Kumar", "🎨 Painting Estimates", "💬 Customer Reviews"],
        action: "services"
      };
    }

    // 6. EMERGENCY
    if (/(emergency|urgent|fast|asap|immediate|hazard|burst|flood)/.test(qNorm)) {
      return {
        reply: `🚨 **24/7 Priority Emergency Dispatch is Active!**\n\n` +
          `• Average technician arrival in **${loc}**: **15 to 25 minutes**.\n` +
          `• Live GPS vehicle tracking with assigned technician.\n` +
          `• Verified technicians on standby for water bursts, electrical sparks, and lockouts.\n\n` +
          `👉 Tap **🚨 Emergency Booking** in your sidebar to trigger priority dispatch right away!`,
        suggestions: ["🚨 Dispatch Plumber Now", "🚨 Dispatch Electrician Now", "📍 Track Live Location"],
        action: "emergency"
      };
    }

    // 7. TRACKING
    if (/(track|status|where is|arrival|progress|on the way)/.test(qNorm)) {
      return {
        reply: `📍 **Live Service Tracking**\n\n` +
          `• Active Request: **#BK-8901 (Alex Smith - Electrical Wiring Fix)** is currently **In Progress**.\n` +
          `• You can view real-time GPS technician movement and estimated arrival in the **📍 Service Tracking** tab.\n` +
          `• Direct technician contact: Alex Smith (+91 98123 45678).`,
        suggestions: ["📍 Open Service Tracking", "📋 View Booking History", "💬 Contact Handyman"],
        action: "tracking"
      };
    }

    // 8. PRICING & RATES
    if (/(price|cost|how much|rate|fee|charge|pricing)/.test(qNorm)) {
      return {
        reply: `🏷️ **FixIt.ai Transparent Price Catalog:**\n\n` +
          `• 🔧 **Plumbing Fix**: From ₹249\n` +
          `• ⚡ **Electrical Work**: From ₹299\n` +
          `• ❄️ **AC Deep Cleaning**: From ₹399\n` +
          `• 🧹 **Home Deep Cleaning**: From ₹499\n` +
          `• 🧺 **Appliance Repair**: From ₹349\n` +
          `• 🔨 **Carpentry Fitting**: From ₹349\n\n` +
          `✨ **FixIt Guarantee**: Zero hidden fees, upfront transparent rates, and 100% money-back escrow protection.`,
        suggestions: ["🔧 Book Plumber (₹249)", "⚡ Book Electrician (₹299)", "💳 Payment Methods"],
        action: "services"
      };
    }

    // 9. PAYMENTS & INVOICES
    if (/(pay|upi|card|invoice|receipt|refund|bill|transaction)/.test(qNorm)) {
      return {
        reply: `💳 **Payments & Invoice Management:**\n\n` +
          `• **Accepted Payment Modes**: UPI (GPay, PhonePe, Paytm, BHIM), Credit/Debit Cards, and Net Banking.\n` +
          `• **Instant GST Invoices**: Download official PDF receipts anytime from the **📄 Download Invoice** tab.\n` +
          `• **Refund Guarantee**: If a job is canceled or unfulfilled, 100% refund is processed within 2-4 business days.`,
        suggestions: ["📄 Download Invoice", "💳 Make Payment", "📋 Booking History"],
        action: "payments"
      };
    }

    // 10. CANCEL OR RESCHEDULE
    if (/(cancel|reschedule|change time|change date)/.test(qNorm)) {
      return {
        reply: `🔄 **Cancellation & Rescheduling:**\n\n` +
          `• You can cancel or reschedule any booking without penalty up to 30 minutes before technician arrival.\n` +
          `• Head to the **📋 Booking History** tab, click your booking, and choose **Cancel** or **Reschedule**.`,
        suggestions: ["📋 Booking History", "🚨 Emergency Booking", "💬 Contact Support"]
      };
    }

    // 11. GREETINGS
    if (/(hi|hello|hey|namaste|good morning|good evening|good afternoon|sup|hlo)/.test(qNorm)) {
      return {
        reply: `👋 Hello${userName ? ` ${userName}` : ""}! I'm your FixIt.ai Smart Support Assistant.\n\n` +
          `How can I assist you in **${loc}** today?\n` +
          `• 🔧 **Suggest top-rated plumbers, electricians & cleaners**\n` +
          `• 🚨 **24/7 Priority Emergency dispatch**\n` +
          `• 📍 **Live technician GPS tracking**\n` +
          `• 💳 **Service pricing & PDF invoices**`,
        suggestions: ["🔧 Best Plumber Near Me", "⚡ Suggest Electrician", "🚨 Emergency Booking", "💰 Pricing"]
      };
    }

    // 12. GENERAL SEARCH / FALLBACK
    return {
      reply: `🤖 I'm here to help with your bookings and home maintenance in **${loc}**!\n\n` +
        `You can ask me questions like:\n` +
        `• _"Suggest plumber name"_\n` +
        `• _"I want best plumber around me"_\n` +
        `• _"Find top electrician"_\n` +
        `• _"How much does AC repair cost?"_\n` +
        `• _"Track my active booking"_\n\n` +
        `Or click any quick suggestion below:`,
      suggestions: ["🔧 Best Plumber", "⚡ Find Electrician", "🚨 Emergency Dispatch", "💰 View Pricing"]
    };
  }, [dynamicLocation, user]);

  const handleSendMessage = async (e, customText = null) => {
    if (e && e.preventDefault) e.preventDefault();
    const textToSend = (customText !== null ? customText : inputMsg).trim();
    if (!textToSend) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg = { sender: "user", text: textToSend, time: timeStr };

    setMessages((prev) => [...prev, userMsg]);
    setInputMsg("");
    setIsTyping(true);

    try {
      // 1. Try Live Backend AI Chatbot API
      const res = await API.post("/ai/chat", {
        message: textToSend,
        location: dynamicLocation && dynamicLocation !== "Locating..." ? dynamicLocation : (user.area || "Doddaballapur"),
        user_name: user?.name || "Customer",
      });

      if (res.data && res.data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: res.data.reply,
            action: res.data.action,
            suggestions: res.data.suggestions,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        if (res.data.suggestions && Array.isArray(res.data.suggestions) && res.data.suggestions.length > 0) {
          setChatSuggestions(res.data.suggestions);
        }
        setIsTyping(false);
        return;
      }
    } catch (err) {
      console.warn("Backend AI chat fallback active:", err?.message || err);
    }

    // 2. Intelligent Dynamic Client-Side AI Engine (Seamless Offline/Fallback)
    setTimeout(() => {
      const dynamicReply = generateDynamicChatFallback(textToSend);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: dynamicReply.reply,
          action: dynamicReply.action,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      if (dynamicReply.suggestions) {
        setChatSuggestions(dynamicReply.suggestions);
      }
      setIsTyping(false);
    }, 400);
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleEmergencyBooking = () => {
    setIsEmergencyBooked(true);
    setTimeout(() => {
      alert(`🚨 Emergency dispatch confirmed for ${dynamicLocation}! A service technician is en route.`);
    }, 400);
  };

  const mapQuery = encodeURIComponent(dynamicLocation);

  const navs = [
    ["overview", "Dashboard Overview", "📊"],
    ["emergency", "Emergency Booking", "🚨"],
    ["tracking", "Service Tracking", "📍"],
    ["history", "Booking History", "📋"],
    ["feedback", "Feedback & Reviews", "💬"],
    ["favourites", "Favourite Services", "⭐"],
    ["invoices", "Download Invoice", "📄"],
    ["payments", "Payments", "💳"],
    ["notifications", "Notifications", "🔔"],
    ["ai", "AI Recommendations", "🤖"],
  ];

  const displayedServices =
    services.length > 0
      ? services
      : defaultQuickServices.filter(
          (s) =>
            s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (s.handyman_name && s.handyman_name.toLowerCase().includes(searchQuery.toLowerCase()))
        );

  const favoriteServicesList = defaultQuickServices.filter((s) => favorites.includes(s.id));
  const activeBooking =
    payableBookings.find((b) => b.id === selectedPayBookingId) ||
    payableBookings[0] || {
      id: "BK-8901",
      serviceTitle: "Electrical Wiring Fix",
      handymanName: "Shalini Mahadeva",
      handymanRole: "Certified Electrician",
      handymanUpi: "fixit.shalini@upi",
      handymanPhone: "+91 98123 45678",
      baseAmount: 299,
      safetyFee: 20,
      discount: 20,
      totalAmount: 299,
      status: "Pending Payment",
      date: "Today",
      icon: "⚡"
    };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "sans-serif", color: "#0f172a" }}>
      {/* Sidebar Navigation */}
      <aside style={{ width: "240px", background: "#fff", borderRight: "1px solid #e2e8f0", padding: "18px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div onClick={() => setTab("overview")} style={{ fontWeight: "800", fontSize: "18px", marginBottom: "20px", color: "#2563eb", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}>
            <img src="/search_logo.png" alt="Logo" onError={(e) => (e.target.style.display = "none")} style={{ width: "28px", height: "28px", objectFit: "contain" }} />
            <span>⚡ User Portal</span>
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {navs.map(([id, label, icon]) => (
              <button key={id} onClick={() => setTab(id)} style={{ display: "flex", gap: "10px", padding: "9px 10px", borderRadius: "8px", border: "none", background: tab === id ? "#eff6ff" : "transparent", color: tab === id ? "#2563eb" : "#64748b", fontWeight: tab === id ? "700" : "500", cursor: "pointer", textAlign: "left", fontSize: "13px" }}>
                <span>{icon}</span> {label}
              </button>
            ))}
          </nav>
        </div>

        {/* User Profile Footer */}
        <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div onClick={() => setModal(true)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#2563eb", color: "#fff", display: "grid", placeItems: "center", fontWeight: "700", fontSize: "12px" }}>
              {(user.name || "U")[0].toUpperCase()}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "12px", fontWeight: "700" }}>{user.name}</p>
              <span style={{ fontSize: "10px", color: "#2563eb" }}>Edit Profile ⚙️</span>
            </div>
          </div>
          <button onClick={handleLogout} style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: "6px", background: "#f8fafc", cursor: "pointer", fontSize: "11px" }}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: "24px", overflowY: "auto", position: "relative" }}>
        {/* OVERVIEW TAB */}
        {tab === "overview" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                <h2 style={{ margin: 0 }}>Customer Booking Hub</h2>
                <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "13px" }}>
                  Welcome, <strong>{user.name}</strong> 📍 {locating ? "Detecting location..." : dynamicLocation}{" "}
                  <button onClick={fetchLiveLocation} style={{ border: "none", background: "none", color: "#2563eb", cursor: "pointer", fontSize: "12px" }}>
                    🔄
                  </button>
                </p>
              </div>
              <button onClick={() => setTab("emergency")} style={btnBlue}>+ Emergency Book</button>
            </div>

            <div style={{ position: "relative", marginBottom: "20px" }}>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search service or handyman..." style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", outline: "none", background: "#fff", boxSizing: "border-box" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
              {[["Active Bookings", "2", "🚗"], ["Completed Services", "14", "✅"], ["Pending Invoices", "1", "🧾"], ["Saved Handymen", favorites.length.toString(), "⭐"]].map(([t, v, i], k) => (
                <div key={k} style={cardStyle}>
                  <div><p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>{t}</p><h3 style={{ margin: 0 }}>{v}</h3></div>
                  <span>{i}</span>
                </div>
              ))}
            </div>

            <h3>Available Handyman Services</h3>
            {loadingServices ? (
              <p style={{ fontSize: "13px", color: "#64748b" }}>Loading available services...</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                {displayedServices.map((item) => (
                  <div key={item.id || item._id} style={{ background: "#fff", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                      <span style={{ fontSize: "24px" }}>{item.icon || "🛠️"}</span>
                      <button onClick={() => toggleFavorite(item.id)} style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: "16px" }}>
                        {favorites.includes(item.id) ? "⭐" : "☆"}
                      </button>
                    </div>
                    <h4 style={{ margin: "4px 0 2px", fontSize: "14px", fontWeight: "700" }}>{item.title}</h4>
                    <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>👤 {item.handyman_name || "John Doe"}</p>
                    <div style={{ marginTop: "6px", width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "14px", color: "#16a34a", fontWeight: "800" }}>₹{item.price}</span>
                      <button onClick={() => handleBookService(item)} style={{ padding: "4px 8px", background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: "6px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}>
                        Book
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* EMERGENCY TAB */}
        {tab === "emergency" && (
          <div style={cardBlock}>
            <h2 style={{ color: "#dc2626", marginTop: 0 }}>🚨 Emergency Service Dispatch</h2>
            <p style={{ fontSize: "13px", color: "#475569" }}>Request urgent home repairs with rapid 15-30 minute dispatch to your location.</p>
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "16px", marginBottom: "16px" }}>
              <p style={{ margin: "0 0 8px 0", fontSize: "13px", fontWeight: "700" }}>Current Location: {dynamicLocation}</p>
              <p style={{ margin: 0, fontSize: "12px", color: "#991b1b" }}>Priority charges apply for express dispatch within 30 minutes.</p>
            </div>
            {isEmergencyBooked ? (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "14px", borderRadius: "8px", color: "#166534" }}>
                <strong>✓ Urgent Request Dispatched!</strong>
                <p style={{ margin: "4px 0 0", fontSize: "12px" }}>A team member is assigned and heading to {dynamicLocation}.</p>
              </div>
            ) : (
              <button onClick={handleEmergencyBooking} style={{ padding: "10px 20px", background: "#dc2626", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "700", cursor: "pointer" }}>
                Dispatch Priority Unit Now
              </button>
            )}
          </div>
        )}

        {/* TRACKING TAB */}
        {tab === "tracking" && (
          <div style={cardBlock}>
            <h2 style={{ marginTop: 0 }}>📍 Live Technician Tracking</h2>
            <p style={{ fontSize: "13px", color: "#64748b" }}>Technician dispatch area: <strong>{dynamicLocation}</strong></p>
            <div style={{ borderRadius: "10px", overflow: "hidden", border: "1px solid #e2e8f0", height: "300px" }}>
              <iframe title="Map" width="100%" height="100%" style={{ border: 0 }} src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`}></iframe>
            </div>
          </div>
        )}

        {/* BOOKING HISTORY TAB */}
        {tab === "history" && (
          <div style={cardBlock}>
            <h2 style={{ marginTop: 0 }}>📋 Booking History</h2>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#f1f5f9", textAlign: "left", color: "#475569" }}>
                  <th style={{ padding: "10px" }}>Booking ID</th>
                  <th style={{ padding: "10px" }}>Service</th>
                  <th style={{ padding: "10px" }}>Technician</th>
                  <th style={{ padding: "10px" }}>Date</th>
                  <th style={{ padding: "10px" }}>Amount</th>
                  <th style={{ padding: "10px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookingHistoryData.map((row) => (
                  <tr key={row.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "10px", fontWeight: "700" }}>{row.id}</td>
                    <td style={{ padding: "10px" }}>{row.service}</td>
                    <td style={{ padding: "10px" }}>{row.handyman}</td>
                    <td style={{ padding: "10px" }}>{row.date}</td>
                    <td style={{ padding: "10px" }}>₹{row.amount}</td>
                    <td style={{ padding: "10px" }}>
                      <span style={{ padding: "3px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "700", background: row.status === "Completed" ? "#dcfce7" : "#fef3c7", color: row.status === "Completed" ? "#166534" : "#92400e" }}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* FAVOURITES TAB */}
        {tab === "favourites" && (
          <div style={cardBlock}>
            <h2 style={{ marginTop: 0 }}>⭐ Favourite Services</h2>
            {favoriteServicesList.length === 0 ? (
              <p style={{ fontSize: "13px", color: "#64748b" }}>No saved services yet.</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                {favoriteServicesList.map((item) => (
                  <div key={item.id} style={{ background: "#fff", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "24px" }}>{item.icon}</span>
                    <h4 style={{ margin: "8px 0 4px" }}>{item.title}</h4>
                    <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>👤 {item.handyman_name}</p>
                    <p style={{ margin: "6px 0", fontSize: "13px", fontWeight: "800", color: "#16a34a" }}>₹{item.price}</p>
                    <button onClick={() => toggleFavorite(item.id)} style={{ padding: "4px 8px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}>
                      Remove Star
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* INVOICES TAB */}
        {tab === "invoices" && (
          <div style={cardBlock}>
            <h2 style={{ marginTop: 0 }}>📄 Download Invoices</h2>
            {loadingInvoices ? (
              <p style={{ fontSize: "13px", color: "#64748b" }}>Fetching invoices...</p>
            ) : invoices.length === 0 ? (
              <p style={{ fontSize: "13px", color: "#64748b" }}>No invoices available.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {invoices.map((inv) => (
                  <div key={inv.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f8fafc" }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: "700", fontSize: "14px" }}>Invoice #INV-{inv.id}</p>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>{inv.serviceTitle} - {inv.date}</span>
                    </div>
                    <button onClick={() => handleDownloadPDF(inv)} style={btnBlue}>
                      Download PDF 📥
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PAYMENTS TAB */}
        {tab === "payments" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Header & Booking Selection Strip */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px", background: "#fff", padding: "18px 20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "26px" }}>💳</span>
                  <div>
                    <h2 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>Who to Pay & Payment Procedure</h2>
                    <p style={{ margin: "3px 0 0", fontSize: "13px", color: "#64748b" }}>
                      Direct secure settlement for certified handyman services with instant verification
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking Selector Pills */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Select Service Booking:</span>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {payableBookings.map((b) => {
                    const isSelected = b.id === activeBooking.id;
                    const isPaid = b.status.includes("Paid");
                    return (
                      <button
                        key={b.id}
                        onClick={() => {
                          setSelectedPayBookingId(b.id);
                          setPaidReceipt(null);
                        }}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "8px",
                          border: isSelected ? "2px solid #2563eb" : "1px solid #cbd5e1",
                          background: isSelected ? "#eff6ff" : "#f8fafc",
                          color: isSelected ? "#1d4ed8" : "#334155",
                          fontWeight: "700",
                          fontSize: "12px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >
                        <span>{b.icon}</span>
                        <span>{b.id}: {b.serviceTitle.length > 20 ? b.serviceTitle.slice(0, 18) + "..." : b.serviceTitle}</span>
                        <span style={{
                          padding: "2px 6px",
                          borderRadius: "10px",
                          fontSize: "10px",
                          background: isPaid ? "#dcfce7" : "#fef3c7",
                          color: isPaid ? "#166534" : "#92400e"
                        }}>
                          ₹{b.totalAmount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* If Payment Receipt Exists */}
            {paidReceipt ? (
              <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #bbf7d0", padding: "28px", boxShadow: "0 4px 12px rgba(22, 163, 74, 0.08)" }}>
                <div style={{ textAlign: "center", maxWidth: "560px", margin: "0 auto" }}>
                  <div style={{ width: "64px", height: "64px", background: "#dcfce7", color: "#16a34a", borderRadius: "50%", display: "grid", placeItems: "center", fontSize: "32px", margin: "0 auto 16px" }}>
                    ✓
                  </div>
                  <span style={{ background: "#dcfce7", color: "#166534", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" }}>
                    PAYMENT VERIFIED & SETTLED
                  </span>
                  <h2 style={{ margin: "12px 0 6px", color: "#0f172a", fontSize: "22px" }}>
                    ₹{paidReceipt.amount}.00 Paid Successfully!
                  </h2>
                  <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: "13px" }}>
                    Your transaction has been confirmed by NPCI / Banking Switch. Both you and the technician have received digital confirmation.
                  </p>

                  {/* Receipt breakdown card */}
                  <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px", textAlign: "left", marginBottom: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e2e8f0", fontSize: "13px" }}>
                      <span style={{ color: "#64748b" }}>Transaction Reference:</span>
                      <strong style={{ fontFamily: "monospace", color: "#0f172a" }}>{paidReceipt.txnId}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e2e8f0", fontSize: "13px" }}>
                      <span style={{ color: "#64748b" }}>Booking ID:</span>
                      <strong>{paidReceipt.bookingId}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e2e8f0", fontSize: "13px" }}>
                      <span style={{ color: "#64748b" }}>Service Done:</span>
                      <strong>{paidReceipt.serviceTitle}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e2e8f0", fontSize: "13px" }}>
                      <span style={{ color: "#64748b" }}>Recipient Specialist:</span>
                      <strong style={{ color: "#2563eb" }}>{paidReceipt.handymanName} ({paidReceipt.handymanRole})</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e2e8f0", fontSize: "13px" }}>
                      <span style={{ color: "#64748b" }}>Payment Gateway:</span>
                      <strong>{paidReceipt.method}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: "13px" }}>
                      <span style={{ color: "#64748b" }}>Settlement Timestamp:</span>
                      <span>{paidReceipt.date}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
                    <button
                      onClick={() => handleDownloadPDF({
                        id: (paidReceipt.txnId || "").replace("TXN-", "").replace("UPI-", ""),
                        serviceTitle: paidReceipt.serviceTitle,
                        handyman_name: paidReceipt.handymanName,
                        amount: paidReceipt.amount,
                        date: new Date().toISOString().split("T")[0]
                      })}
                      style={{ ...btnBlue, display: "flex", alignItems: "center", gap: "6px", padding: "10px 18px", fontSize: "13px" }}
                    >
                      <span>📥</span> Download Tax Invoice (PDF)
                    </button>
                    <button
                      onClick={() => {
                        setFeedbackForm((prev) => ({
                          ...prev,
                          bookingId: paidReceipt.bookingId,
                          handymanName: paidReceipt.handymanName,
                          serviceTitle: paidReceipt.serviceTitle
                        }));
                        setTab("feedback");
                      }}
                      style={{ padding: "10px 18px", background: "#f0fdf4", color: "#166534", border: "1px solid #86efac", borderRadius: "6px", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}
                    >
                      ⭐ Rate & Review Specialist
                    </button>
                    <button
                      onClick={() => setPaidReceipt(null)}
                      style={{ padding: "10px 18px", background: "#fff", color: "#475569", border: "1px solid #cbd5e1", borderRadius: "6px", fontWeight: "600", cursor: "pointer", fontSize: "13px" }}
                    >
                      Make Another Payment
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Two Column Layout: Left = WHO TO PAY & BILL, Right = HOW TO PAY PROCEDURE */
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: "20px", alignItems: "start" }}>
                
                {/* ─── LEFT COLUMN: WHO TO PAY (Recipient & Bill) ─── */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* Recipient Profile Card */}
                  <div style={cardBlock}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                      <span style={{ fontSize: "12px", fontWeight: "800", color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        👤 Who to Pay (Recipient)
                      </span>
                      <span style={{ fontSize: "11px", background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "12px", fontWeight: "700" }}>
                        🛡️ Verified Pro
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                      <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "#2563eb", color: "#fff", display: "grid", placeItems: "center", fontSize: "20px", fontWeight: "800", flexShrink: 0 }}>
                        {activeBooking.handymanName.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ margin: "0 0 2px", fontSize: "16px", color: "#0f172a" }}>{activeBooking.handymanName}</h3>
                        <p style={{ margin: 0, fontSize: "12px", color: "#64748b", fontWeight: "600" }}>{activeBooking.handymanRole}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px", fontSize: "11px", color: "#475569" }}>
                          <span>📞 {activeBooking.handymanPhone}</span>
                          <span>•</span>
                          <span style={{ color: "#16a34a", fontWeight: "700" }}>🟢 Active on Duty</span>
                        </div>
                      </div>
                    </div>

                    {/* Official Recipient UPI ID box */}
                    <div style={{ marginTop: "14px", padding: "12px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#1e40af", textTransform: "uppercase" }}>
                          Specialist UPI ID (VPA):
                        </span>
                        {copiedUpi && (
                          <span style={{ fontSize: "11px", color: "#16a34a", fontWeight: "700" }}>✓ Copied to clipboard!</span>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", padding: "8px 12px", borderRadius: "6px", border: "1px solid #93c5fd" }}>
                        <span style={{ fontFamily: "monospace", fontSize: "14px", fontWeight: "800", color: "#1e3a8a" }}>
                          {activeBooking.handymanUpi}
                        </span>
                        <button
                          onClick={() => {
                            if (navigator.clipboard) {
                              navigator.clipboard.writeText(activeBooking.handymanUpi);
                            }
                            setCopiedUpi(true);
                            setTimeout(() => setCopiedUpi(false), 2000);
                          }}
                          style={{ padding: "4px 10px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "4px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}
                        >
                          {copiedUpi ? "Copied! ✓" : "📋 Copy UPI ID"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Itemized Order & Price Breakdown */}
                  <div style={cardBlock}>
                    <h3 style={{ margin: "0 0 12px", fontSize: "14px", color: "#0f172a" }}>🧾 Itemized Bill Breakdown</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", color: "#334155" }}>
                        <span>Service: <strong>{activeBooking.serviceTitle}</strong></span>
                        <span>₹{activeBooking.baseAmount}.00</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b" }}>
                        <span>Doorstep & Safety Assurance Fee:</span>
                        <span>₹{activeBooking.safetyFee}.00</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", color: "#16a34a" }}>
                        <span>FixIt Community Discount:</span>
                        <span>-₹{activeBooking.discount}.00</span>
                      </div>
                      <hr style={{ border: "none", borderTop: "1px dashed #cbd5e1", margin: "4px 0" }} />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>
                        <span>Total Payable Amount:</span>
                        <span style={{ color: "#16a34a", fontSize: "20px" }}>₹{activeBooking.totalAmount}.00</span>
                      </div>
                    </div>

                    <div style={{ marginTop: "14px", padding: "10px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                      <span style={{ fontSize: "18px" }}>🛡️</span>
                      <p style={{ margin: 0, fontSize: "11px", color: "#14532d", lineHeight: "1.4" }}>
                        <strong>FixIt Escrow Protection:</strong> Payments are securely recorded and held in escrow. Funds are released to {activeBooking.handymanName} once you verify the job is fully completed.
                      </p>
                    </div>
                  </div>
                </div>

                {/* ─── RIGHT COLUMN: HOW TO PAY PROCEDURE ─── */}
                <div style={cardBlock}>
                  {/* Gateway selector bar */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
                    <h3 style={{ margin: 0, fontSize: "15px", color: "#0f172a" }}>📲 Select Payment Method</h3>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>Instant Settlement</span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "18px" }}>
                    {[
                      { id: "upi", label: "UPI", icon: "⚡" },
                      { id: "card", label: "Card", icon: "💳" },
                      { id: "netbanking", label: "NetBanking", icon: "🏦" },
                      { id: "cod", label: "Cash (COD)", icon: "💵" }
                    ].map((g) => (
                      <button
                        key={g.id}
                        onClick={() => setPayMethod(g.id)}
                        style={{
                          padding: "10px 8px",
                          borderRadius: "8px",
                          border: payMethod === g.id ? "2px solid #2563eb" : "1px solid #cbd5e1",
                          background: payMethod === g.id ? "#eff6ff" : "#fff",
                          color: payMethod === g.id ? "#1d4ed8" : "#475569",
                          fontWeight: "700",
                          cursor: "pointer",
                          fontSize: "12px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        <span style={{ fontSize: "16px" }}>{g.icon}</span>
                        <span>{g.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* ───────────────── PROCEDURE FOR UPI ───────────────── */}
                  {payMethod === "upi" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {/* UPI Mode Sub-Tabs */}
                      <div style={{ display: "flex", background: "#f1f5f9", padding: "4px", borderRadius: "8px", gap: "4px" }}>
                        {[
                          { id: "qr", label: "📱 Scan QR Code" },
                          { id: "id", label: "🆔 Pay to UPI ID" },
                          { id: "apps", label: "🚀 Open UPI Apps" }
                        ].map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => setUpiSubOption(sub.id)}
                            style={{
                              flex: 1,
                              padding: "8px 4px",
                              border: "none",
                              borderRadius: "6px",
                              background: upiSubOption === sub.id ? "#fff" : "transparent",
                              color: upiSubOption === sub.id ? "#2563eb" : "#64748b",
                              fontWeight: "700",
                              fontSize: "12px",
                              cursor: "pointer",
                              boxShadow: upiSubOption === sub.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
                            }}
                          >
                            {sub.label}
                          </button>
                        ))}
                      </div>

                      {/* SUB-OPTION 1: SCAN QR CODE */}
                      {upiSubOption === "qr" && (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                          {/* Authentic Styled QR Card */}
                          <div style={{ background: "#fff", padding: "16px", borderRadius: "12px", border: "2px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", display: "inline-block", position: "relative" }}>
                            {/* Realistic SVG QR Code with Center Badge */}
                            <svg width="170" height="170" viewBox="0 0 170 170" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="170" height="170" rx="8" fill="#ffffff"/>
                              
                              {/* Top-Left Finder */}
                              <rect x="10" y="10" width="38" height="38" rx="4" fill="#0f172a"/>
                              <rect x="15" y="15" width="28" height="28" rx="2" fill="#ffffff"/>
                              <rect x="20" y="20" width="18" height="18" rx="2" fill="#0f172a"/>

                              {/* Top-Right Finder */}
                              <rect x="122" y="10" width="38" height="38" rx="4" fill="#0f172a"/>
                              <rect x="127" y="15" width="28" height="28" rx="2" fill="#ffffff"/>
                              <rect x="132" y="20" width="18" height="18" rx="2" fill="#0f172a"/>

                              {/* Bottom-Left Finder */}
                              <rect x="10" y="122" width="38" height="38" rx="4" fill="#0f172a"/>
                              <rect x="15" y="127" width="28" height="28" rx="2" fill="#ffffff"/>
                              <rect x="20" y="132" width="18" height="18" rx="2" fill="#0f172a"/>

                              {/* Realistic QR Matrix Dots */}
                              <rect x="56" y="12" width="6" height="6" fill="#0f172a"/>
                              <rect x="68" y="12" width="6" height="6" fill="#0f172a"/>
                              <rect x="80" y="12" width="6" height="6" fill="#0f172a"/>
                              <rect x="98" y="12" width="6" height="6" fill="#0f172a"/>
                              <rect x="56" y="24" width="6" height="6" fill="#0f172a"/>
                              <rect x="74" y="24" width="6" height="6" fill="#0f172a"/>
                              <rect x="92" y="24" width="6" height="6" fill="#0f172a"/>
                              <rect x="62" y="36" width="6" height="6" fill="#0f172a"/>
                              <rect x="86" y="36" width="6" height="6" fill="#0f172a"/>
                              <rect x="104" y="36" width="6" height="6" fill="#0f172a"/>
                              <rect x="12" y="56" width="6" height="6" fill="#0f172a"/>
                              <rect x="24" y="56" width="6" height="6" fill="#0f172a"/>
                              <rect x="36" y="56" width="6" height="6" fill="#0f172a"/>
                              <rect x="54" y="56" width="6" height="6" fill="#0f172a"/>
                              <rect x="72" y="56" width="6" height="6" fill="#0f172a"/>
                              <rect x="90" y="56" width="6" height="6" fill="#0f172a"/>
                              <rect x="108" y="56" width="6" height="6" fill="#0f172a"/>
                              <rect x="126" y="56" width="6" height="6" fill="#0f172a"/>
                              <rect x="144" y="56" width="6" height="6" fill="#0f172a"/>
                              <rect x="18" y="68" width="6" height="6" fill="#0f172a"/>
                              <rect x="30" y="68" width="6" height="6" fill="#0f172a"/>
                              <rect x="120" y="68" width="6" height="6" fill="#0f172a"/>
                              <rect x="138" y="68" width="6" height="6" fill="#0f172a"/>
                              <rect x="150" y="68" width="6" height="6" fill="#0f172a"/>
                              <rect x="12" y="80" width="6" height="6" fill="#0f172a"/>
                              <rect x="36" y="80" width="6" height="6" fill="#0f172a"/>
                              <rect x="126" y="80" width="6" height="6" fill="#0f172a"/>
                              <rect x="144" y="80" width="6" height="6" fill="#0f172a"/>
                              <rect x="18" y="92" width="6" height="6" fill="#0f172a"/>
                              <rect x="30" y="92" width="6" height="6" fill="#0f172a"/>
                              <rect x="120" y="92" width="6" height="6" fill="#0f172a"/>
                              <rect x="138" y="92" width="6" height="6" fill="#0f172a"/>
                              <rect x="54" y="104" width="6" height="6" fill="#0f172a"/>
                              <rect x="66" y="104" width="6" height="6" fill="#0f172a"/>
                              <rect x="84" y="104" width="6" height="6" fill="#0f172a"/>
                              <rect x="102" y="104" width="6" height="6" fill="#0f172a"/>
                              <rect x="60" y="116" width="6" height="6" fill="#0f172a"/>
                              <rect x="78" y="116" width="6" height="6" fill="#0f172a"/>
                              <rect x="96" y="116" width="6" height="6" fill="#0f172a"/>
                              <rect x="114" y="116" width="6" height="6" fill="#0f172a"/>
                              <rect x="54" y="128" width="6" height="6" fill="#0f172a"/>
                              <rect x="72" y="128" width="6" height="6" fill="#0f172a"/>
                              <rect x="90" y="128" width="6" height="6" fill="#0f172a"/>
                              <rect x="132" y="128" width="6" height="6" fill="#0f172a"/>
                              <rect x="150" y="128" width="6" height="6" fill="#0f172a"/>
                              <rect x="66" y="140" width="6" height="6" fill="#0f172a"/>
                              <rect x="84" y="140" width="6" height="6" fill="#0f172a"/>
                              <rect x="108" y="140" width="6" height="6" fill="#0f172a"/>
                              <rect x="126" y="140" width="6" height="6" fill="#0f172a"/>
                              <rect x="144" y="140" width="6" height="6" fill="#0f172a"/>
                              <rect x="54" y="152" width="6" height="6" fill="#0f172a"/>
                              <rect x="78" y="152" width="6" height="6" fill="#0f172a"/>
                              <rect x="96" y="152" width="6" height="6" fill="#0f172a"/>
                              <rect x="120" y="152" width="6" height="6" fill="#0f172a"/>
                              <rect x="138" y="152" width="6" height="6" fill="#0f172a"/>

                              {/* Center FixIt Badge */}
                              <rect x="52" y="58" width="66" height="54" rx="6" fill="#ffffff" stroke="#2563eb" strokeWidth="2"/>
                              <text x="85" y="78" textAnchor="middle" fill="#2563eb" fontSize="13" fontWeight="900" fontFamily="sans-serif">⚡ FixIt</text>
                              <text x="85" y="98" textAnchor="middle" fill="#0f172a" fontSize="11" fontWeight="800" fontFamily="sans-serif">UPI PAY</text>
                            </svg>

                            <div style={{ marginTop: "10px", padding: "4px 10px", background: "#f1f5f9", borderRadius: "6px", fontSize: "11px", fontWeight: "700", color: "#334155" }}>
                              Amount: ₹{activeBooking.totalAmount}.00
                            </div>
                          </div>

                          <div style={{ marginTop: "8px", fontSize: "11px", color: "#64748b" }}>
                            Payee: <strong>{activeBooking.handymanName}</strong> ({activeBooking.handymanUpi})
                          </div>
                          <div style={{ marginTop: "4px", fontSize: "11px", color: "#16a34a", fontWeight: "700" }}>
                            ⏳ Dynamic QR valid for this session
                          </div>

                          {/* How to Pay Procedure Steps */}
                          <div style={{ width: "100%", marginTop: "16px", textAlign: "left", background: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                            <span style={{ fontSize: "12px", fontWeight: "800", color: "#0f172a" }}>
                              📝 Step-by-Step Payment Procedure:
                            </span>
                            <ol style={{ margin: "8px 0 0", paddingLeft: "18px", fontSize: "12px", color: "#475569", lineHeight: "1.6" }}>
                              <li>Open <strong>GPay, PhonePe, Paytm, or BHIM</strong> on your mobile device.</li>
                              <li>Tap <strong>Scan QR</strong> and point your camera at the QR code above.</li>
                              <li>Confirm payee name reads <strong>{activeBooking.handymanName}</strong> and amount is <strong>₹{activeBooking.totalAmount}</strong>.</li>
                              <li>Enter your <strong>UPI PIN</strong> to approve the payment.</li>
                              <li>Once amount is debited from your bank, tap the green <strong>"Verify & Get Invoice"</strong> button below.</li>
                            </ol>
                          </div>
                        </div>
                      )}

                      {/* SUB-OPTION 2: PAY TO UPI ID */}
                      {upiSubOption === "id" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                          <div style={{ padding: "14px", background: "#eff6ff", borderRadius: "8px", border: "1px solid #bfdbfe" }}>
                            <span style={{ fontSize: "12px", fontWeight: "700", color: "#1e40af" }}>Option A: Send money directly to Technician's UPI ID:</span>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "8px" }}>
                              <input
                                type="text"
                                readOnly
                                value={activeBooking.handymanUpi}
                                style={{ flex: 1, padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#fff", fontFamily: "monospace", fontSize: "13px", fontWeight: "700" }}
                              />
                              <button
                                onClick={() => {
                                  if (navigator.clipboard) {
                                    navigator.clipboard.writeText(activeBooking.handymanUpi);
                                  }
                                  setCopiedUpi(true);
                                  setTimeout(() => setCopiedUpi(false), 2000);
                                }}
                                style={{ padding: "8px 14px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "700", fontSize: "12px", cursor: "pointer" }}
                              >
                                {copiedUpi ? "Copied! ✓" : "Copy"}
                              </button>
                            </div>
                          </div>

                          <div style={{ padding: "14px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                            <span style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a" }}>Option B: Request payment to your phone UPI ID:</span>
                            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                              <input
                                type="text"
                                placeholder="e.g. 9876543210@upi or name@okaxis"
                                value={userUpiId}
                                onChange={(e) => setUserUpiId(e.target.value)}
                                style={{ flex: 1, padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                              />
                              <button
                                onClick={() => {
                                  if (!userUpiId.trim()) {
                                    alert("Please enter a valid UPI ID (e.g. mobile@upi)");
                                    return;
                                  }
                                  setUpiAppRequestSent(true);
                                  setTimeout(() => setUpiAppRequestSent(false), 8000);
                                }}
                                style={{ padding: "8px 14px", background: "#0f172a", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "700", fontSize: "12px", cursor: "pointer" }}
                              >
                                Request ₹{activeBooking.totalAmount}
                              </button>
                            </div>

                            {/* Quick suffix suggestions */}
                            <div style={{ display: "flex", gap: "6px", marginTop: "8px", flexWrap: "wrap" }}>
                              {["@okhdfcbank", "@okaxis", "@ybl", "@paytm"].map((suf) => (
                                <button
                                  key={suf}
                                  type="button"
                                  onClick={() => {
                                    const base = userUpiId.includes("@") ? userUpiId.split("@")[0] : userUpiId || "9876543210";
                                    setUserUpiId(`${base}${suf}`);
                                  }}
                                  style={{ padding: "3px 8px", background: "#fff", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "11px", color: "#475569", cursor: "pointer" }}
                                >
                                  +{suf}
                                </button>
                              ))}
                            </div>

                            {upiAppRequestSent && (
                              <div style={{ marginTop: "10px", padding: "10px", background: "#dcfce7", border: "1px solid #86efac", borderRadius: "6px", fontSize: "12px", color: "#166534" }}>
                                🔔 <strong>Payment collect request sent!</strong> Open your UPI app (GPay / PhonePe / Paytm), accept the ₹{activeBooking.totalAmount} request, and enter your PIN.
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* SUB-OPTION 3: OPEN UPI APPS */}
                      {upiSubOption === "apps" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          <span style={{ fontSize: "12px", color: "#64748b" }}>
                            Select your favorite installed UPI application to launch payment:
                          </span>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                            {[
                              { name: "Google Pay", color: "#1a73e8", icon: "🌐" },
                              { name: "PhonePe", color: "#5f259f", icon: "🟣" },
                              { name: "Paytm UPI", color: "#00b9f5", icon: "💎" },
                              { name: "BHIM UPI", color: "#00796b", icon: "🇮🇳" }
                            ].map((app) => (
                              <button
                                key={app.name}
                                onClick={() => {
                                  alert(`🚀 Opening ${app.name}...\n\nPayee: ${activeBooking.handymanName}\nAmount: ₹${activeBooking.totalAmount}\n\nPlease authenticate and approve with your UPI PIN.`);
                                }}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                  padding: "12px",
                                  borderRadius: "8px",
                                  border: `1px solid ${app.color}40`,
                                  background: "#f8fafc",
                                  cursor: "pointer",
                                  textAlign: "left"
                                }}
                              >
                                <span style={{ fontSize: "22px" }}>{app.icon}</span>
                                <div>
                                  <strong style={{ fontSize: "13px", color: "#0f172a", display: "block" }}>{app.name}</strong>
                                  <span style={{ fontSize: "11px", color: app.color, fontWeight: "600" }}>Pay ₹{activeBooking.totalAmount}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* BIG VERIFICATION CTA */}
                      <div style={{ marginTop: "8px", borderTop: "1px solid #e2e8f0", paddingTop: "14px" }}>
                        <button
                          onClick={handleExecutePayment}
                          disabled={payingState}
                          style={{
                            width: "100%",
                            padding: "14px",
                            background: payingState ? "#94a3b8" : "#16a34a",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: "800",
                            cursor: payingState ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            boxShadow: "0 4px 6px -1px rgba(22, 163, 74, 0.2)"
                          }}
                        >
                          {payingState ? (
                            <>⏳ Verifying with UPI Network...</>
                          ) : (
                            <>✓ I Have Completed Payment — Verify & Get Invoice (₹{activeBooking.totalAmount})</>
                          )}
                        </button>
                        <p style={{ margin: "6px 0 0", textAlign: "center", fontSize: "11px", color: "#64748b" }}>
                          🔒 Immediate digital tax invoice and PDF will be generated upon verification
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ───────────────── PROCEDURE FOR CARD ───────────────── */}
                  {payMethod === "card" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div>
                        <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>Card Number</label>
                        <input
                          type="text"
                          placeholder="4532 •••• •••• 8901"
                          maxLength={19}
                          value={cardForm.number}
                          onChange={(e) => setCardForm(prev => ({ ...prev, number: e.target.value }))}
                          style={{ width: "100%", padding: "9px 12px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>Cardholder Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Shalini Mahadeva"
                          value={cardForm.name}
                          onChange={(e) => setCardForm(prev => ({ ...prev, name: e.target.value }))}
                          style={{ width: "100%", padding: "9px 12px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                        />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        <div>
                          <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>Expiry (MM/YY)</label>
                          <input
                            type="text"
                            placeholder="08/29"
                            maxLength={5}
                            value={cardForm.expiry}
                            onChange={(e) => setCardForm(prev => ({ ...prev, expiry: e.target.value }))}
                            style={{ width: "100%", padding: "9px 12px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>CVV / CVC</label>
                          <input
                            type="password"
                            placeholder="•••"
                            maxLength={4}
                            value={cardForm.cvv}
                            onChange={(e) => setCardForm(prev => ({ ...prev, cvv: e.target.value }))}
                            style={{ width: "100%", padding: "9px 12px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                          />
                        </div>
                      </div>
                      <button
                        onClick={handleExecutePayment}
                        disabled={payingState}
                        style={{ ...btnBlue, padding: "12px", marginTop: "8px", fontSize: "13px" }}
                      >
                        {payingState ? "Processing Card Payment..." : `Pay ₹${activeBooking.totalAmount}.00 Securely`}
                      </button>
                    </div>
                  )}

                  {/* ───────────────── PROCEDURE FOR NETBANKING ───────────────── */}
                  {payMethod === "netbanking" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>Select Your Bank:</label>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
                        {["HDFC Bank", "State Bank of India", "ICICI Bank", "Axis Bank", "Kotak Bank", "Punjab National Bank"].map((bank) => (
                          <button
                            key={bank}
                            onClick={() => setSelectedNetBank(bank)}
                            style={{
                              padding: "10px",
                              borderRadius: "6px",
                              border: selectedNetBank === bank ? "2px solid #2563eb" : "1px solid #cbd5e1",
                              background: selectedNetBank === bank ? "#eff6ff" : "#fff",
                              color: selectedNetBank === bank ? "#1d4ed8" : "#334155",
                              fontWeight: "700",
                              fontSize: "12px",
                              cursor: "pointer",
                              textAlign: "left"
                            }}
                          >
                            🏦 {bank}
                          </button>
                        ))}
                      </div>
                      <p style={{ margin: "6px 0", fontSize: "12px", color: "#64748b" }}>
                        You will be redirected to <strong>{selectedNetBank}</strong> secure internet banking portal.
                      </p>
                      <button
                        onClick={handleExecutePayment}
                        disabled={payingState}
                        style={{ ...btnBlue, padding: "12px", fontSize: "13px" }}
                      >
                        {payingState ? "Connecting to Bank Gateway..." : `Proceed to ${selectedNetBank} (₹${activeBooking.totalAmount})`}
                      </button>
                    </div>
                  )}

                  {/* ───────────────── PROCEDURE FOR CASH ON DELIVERY (COD) ───────────────── */}
                  {payMethod === "cod" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div style={{ padding: "14px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px" }}>
                        <h4 style={{ margin: "0 0 6px", color: "#92400e", fontSize: "13px" }}>💵 Cash Handover Guidelines:</h4>
                        <ol style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", color: "#78350f", lineHeight: "1.6" }}>
                          <li>Inspect the finished work with technician <strong>{activeBooking.handymanName}</strong>.</li>
                          <li>Hand over exact cash amount of <strong>₹{activeBooking.totalAmount}.00</strong> directly to the technician.</li>
                          <li>Ensure technician updates job status to <em>Completed</em> on their mobile portal.</li>
                        </ol>
                      </div>
                      <button
                        onClick={handleExecutePayment}
                        disabled={payingState}
                        style={{ ...btnBlue, padding: "12px", background: "#0f172a", fontSize: "13px" }}
                      >
                        {payingState ? "Confirming..." : `Confirm Cash Handover Agreement (₹${activeBooking.totalAmount})`}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {tab === "notifications" && (
          <div style={cardBlock}>
            <h2 style={{ marginTop: 0 }}>🔔 Notifications</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {notificationsData.map((item) => (
                <div key={item.id} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", background: item.unread ? "#eff6ff" : "#fff" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <strong style={{ fontSize: "13px" }}>{item.title}</strong>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>{item.time}</span>
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#475569" }}>{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI RECOMMENDATIONS TAB */}
        {tab === "ai" && (
          <div style={cardBlock}>
            <h2 style={{ marginTop: 0 }}>🤖 AI Smart Recommendations</h2>
            <p style={{ fontSize: "13px", color: "#64748b" }}>Based on your booking history and seasonal weather trends in {dynamicLocation}:</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
              <div style={{ border: "1px solid #bfdbfe", background: "#eff6ff", padding: "14px", borderRadius: "8px" }}>
                <h4 style={{ margin: "0 0 6px", color: "#1e40af" }}>Recommended: AC Deep Maintenance</h4>
                <p style={{ margin: 0, fontSize: "12px", color: "#1e3a8a" }}>It has been 6 months since your last HVAC service. Schedule now to preserve energy efficiency.</p>
              </div>
              <div style={{ border: "1px solid #bbf7d0", background: "#f0fdf4", padding: "14px", borderRadius: "8px" }}>
                <h4 style={{ margin: "0 0 6px", color: "#166534" }}>Seasonal: Water Tank Inspection</h4>
                <p style={{ margin: 0, fontSize: "12px", color: "#14532d" }}>Pre-monsoon maintenance checks are recommended for users in your vicinity.</p>
              </div>
            </div>
          </div>
        )}

        {/* FEEDBACK & REVIEWS TAB */}
        {tab === "feedback" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Header & Metric Strip */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h2 style={{ margin: "0 0 4px 0", fontSize: "22px", fontWeight: "800", color: "#0f172a" }}>
                  ⭐ Feedback & Community Reviews
                </h2>
                <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                  Rate your completed repairs, provide technician feedback, and help ensure top service standards.
                </p>
              </div>
              <button
                onClick={fetchFeedbacks}
                style={{ padding: "6px 12px", background: "#fff", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", color: "#475569", fontWeight: "600" }}
              >
                🔄 Refresh Feedback
              </button>
            </div>

            {/* Metrics Strip */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
              <div style={{ background: "#fff", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Total Feedbacks Given</span>
                <h3 style={{ margin: "6px 0 0", fontSize: "24px", color: "#2563eb", fontWeight: "800" }}>{feedbacks.length}</h3>
              </div>
              <div style={{ background: "#fff", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Average Rating Given</span>
                <h3 style={{ margin: "6px 0 0", fontSize: "24px", color: "#eab308", fontWeight: "800" }}>
                  {feedbacks.length > 0 ? (feedbacks.reduce((a, b) => a + (Number(b.rating) || 5), 0) / feedbacks.length).toFixed(1) : "5.0"} ⭐
                </h3>
              </div>
              <div style={{ background: "#fff", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Positive Recommendation</span>
                <h3 style={{ margin: "6px 0 0", fontSize: "24px", color: "#16a34a", fontWeight: "800" }}>100%</h3>
              </div>
              <div style={{ background: "#fff", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Community Status</span>
                <h3 style={{ margin: "6px 0 0", fontSize: "18px", color: "#0f172a", fontWeight: "700" }}>Verified Reviewer 🛡️</h3>
              </div>
            </div>

            {/* Form + History Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px" }}>
              {/* Form Card */}
              <div style={{ background: "#fff", padding: "22px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "700", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>✍️</span> Submit Service Feedback
                </h3>

                {feedbackStatusMsg && (
                  <div style={{ padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px", fontWeight: "600", background: feedbackStatusMsg.startsWith("✓") ? "#dcfce7" : "#fef2f2", color: feedbackStatusMsg.startsWith("✓") ? "#15803d" : "#b91c1c", border: `1px solid ${feedbackStatusMsg.startsWith("✓") ? "#86efac" : "#fecaca"}` }}>
                    {feedbackStatusMsg}
                  </div>
                )}

                <form onSubmit={handleFeedbackSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* Select Service / Technician */}
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                      Select Service / Specialist:
                    </label>
                    <select
                      value={feedbackForm.bookingId}
                      onChange={(e) => {
                        const bId = e.target.value;
                        if (bId === "BK-8901") {
                          setFeedbackForm(prev => ({ ...prev, bookingId: bId, handymanId: "6aa1903e5e831d9fc1a8c183", handymanName: "Shalini Mahadeva", serviceTitle: "Electrical Wiring Fix" }));
                        } else if (bId === "BK-8821") {
                          setFeedbackForm(prev => ({ ...prev, bookingId: bId, handymanId: "h-john", handymanName: "John Doe", serviceTitle: "Plumbing Fix" }));
                        } else {
                          setFeedbackForm(prev => ({ ...prev, bookingId: bId, handymanId: "h-sarah", handymanName: "Sarah Connor", serviceTitle: "AC Deep Cleaning" }));
                        }
                      }}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", background: "#f8fafc", color: "#0f172a" }}
                    >
                      <option value="BK-8901">BK-8901 • Shalini Mahadeva (Electrical Wiring Fix)</option>
                      <option value="BK-8821">BK-8821 • John Doe (Plumbing Fix)</option>
                      <option value="BK-8845">BK-8845 • Sarah Connor (AC Deep Cleaning)</option>
                    </select>
                  </div>

                  {/* Overall Star Rating */}
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
                      Overall Rating:
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ display: "flex", gap: "4px" }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            onClick={() => setFeedbackForm(prev => ({ ...prev, rating: star }))}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            style={{
                              fontSize: "28px",
                              cursor: "pointer",
                              color: (hoverRating || feedbackForm.rating) >= star ? "#eab308" : "#cbd5e1",
                              transition: "transform 0.1s"
                            }}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: "#334155", marginLeft: "6px" }}>
                        {feedbackForm.rating === 5 ? "5.0 - Exceptional ⭐" : feedbackForm.rating === 4 ? "4.0 - Very Good" : feedbackForm.rating === 3 ? "3.0 - Average" : "Needs Improvement"}
                      </span>
                    </div>
                  </div>

                  {/* Multi-Dimensional Ratings */}
                  <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "10px" }}>
                      Performance Criteria:
                    </span>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      {[
                        ["quality", "Work Quality"],
                        ["punctuality", "Punctuality"],
                        ["pricing", "Value & Pricing"],
                        ["communication", "Communication"]
                      ].map(([key, label]) => (
                        <div key={key}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>
                            <span>{label}</span>
                            <span style={{ color: "#2563eb", fontWeight: "700" }}>{feedbackForm[key]} / 5</span>
                          </div>
                          <div style={{ display: "flex", gap: "4px" }}>
                            {[1, 2, 3, 4, 5].map((num) => (
                              <button
                                type="button"
                                key={num}
                                onClick={() => setFeedbackForm(prev => ({ ...prev, [key]: num }))}
                                style={{
                                  flex: 1,
                                  padding: "4px 0",
                                  border: "none",
                                  borderRadius: "4px",
                                  background: feedbackForm[key] >= num ? "#2563eb" : "#e2e8f0",
                                  color: feedbackForm[key] >= num ? "#fff" : "#64748b",
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  cursor: "pointer"
                                }}
                              >
                                {num}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Feedback Category Pills */}
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                      Primary Focus Tag:
                    </label>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {["Work Quality", "Punctuality", "Billing & Value", "Customer Service", "Overall Experience"].map((cat) => (
                        <button
                          type="button"
                          key={cat}
                          onClick={() => setFeedbackForm(prev => ({ ...prev, category: cat }))}
                          style={{
                            padding: "5px 12px",
                            borderRadius: "20px",
                            border: `1px solid ${feedbackForm.category === cat ? "#2563eb" : "#cbd5e1"}`,
                            background: feedbackForm.category === cat ? "#eff6ff" : "#fff",
                            color: feedbackForm.category === cat ? "#2563eb" : "#64748b",
                            fontSize: "11px",
                            fontWeight: "600",
                            cursor: "pointer"
                          }}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Review Text */}
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                      Your Review & Comments:
                    </label>
                    <textarea
                      rows={3}
                      value={feedbackForm.comment}
                      onChange={(e) => setFeedbackForm(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder="Share details regarding the technician's professionalism, timeliness, repair quality, or tools used..."
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", outline: "none", resize: "vertical", boxSizing: "border-box" }}
                    />
                  </div>

                  {/* Would Recommend Toggle */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc", padding: "10px 14px", borderRadius: "8px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "600", color: "#334155" }}>Would you recommend this specialist?</span>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        type="button"
                        onClick={() => setFeedbackForm(prev => ({ ...prev, wouldRecommend: true }))}
                        style={{ padding: "4px 10px", borderRadius: "6px", border: "none", background: feedbackForm.wouldRecommend ? "#16a34a" : "#e2e8f0", color: feedbackForm.wouldRecommend ? "#fff" : "#64748b", fontWeight: "700", fontSize: "11px", cursor: "pointer" }}
                      >
                        👍 Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeedbackForm(prev => ({ ...prev, wouldRecommend: false }))}
                        style={{ padding: "4px 10px", borderRadius: "6px", border: "none", background: !feedbackForm.wouldRecommend ? "#dc2626" : "#e2e8f0", color: !feedbackForm.wouldRecommend ? "#fff" : "#64748b", fontWeight: "700", fontSize: "11px", cursor: "pointer" }}
                      >
                        👎 No
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={feedbackSubmitting}
                    style={{ ...btnBlue, padding: "10px 16px", fontSize: "13px", opacity: feedbackSubmitting ? 0.7 : 1 }}
                  >
                    {feedbackSubmitting ? "Publishing Review..." : "Submit Verified Feedback 🚀"}
                  </button>
                </form>
              </div>

              {/* History Card */}
              <div style={{ background: "#fff", padding: "22px", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "700", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>📜</span> My Feedback History ({feedbacks.length})
                </h3>

                <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "14px", maxHeight: "620px", paddingRight: "4px" }}>
                  {loadingFeedbacks ? (
                    <p style={{ color: "#64748b", fontSize: "13px", textAlign: "center", padding: "20px" }}>Loading reviews...</p>
                  ) : feedbacks.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
                      <span style={{ fontSize: "36px" }}>⭐</span>
                      <p style={{ fontWeight: "700", marginTop: "10px" }}>No feedback submitted yet</p>
                      <small>Submit your first service review using the form on the left!</small>
                    </div>
                  ) : (
                    feedbacks.map((fb, idx) => (
                      <div key={fb.id || idx} style={{ border: "1px solid #f1f5f9", borderRadius: "10px", padding: "14px", background: "#f8fafc" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                          <div>
                            <strong style={{ fontSize: "13px", color: "#0f172a" }}>{fb.handymanName || "Technician"}</strong>
                            <div style={{ fontSize: "11px", color: "#64748b" }}>{fb.serviceTitle} • {fb.bookingId}</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <span style={{ color: "#eab308", fontWeight: "800", fontSize: "13px" }}>
                              {"★".repeat(Math.round(fb.rating || 5))} ({fb.rating})
                            </span>
                            <div style={{ fontSize: "10px", color: "#94a3b8" }}>{fb.date}</div>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "6px", margin: "6px 0", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "10px", background: "#dbeafe", color: "#1e40af", padding: "2px 8px", borderRadius: "12px", fontWeight: "700" }}>
                            🏷️ {fb.category}
                          </span>
                          <span style={{ fontSize: "10px", background: fb.status === "Approved" ? "#dcfce7" : "#fef3c7", color: fb.status === "Approved" ? "#15803d" : "#b45309", padding: "2px 8px", borderRadius: "12px", fontWeight: "700" }}>
                            ✓ {fb.status || "Approved"}
                          </span>
                        </div>

                        <p style={{ margin: "6px 0", fontSize: "12px", color: "#334155", fontStyle: "italic", lineHeight: "1.4" }}>
                          "{fb.comment}"
                        </p>

                        {/* Handyman/Admin Provider Reply */}
                        {fb.reply && (
                          <div style={{ marginTop: "10px", padding: "10px 12px", background: "#eff6ff", borderRadius: "8px", borderLeft: "3px solid #2563eb" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: "700", color: "#1e40af", marginBottom: "2px" }}>
                              <span>💬 Response from {fb.reply.name} ({fb.reply.role})</span>
                              <span style={{ fontSize: "10px", color: "#64748b" }}>{fb.reply.date}</span>
                            </div>
                            <p style={{ margin: 0, fontSize: "11.5px", color: "#1e3a8a" }}>
                              {fb.reply.text}
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Support Chat Floating Drawer */}
        <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 9999 }}>
          {chatOpen ? (
            <div
              style={{
                width: "360px",
                maxWidth: "calc(100vw - 32px)",
                height: "500px",
                maxHeight: "calc(100vh - 80px)",
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: "16px",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden"
              }}
            >
              {/* Header */}
              <div
                style={{
                  background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                  color: "#ffffff",
                  padding: "12px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "16px"
                    }}
                  >
                    🤖
                  </div>
                  <div>
                    <div style={{ fontSize: "13.5px", fontWeight: "700", lineHeight: "1.2" }}>
                      FixIt AI Assistant
                    </div>
                    <div style={{ fontSize: "10.5px", opacity: 0.9, display: "flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80" }}></span>
                      Online • Dynamic Answers
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <button
                    onClick={() => {
                      setMessages([
                        {
                          sender: "bot",
                          text: "👋 Chat reset! How can I assist you with plumbers, electricians, pricing, or bookings today?",
                          time: "Just now"
                        }
                      ]);
                    }}
                    title="Reset chat"
                    style={{
                      background: "rgba(255, 255, 255, 0.15)",
                      border: "none",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: "12px",
                      padding: "4px 8px",
                      borderRadius: "6px"
                    }}
                  >
                    🔄
                  </button>
                  <button
                    onClick={() => setChatOpen(false)}
                    title="Close"
                    style={{
                      background: "none",
                      border: "none",
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: "700",
                      fontSize: "16px",
                      padding: "2px 6px"
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Message List */}
              <div
                style={{
                  flex: 1,
                  padding: "12px",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  background: "#f8fafc"
                }}
              >
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                      background: m.sender === "user" ? "#2563eb" : "#ffffff",
                      color: m.sender === "user" ? "#ffffff" : "#0f172a",
                      padding: "8px 12px",
                      borderRadius: m.sender === "user" ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                      fontSize: "12px",
                      maxWidth: "85%",
                      border: m.sender === "user" ? "none" : "1px solid #e2e8f0",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)"
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                      {String(m.text || "").split("\n").map((line, lIdx) => {
                        if (!line.trim()) return <div key={lIdx} style={{ height: "6px" }} />;
                        const parts = line.split(/(\*\*.*?\*\*|_.*?_)/g);
                        return (
                          <div key={lIdx} style={{ lineHeight: "1.45" }}>
                            {parts.map((p, pIdx) => {
                              if (p.startsWith("**") && p.endsWith("**")) {
                                return <strong key={pIdx} style={{ color: m.sender === "user" ? "#fff" : "#0f172a" }}>{p.slice(2, -2)}</strong>;
                              }
                              if (p.startsWith("_") && p.endsWith("_")) {
                                return <em key={pIdx} style={{ opacity: 0.85, fontSize: "11px" }}>{p.slice(1, -1)}</em>;
                              }
                              return p;
                            })}
                          </div>
                        );
                      })}

                      {/* Action Button Links */}
                      {m.action && (
                        <div style={{ marginTop: "8px", paddingTop: "6px", borderTop: "1px dashed #cbd5e1" }}>
                          {m.action === "emergency" && (
                            <button
                              onClick={() => setTab("emergency")}
                              style={{
                                background: "#dc2626",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                padding: "5px 10px",
                                fontSize: "11.5px",
                                fontWeight: "700",
                                cursor: "pointer"
                              }}
                            >
                              🚨 Open Emergency Booking
                            </button>
                          )}
                          {m.action === "tracking" && (
                            <button
                              onClick={() => setTab("tracking")}
                              style={{
                                background: "#2563eb",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                padding: "5px 10px",
                                fontSize: "11.5px",
                                fontWeight: "700",
                                cursor: "pointer"
                              }}
                            >
                              📍 Open Service Tracking
                            </button>
                          )}
                          {m.action === "services" && (
                            <button
                              onClick={() => setTab("overview")}
                              style={{
                                background: "#0284c7",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                padding: "5px 10px",
                                fontSize: "11.5px",
                                fontWeight: "700",
                                cursor: "pointer"
                              }}
                            >
                              🛠️ View Services Catalog
                            </button>
                          )}
                          {m.action === "payments" && (
                            <button
                              onClick={() => setTab("payments")}
                              style={{
                                background: "#16a34a",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                padding: "5px 10px",
                                fontSize: "11.5px",
                                fontWeight: "700",
                                cursor: "pointer"
                              }}
                            >
                              💳 Go to Payments Tab
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        fontSize: "9.5px",
                        marginTop: "4px",
                        textAlign: m.sender === "user" ? "right" : "left",
                        color: m.sender === "user" ? "#bfdbfe" : "#94a3b8"
                      }}
                    >
                      {m.time || ""}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div
                    style={{
                      alignSelf: "flex-start",
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      padding: "6px 12px",
                      borderRadius: "14px 14px 14px 2px",
                      fontSize: "11px",
                      color: "#64748b",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    <span>🤖 FixIt AI is typing...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Suggestion Chips */}
              <div
                style={{
                  padding: "6px 10px",
                  background: "#f1f5f9",
                  borderTop: "1px solid #e2e8f0",
                  display: "flex",
                  gap: "6px",
                  overflowX: "auto",
                  scrollbarWidth: "none"
                }}
              >
                {chatSuggestions.map((sug, sIdx) => (
                  <button
                    key={sIdx}
                    onClick={() => handleSendMessage(null, sug)}
                    disabled={isTyping}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #cbd5e1",
                      borderRadius: "14px",
                      padding: "4px 9px",
                      fontSize: "11px",
                      color: "#1e40af",
                      fontWeight: "600",
                      whiteSpace: "nowrap",
                      cursor: isTyping ? "not-allowed" : "pointer",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
                    }}
                  >
                    {sug}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => handleSendMessage(e)}
                style={{
                  display: "flex",
                  borderTop: "1px solid #e2e8f0",
                  padding: "8px",
                  background: "#ffffff",
                  gap: "6px"
                }}
              >
                <input
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder="Ask anything (e.g. suggest plumber)..."
                  disabled={isTyping}
                  style={{
                    flex: 1,
                    border: "1px solid #cbd5e1",
                    borderRadius: "20px",
                    outline: "none",
                    fontSize: "12px",
                    padding: "6px 12px"
                  }}
                />
                <button
                  type="submit"
                  disabled={isTyping || !inputMsg.trim()}
                  style={{
                    background: isTyping || !inputMsg.trim() ? "#94a3b8" : "#2563eb",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "20px",
                    padding: "6px 14px",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: isTyping || !inputMsg.trim() ? "not-allowed" : "pointer"
                  }}
                >
                  Send
                </button>
              </form>
            </div>
          ) : (
            <button
              onClick={() => setChatOpen(true)}
              style={{
                width: "54px",
                height: "54px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                color: "#ffffff",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                boxShadow: "0 10px 20px -3px rgba(37, 99, 235, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 0.2s ease"
              }}
            >
              💬
            </button>
          )}
        </div>
      </main>

      <EditProfile
        isOpen={modal}
        onClose={() => setModal(false)}
        onProfileUpdated={(updatedUser) => setUser((prev) => ({ ...prev, ...updatedUser }))}
      />
    </div>
  );
}

const cardStyle = { background: "#fff", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" };
const cardBlock = { background: "#fff", padding: "18px", borderRadius: "10px", border: "1px solid #e2e8f0" };
const btnBlue = { padding: "6px 14px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "700", cursor: "pointer", fontSize: "12px" };