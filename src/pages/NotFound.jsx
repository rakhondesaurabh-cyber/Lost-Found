import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setMounted(true);
    });
  }, []);

  return (
    <div 
      className="not-found-container"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: 'calc(100vh - 72px)',
        marginBottom: '-4rem', // offset the global main-content padding
        zIndex: 1, 
        background: 'linear-gradient(180deg, #ff4f1f 0%, #ff5a2a 45%, #ff7060 100%)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* 404 OVERSIZED BACKGROUND TEXT */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
        }}
      >
        <span 
          style={{
            fontSize: 'clamp(280px, 48vw, 900px)',
            fontWeight: 900,
            lineHeight: 0.75,
            letterSpacing: '-0.08em',
            color: 'rgba(255, 235, 228, 0.85)',
            whiteSpace: 'nowrap',
            userSelect: 'none',
          }}
        >
          404
        </span>
      </div>

      {/* CENTER FOX MASCOT WITH IMMERSIVE FADE MASK */}
      <div 
        className="mascot-container"
        style={{
          position: 'relative',
          zIndex: 20,
          width: 'clamp(280px, 45vw, 700px)',
          height: 'clamp(350px, 60vh, 700px)',
          pointerEvents: 'none',
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          opacity: mounted ? 1 : 0,
          transition: 'all 800ms cubic-bezier(0.16, 1, 0.3, 1) 100ms',
          animation: 'floatFox 4s ease-in-out infinite',
        }}
      >
        <div style={{
          position: 'absolute',
          inset: '-10%', // give the mask some breathing room to fade out
          maskImage: 'radial-gradient(ellipse at center, black 35%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 35%, transparent 70%)',
        }}>
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260713_234424_b1332b69-2e69-4302-8dbc-40f86846afbd.mp4"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              mixBlendMode: 'normal',
            }}
          />
        </div>
      </div>

      {/* ERROR MESSAGE AND CTA BUTTON */}
      <div 
        style={{
          position: 'relative',
          zIndex: 30,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: 'clamp(1rem, 3vh, 2rem)',
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          opacity: mounted ? 1 : 0,
          transition: 'all 800ms cubic-bezier(0.16, 1, 0.3, 1) 200ms',
        }}
      >
        <h2 
          style={{ 
            color: '#FFFFFF', 
            fontSize: 'clamp(18px, 1.5vw, 26px)', 
            fontWeight: 600, 
            marginBottom: '1rem',
            textAlign: 'center',
            padding: '0 1rem',
            textShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}
        >
          Oops, something went wrong!
        </h2>
        
        <Link 
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '14px 32px',
            borderRadius: '9999px',
            color: '#ff4f1f',
            background: '#FFFFFF',
            fontWeight: 600,
            fontSize: '1rem',
            textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
            transition: 'all 200ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.03)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.1)';
          }}
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
          Back to Home
        </Link>
      </div>

      <style>{`
        @keyframes floatFox {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
