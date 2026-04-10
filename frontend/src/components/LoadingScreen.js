import React from 'react';

export default function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      gap: '20px',
    }}>
      <div style={{
        width: 52,
        height: 52,
        borderRadius: '14px',
        background: 'linear-gradient(135deg, #7c5cfc, #5b8af7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.6rem',
        animation: 'float 2s ease-in-out infinite',
        boxShadow: '0 0 40px rgba(124,92,252,0.4)',
      }}>
        💸
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.2rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
        }}>SpendSmart</div>
        <div className="spinner" />
      </div>
    </div>
  );
}
