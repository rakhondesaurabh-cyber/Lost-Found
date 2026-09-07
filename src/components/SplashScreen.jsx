import React, { useState, useEffect } from 'react';

export default function SplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(15);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Smooth loading progress animation
    const timer1 = setTimeout(() => setProgress(55), 350);
    const timer2 = setTimeout(() => setProgress(88), 700);
    const timer3 = setTimeout(() => setProgress(100), 1050);

    // Trigger smooth fade out
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 1300);

    // Unmount after fade
    const finishTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 1750);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`splash-overlay ${fading ? 'splash-fade-out' : ''}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF5F2 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        transition: 'opacity 0.45s cubic-bezier(0.4, 0, 0.2, 1), transform 0.45s ease',
        opacity: fading ? 0 : 1,
        pointerEvents: fading ? 'none' : 'auto'
      }}
    >
      {/* Animated Glowing Logo Container */}
      <div style={{ position: 'relative', marginBottom: '1.75rem' }}>
        {/* Pulsing Aura Rings */}
        <div className="splash-pulse-ring-1" />
        <div className="splash-pulse-ring-2" />

        {/* Brand App Logo Squircle */}
        <div
          className="splash-logo-box"
          style={{
            width: '96px',
            height: '96px',
            borderRadius: '26px',
            background: 'linear-gradient(135deg, #FF5722 0%, #EA4335 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 12px 36px rgba(234, 67, 53, 0.35)',
            position: 'relative',
            zIndex: 2,
            animation: 'splashLogoPop 0.7s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <svg width="56" height="56" viewBox="0 0 512 512" style={{ animation: 'splashNeedleRotate 1.8s ease-in-out infinite alternate' }}>
            <circle cx="256" cy="256" r="148" fill="none" stroke="#FFFFFF" strokeWidth="32" strokeLinecap="round" />
            <path d="M 256 160 C 275 220 292 237 352 256 C 292 275 275 292 256 352 C 237 292 220 275 160 256 C 220 237 237 220 256 160 Z" fill="#FFFFFF" />
            <path d="M 256 200 C 267 236 276 245 312 256 C 276 267 267 276 256 312 C 245 276 236 267 200 256 C 236 245 245 236 256 200 Z" fill="#EA4335" />
          </svg>
        </div>
      </div>

      {/* Brand Title */}
      <h1
        style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: '2rem',
          fontWeight: 800,
          color: 'var(--text-main)',
          marginBottom: '0.35rem',
          letterSpacing: '-0.02em',
          animation: 'fadeInUp 0.6s ease-out 0.2s both'
        }}
      >
        Reconnect<span style={{ color: 'var(--primary)' }}>.</span>
      </h1>

      <p
        style={{
          fontSize: '0.92rem',
          color: 'var(--text-secondary)',
          fontWeight: 500,
          marginBottom: '2rem',
          animation: 'fadeInUp 0.6s ease-out 0.3s both'
        }}
      >
        Smart Community Lost & Found Hub
      </p>

      {/* Progress Bar Container */}
      <div
        style={{
          width: '180px',
          height: '4px',
          background: 'rgba(255, 87, 34, 0.12)',
          borderRadius: '9999px',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #FF5722 0%, #EA4335 100%)',
            borderRadius: '9999px',
            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </div>
    </div>
  );
}
