import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Plus, Search, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PAGE_TITLES = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Your financial overview' },
  '/expenses': { title: 'Transactions', subtitle: 'Track your income & expenses' },
  '/budgets': { title: 'Budgets', subtitle: 'Monitor your spending limits' },
  '/goals': { title: 'Savings Goals', subtitle: 'Work towards your financial goals' },
  '/analytics': { title: 'Analytics', subtitle: 'Deep dive into your finances' },
  '/recurring': { title: 'Recurring', subtitle: 'Manage automatic transactions' },
  '/settings': { title: 'Settings', subtitle: 'Manage your preferences' },
};

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const pageInfo = PAGE_TITLES[location.pathname] || { title: 'SpendSmart', subtitle: '' };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header style={{
      height: 'var(--header-height)',
      background: 'rgba(8,8,24,0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-card)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Left: Page title */}
      <div style={{ paddingLeft: 0 }}>
        <div style={{
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontWeight: 500,
        }}>
          {location.pathname === '/dashboard' ? `${getGreeting()}, ${user?.name?.split(' ')[0] || 'there'} 👋` : pageInfo.subtitle}
        </div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '1.05rem',
          color: 'var(--text-primary)',
          marginTop: 2,
        }}>
          {pageInfo.title}
        </div>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Quick add */}
        <button
          onClick={() => navigate('/expenses')}
          className="btn btn-primary btn-sm"
          style={{ gap: 6 }}
        >
          <Plus size={15} strokeWidth={2.5} />
          <span style={{ display: window.innerWidth < 480 ? 'none' : 'inline' }}>Add Transaction</span>
        </button>

        {/* User avatar */}
        <div style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #7c5cfc, #22d3a5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '0.85rem',
          cursor: 'pointer',
          color: 'white',
          flexShrink: 0,
        }}
          onClick={() => navigate('/settings')}
        >
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          header { padding: 0 16px 0 56px !important; }
        }
        @media (max-width: 480px) {
          header { padding: 0 12px 0 52px !important; }
        }
      `}</style>
    </header>
  );
}
