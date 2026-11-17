import React, { useState, useEffect, useRef } from 'react';
import API from '../API/Axios';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "👋 Hi! I'm your FixIt.ai Assistant. How can I assist with your bookings or technician suggestions today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const quickPrompts = [
    "🔧 Best Plumber",
    "⚡ Suggest Electrician",
    "🚨 Emergency Booking",
    "💰 Price List"
  ];

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const generateLocalReply = (text) => {
    const q = (text || "").toLowerCase();
    if (q.includes("plumb") || q.includes("pipe") || q.includes("leak") || q.includes("tap")) {
      return "🚰 Top recommended plumbers: Vikram Singh (5.0★ Verified Pro) and John Doe (4.9★, ₹249). Both available for instant booking or emergency dispatch!";
    }
    if (q.includes("electr") || q.includes("wire") || q.includes("light") || q.includes("switch")) {
      return "⚡ Top recommended electricians: Alex Smith (4.9★, ₹299) and Priya Sharma (4.8★). Certified for home wiring and emergency repairs.";
    }
    if (q.includes("clean") || q.includes("maid")) {
      return "🧹 Recommended cleaner: Sarah Connor (4.8★, ₹499 for deep home cleaning & sanitation).";
    }
    if (q.includes("ac") || q.includes("appliance") || q.includes("cool")) {
      return "❄️ AC & Appliance expert: Mike Taylor (4.9★, ₹399). Specializes in AC servicing, fridge and washer repair.";
    }
    if (q.includes("emergency") || q.includes("urgent")) {
      return "🚨 24/7 Priority Emergency dispatch is active! Technicians arrive in 15-25 minutes with live GPS tracking.";
    }
    if (q.includes("price") || q.includes("cost") || q.includes("rate")) {
      return "🏷️ Transparent Pricing: Plumbing (from ₹249), Electrical (from ₹299), AC Servicing (from ₹399), Cleaning (from ₹499).";
    }
    return "🤖 I'm here to assist! Ask me to recommend plumbers, electricians, cleaners, or explain emergency dispatch and pricing.";
  };

  const handleSend = async (e, customText = null) => {
    if (e && e.preventDefault) e.preventDefault();
    const query = (customText !== null ? customText : input).trim();
    if (!query) return;

    setMessages((prev) => [...prev, { sender: 'user', text: query }]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await API.post('/ai/chat', { message: query });
      if (res.data && res.data.reply) {
        setMessages((prev) => [...prev, { sender: 'bot', text: res.data.reply }]);
        setIsTyping(false);
        return;
      }
    } catch (err) {
      console.warn("AI endpoint fallback in ChatBot component:", err);
    }

    setTimeout(() => {
      const reply = generateLocalReply(query);
      setMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
      setIsTyping(false);
    }, 400);
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000, fontFamily: 'sans-serif' }}>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#2563eb',
            color: '#fff',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 8px 16px rgba(37,99,235,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          💬
        </button>
      ) : (
        <div
          style={{
            width: '340px',
            height: '460px',
            backgroundColor: '#fff',
            border: '1px solid #cbd5e1',
            borderRadius: '14px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: '#2563eb',
              color: '#fff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>🤖</span>
              <div>
                <span style={{ fontWeight: 'bold', fontSize: '13px' }}>FixIt AI Assistant</span>
                <div style={{ fontSize: '10px', opacity: 0.85 }}>● Online</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', background: '#f8fafc' }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor: m.sender === 'user' ? '#2563eb' : '#fff',
                  color: m.sender === 'user' ? '#fff' : '#1e293b',
                  padding: '8px 12px',
                  borderRadius: m.sender === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  fontSize: '12.5px',
                  maxWidth: '85%',
                  border: m.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  whiteSpace: 'pre-line'
                }}
              >
                {m.text}
              </div>
            ))}
            {isTyping && (
              <div style={{ alignSelf: 'flex-start', fontSize: '11px', color: '#64748b', background: '#fff', padding: '6px 10px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                FixIt AI is typing...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Prompt pills */}
          <div style={{ padding: '6px 8px', background: '#f1f5f9', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '6px', overflowX: 'auto' }}>
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(null, p)}
                disabled={isTyping}
                style={{
                  fontSize: '11px',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  background: '#fff',
                  border: '1px solid #cbd5e1',
                  color: '#1d4ed8',
                  whiteSpace: 'nowrap',
                  cursor: isTyping ? 'not-allowed' : 'pointer'
                }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} style={{ display: 'flex', padding: '8px', borderTop: '1px solid #eee', background: '#fff' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              disabled={isTyping}
              style={{ flex: 1, padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '18px', outline: 'none', fontSize: '12px' }}
            />
            <button
              type="submit"
              disabled={isTyping || !input.trim()}
              style={{ marginLeft: '6px', padding: '6px 14px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '18px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBot;