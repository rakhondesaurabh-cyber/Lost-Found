import React from 'react';
import { Sparkles } from 'lucide-react';

export default function MatchBadge({ score = 90 }) {
  let bg = 'linear-gradient(135deg, #FF6F00 0%, #EA4335 100%)';
  if (score >= 80) bg = 'linear-gradient(135deg, #34A853 0%, #0F9D58 100%)';
  else if (score >= 50) bg = 'linear-gradient(135deg, #FF6F00 0%, #EA4335 100%)';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.25rem 0.65rem',
        borderRadius: '9999px',
        background: bg,
        color: 'white',
        fontSize: '0.78rem',
        fontWeight: 800,
        letterSpacing: '0.02em',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}
    >
      <Sparkles size={12} />
      <span>{score}% Match</span>
    </span>
  );
}
