import React from 'react';

export default function Logo({ size = 32, showText = true, darkText = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {/* Modern AI + Wrench Emblem */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#4f7df7" />
          </linearGradient>
        </defs>

        {/* Outer Shield / Gear Frame */}
        <path
          d="M32 4L54 14V30C54 44.3 44.6 57.3 32 60C19.4 57.3 10 44.3 10 30V14L32 4Z"
          fill="url(#logoGradient)"
          opacity="0.15"
        />
        <path
          d="M32 4L54 14V30C54 44.3 44.6 57.3 32 60C19.4 57.3 10 44.3 10 30V14L32 4Z"
          stroke="url(#logoGradient)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* AI Spark / Bolt Icon */}
        <path
          d="M35 18L23 34H33L29 48L41 32H31L35 18Z"
          fill="url(#logoGradient)"
          stroke="#ffffff"
          strokeWidth="1.5"
        />
      </svg>

      {/* Brand Text */}
      {showText && (
        <span
          style={{
            fontSize: size * 0.65,
            fontWeight: 800,
            background: darkText
              ? 'linear-gradient(135deg, #0f172a, #3b82f6)'
              : 'linear-gradient(135deg, #ffffff, #c9bdf0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px',
          }}
        >
          HandyFix<span style={{ color: '#6366f1' }}>.ai</span>
        </span>
      )}
    </div>
  );
}