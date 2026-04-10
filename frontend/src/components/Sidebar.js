import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, CreditCard, Target, PieChart,
  RefreshCw, Settings, LogOut, Menu, X, Wallet,
  TrendingUp, ChevronRight
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', badge: null },
  { path: '/expenses', icon: CreditCard, label: 'Transactions', badge: null },
  { path: '/budgets', icon: Wallet, label: 'Budgets', badge: null },
  { path: '/goals', icon: Target, label: 'Goals', badge: null },
  { path: '/analytics', icon: PieChart, label: 'Analytics', badge: null },
  { path: '/recurring', icon: RefreshCw, label: 'Recurring', badge: null },
];

const bottomItems = [
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { user, logout, formatCurrency } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const sidebarContent = (
    <aside style={{
      width: 'var(--sidebar-width)',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-card)',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      zIndex: 200,
      transition: 'transform var(--transition-base)',
    }}>
      {/* Logo */}
      <div style={{
        padding: '24px 20px 20px',
        borderBottom: '1px solid var(--border-card)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #7c5cfc, #5b8af7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            boxShadow: '0 4px 16px rgba(124,92,252,0.4)',
            flexShrink: 0,
          }}>💸</div>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '1.1rem',
              color: 'var(--text-primary)',
              lineHeight: 1.1,
            }}>SpendSmart</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 1 }}>Finance Tracker</div>
          </div>
        </div>
      </div>

      {/* User mini card */}
      <div style={{
        margin: '16px 14px 8px',
        background: 'rgba(124,92,252,0.07)',
        border: '1px solid rgba(124,92,252,0.15)',
        borderRadius: 12,
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
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
          flexShrink: 0,
          color: 'white',
        }}>
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 600,
            fontSize: '0.85rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: 'var(--text-primary)',
          }}>{user?.name || 'User'}</div>
          {user?.monthlyIncome > 0 && (
            <div style={{ fontSize: '0.72rem', color: 'var(--accent-green)', marginTop: 1 }}>
              {formatCurrency(user.monthlyIncome)}/mo
            </div>
          )}
        </div>
        <TrendingUp size={14} color="var(--accent-primary)" />
      </div>

      {/* Nav section */}
      <div style={{ padding: '8px 10px', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 10px 6px' }}>
          Menu
        </div>
        <nav>
          {navItems.map(({ path, icon: Icon, label, badge }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 10,
                marginBottom: 2,
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                background: isActive ? 'linear-gradient(135deg, rgba(124,92,252,0.2), rgba(91,138,247,0.1))' : 'transparent',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                border: isActive ? '1px solid rgba(124,92,252,0.2)' : '1px solid transparent',
                fontWeight: isActive ? 600 : 400,
                fontSize: '0.875rem',
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
                  <span style={{ flex: 1 }}>{label}</span>
                  {badge && (
                    <span style={{
                      background: 'var(--accent-primary)',
                      color: 'white',
                      fontSize: '0.65rem',
                      padding: '2px 7px',
                      borderRadius: 99,
                      fontWeight: 600,
                    }}>{badge}</span>
                  )}
                  {isActive && <ChevronRight size={13} />}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom section */}
      <div style={{
        padding: '10px 10px 20px',
        borderTop: '1px solid var(--border-card)',
      }}>
        {bottomItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            onClick={() => setMobileOpen(false)}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 10,
              marginBottom: 2,
              textDecoration: 'none',
              transition: 'all 0.15s ease',
              background: isActive ? 'rgba(124,92,252,0.15)' : 'transparent',
              color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: 400,
              fontSize: '0.875rem',
            })}
          >
            <Icon size={17} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            borderRadius: 10,
            width: '100%',
            color: 'var(--accent-red)',
            fontSize: '0.875rem',
            transition: 'background 0.15s',
          }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(255,94,125,0.08)'}
          onMouseOut={e => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={17} strokeWidth={1.8} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="sidebar-desktop" style={{ display: 'block' }}>
        {sidebarContent}
      </div>

      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        style={{
          position: 'fixed',
          top: 14,
          left: 14,
          zIndex: 300,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: 10,
          padding: 9,
          color: 'var(--text-primary)',
          display: 'none',
        }}
        className="mobile-menu-btn"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 199,
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)',
        width: 'fit-content',
        display: 'none',
      }} className="mobile-sidebar">
        {sidebarContent}
        <button
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'absolute',
            top: 16,
            right: -44,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: 8,
            padding: 8,
            color: 'var(--text-primary)',
          }}
        >
          <X size={18} />
        </button>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .sidebar-desktop { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .mobile-sidebar { display: block !important; }
        }
      `}</style>
    </>
  );
}
