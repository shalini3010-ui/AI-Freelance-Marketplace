import React, { useState, useRef, useEffect } from "react";
import API from "./API/Axios";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Hi there! I'm your AI Service Assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  // Suggested Quick Actions / Questions
  const quickQuestions = [
    "🛠️ Find AC Worker",
    "🚨 Emergency Booking",
    "📍 Track Service",
    "💳 Payments & Invoice",
  ];

  // Auto-scroll to the bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen]);

  // AI Response Matcher
  const generateBotReply = (text) => {
    const q = text.toLowerCase();

    if (q.match(/\b(hi|hello|hey|ho|hlo|greetings)\b/)) {
      return "👋 Hello! How can I assist you with your bookings or technician suggestions today?";
    }
    if (q.includes("plumb") || q.includes("leak") || q.includes("pipe") || q.includes("tap")) {
      return "🚰 Top verified Plumbers:\n• 👨‍🔧 Vikram Singh — 5.0★ Verified Master Plumber\n• 👨‍🔧 John Doe — 4.9★ (₹249 base rate)\nAvailable for instant dispatch in your area!";
    }
    if (q.includes("electric") || q.includes("wire") || q.includes("light") || q.includes("power")) {
      return "⚡ Top verified Electricians:\n• ⚡ Alex Smith — 4.9★ Certified Electrician (₹299)\n• ⚡ Priya Sharma — 4.8★ Appliance & Wiring Specialist";
    }
    if (q.includes("ac") || q.includes("air condition") || q.includes("cooling")) {
      return "❄️ AC & Appliance Specialist:\n• Mike Taylor — 4.9★ (₹399 AC Deep Cleaning & Repair)\nIncludes 30-day service warranty!";
    }
    if (q.includes("clean") || q.includes("maid")) {
      return "🧹 Home Sanitation & Cleaning:\n• Sarah Connor — 4.8★ (₹499 Deep Home Cleaning)\nIncludes complete kitchen, bathroom, and floor sanitation.";
    }
    if (q.includes("emergency") || q.includes("urgent") || q.includes("fast")) {
      return "🚨 Priority 24/7 Emergency Dispatch is active! Average technician arrival is 15-25 minutes with live GPS tracking.";
    }
    if (q.includes("track") || q.includes("status") || q.includes("where")) {
      return "📍 You can track live provider movement and current job progress under the '📍 Service Tracking' tab.";
    }
    if (q.includes("pay") || q.includes("price") || q.includes("cost") || q.includes("invoice") || q.includes("bill")) {
      return "💳 Transparent Pricing: Plumbing (from ₹249), Electrical (from ₹299), AC (from ₹399), Cleaning (from ₹499). Pay securely via UPI/Card and download instant PDF invoices!";
    }
    if (q.includes("history") || q.includes("past") || q.includes("previous")) {
      return "📜 View all your completed and ongoing requests in the '📜 Booking History' tab.";
    }
    if (q.includes("recommend") || q.includes("best") || q.includes("suggest")) {
      return "🤖 For top-rated recommendations, check '🤖 AI Recommendations' or tell me the service you need (e.g. plumber, electrician)!";
    }

    return "🤖 I'm here to assist! Ask me about plumbers, electricians, emergency bookings, live service tracking, or invoice downloads.";
  };

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    // Add User Message
    setMessages((prev) => [...prev, { sender: "user", text: query }]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    try {
      const res = await API.post("/ai/chat", { message: query });
      if (res.data && res.data.reply) {
        setMessages((prev) => [...prev, { sender: "bot", text: res.data.reply }]);
        setIsTyping(false);
        return;
      }
    } catch (err) {
      console.warn("AI chat API fallback:", err);
    }

    // Dynamic simulated reply
    setTimeout(() => {
      const reply = generateBotReply(query);
      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
      setIsTyping(false);
    }, 450);
  };

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* ─── FLOATING TOGGLE BUTTON ─── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #8b5cf6, #4f7df7)",
            color: "#fff",
            border: "none",
            fontSize: 26,
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(139, 92, 246, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          💬
        </button>
      )}

      {/* ─── CHATBOX CONTAINER ─── */}
      {isOpen && (
        <div
          style={{
            width: 350,
            height: 480,
            background: "#241d1a",
            borderRadius: 18,
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "14px 18px",
              background: "#1c1722",
              color: "#fff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: "#8b5cf6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                }}
              >
                🤖
              </div>
              <div>
                <div style={{ fontWeight: "bold", fontSize: 14 }}>Service Assistant</div>
                <div style={{ fontSize: 11, color: "#4ade80", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }}></span> Online
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "#9a93ad",
                cursor: "pointer",
                fontSize: 18,
                padding: 4,
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, padding: 14, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                  background: m.sender === "user" ? "linear-gradient(135deg, #8b5cf6, #6d28d9)" : "#1a1424",
                  color: "#fff",
                  padding: "10px 14px",
                  borderRadius: m.sender === "user" ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                  fontSize: 13,
                  maxWidth: "82%",
                  lineHeight: 1.45,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  border: m.sender === "bot" ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}
              >
                {m.text}
              </div>
            ))}

            {/* Animated Typing Indicator */}
            {isTyping && (
              <div
                style={{
                  alignSelf: "flex-start",
                  background: "#1a1424",
                  color: "#9a93ad",
                  padding: "8px 14px",
                  borderRadius: "14px 14px 14px 2px",
                  fontSize: 12,
                  fontStyle: "italic",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                Assistant is typing...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Action Pills */}
          <div
            style={{
              padding: "6px 10px",
              display: "flex",
              gap: 6,
              overflowX: "auto",
              background: "#1c1722",
              borderTop: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                style={{
                  whiteSpace: "nowrap",
                  background: "rgba(139, 92, 246, 0.15)",
                  color: "#c9bdf0",
                  border: "1px solid rgba(139, 92, 246, 0.3)",
                  padding: "5px 10px",
                  borderRadius: 12,
                  fontSize: 11,
                  cursor: "pointer",
                }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{ display: "flex", padding: 10, background: "#1c1722", borderTop: "1px solid rgba(255,255,255,0.08)" }}
          >
            <input
              type="text"
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                flex: 1,
                background: "#140c28",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8,
                padding: "8px 12px",
                color: "#fff",
                outline: "none",
                fontSize: 13,
              }}
            />
            <button
              type="submit"
              style={{
                marginLeft: 8,
                padding: "8px 14px",
                background: "linear-gradient(135deg, #8b5cf6, #4f7df7)",
                border: "none",
                borderRadius: 8,
                color: "#fff",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}