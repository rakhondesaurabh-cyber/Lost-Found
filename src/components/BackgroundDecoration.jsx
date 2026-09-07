import React from 'react';

export default function BackgroundDecoration({ variant = 'default' }) {
  if (variant === 'hero') {
    return (
      <div className="bg-hero-svg-layer" aria-hidden="true">
        {/* Ambient Radiant Glow Blobs */}
        <div className="svg-blob svg-blob-top-left" />
        <div className="svg-blob svg-blob-top-right" />
        <div className="svg-blob svg-blob-center-bottom" />

        {/* Floating Geometric SVGs */}
        {/* 1. Radar Concentric Pulse Circles */}
        <svg
          className="floating-svg svg-radar-left"
          width="320"
          height="320"
          viewBox="0 0 320 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="160" cy="160" r="150" stroke="#FF7043" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.25" />
          <circle cx="160" cy="160" r="105" stroke="#EA4335" strokeWidth="1.5" opacity="0.3" />
          <circle cx="160" cy="160" r="60" stroke="#FF5722" strokeWidth="2" strokeDasharray="4 4" opacity="0.35" />
          <circle cx="160" cy="160" r="18" fill="#FF5722" opacity="0.2" />
          <circle cx="160" cy="160" r="8" fill="#EA4335" />
        </svg>

        {/* 2. Dotted Matrix Grid Right */}
        <svg
          className="floating-svg svg-dots-right"
          width="240"
          height="240"
          viewBox="0 0 240 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <pattern id="dot-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="2" fill="#FF5722" opacity="0.18" />
          </pattern>
          <rect width="240" height="240" fill="url(#dot-pattern)" />
        </svg>

        {/* 3. Floating Beacon Pin SVG */}
        <svg
          className="floating-svg svg-pin-float"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#FF5722"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" fill="#FFEBE5" />
        </svg>

        {/* 4. Floating Key Sparkle SVG */}
        <svg
          className="floating-svg svg-sparkle-float"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#FBBC04"
          strokeWidth="2"
        >
          <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z" />
        </svg>

        {/* 5. Floating Compass SVG */}
        <svg
          className="floating-svg svg-compass-float"
          width="56"
          height="56"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#34A853"
          strokeWidth="1.6"
        >
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="#E6F4EA" />
        </svg>
      </div>
    );
  }

  // Auth Card Decorative SVG Backdrop
  if (variant === 'auth') {
    return (
      <div className="bg-auth-svg-layer" aria-hidden="true">
        <div className="svg-blob svg-blob-auth-1" />
        <div className="svg-blob svg-blob-auth-2" />
        <svg
          className="floating-svg"
          style={{ position: 'absolute', top: '10%', left: '8%', opacity: 0.25 }}
          width="180"
          height="180"
          viewBox="0 0 200 200"
        >
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF5722" />
              <stop offset="100%" stopColor="#EA4335" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="80" stroke="url(#grad1)" strokeWidth="3" strokeDasharray="12 8" />
          <circle cx="100" cy="100" r="50" stroke="url(#grad1)" strokeWidth="1.5" />
        </svg>

        <svg
          className="floating-svg"
          style={{ position: 'absolute', bottom: '15%', right: '10%', opacity: 0.2 }}
          width="160"
          height="160"
          viewBox="0 0 160 160"
        >
          <rect x="20" y="20" width="120" height="120" rx="28" stroke="#FBBC04" strokeWidth="2.5" strokeDasharray="8 6" />
        </svg>
      </div>
    );
  }

  // Global Page subtle ambient background
  return (
    <div className="bg-global-svg-layer" aria-hidden="true">
      <div className="svg-blob svg-blob-global-1" />
      <div className="svg-blob svg-blob-global-2" />
    </div>
  );
}
