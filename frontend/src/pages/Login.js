import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--bg-primary)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background decorations */}
      <div style={{
        position: 'absolute',
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,92,252,0.12) 0%, transparent 70%)',
        top: '-200px',
        left: '-100px',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(34,211,165,0.08) 0%, transparent 70%)',
        bottom: '-100px',
        right: '-50px',
        pointerEvents: 'none',
      }} />

      {/* Left panel — branding */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px',
        background: 'linear-gradient(135deg, rgba(124,92,252,0.08) 0%, rgba(91,138,247,0.05) 100%)',
        borderRight: '1px solid var(--border-card)',
      }} className="auth-left-panel">
        <div style={{ maxWidth: 420 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #7c5cfc, #5b8af7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              boxShadow: '0 4px 20px rgba(124,92,252,0.4)',
            }}>💸</div>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '1.3rem',
              color: 'var(--text-primary)',
            }}>SpendSmart</span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '2.8rem',
            lineHeight: 1.1,
            marginBottom: 20,
            background: 'linear-gradient(135deg, #f0eeff, #7c5cfc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Take control of your finances
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7, marginBottom: 40 }}>
            Track every rupee, set smart budgets, and reach your savings goals — all in one beautiful dashboard.
          </p>

          {[
            { icon: '📊', text: 'Real-time spending analytics' },
            { icon: '🎯', text: 'Smart budget tracking & alerts' },
            { icon: '💰', text: 'Savings goals with progress tracking' },
            { icon: '🔄', text: 'Recurring transaction management' },
          ].map((f, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 12,
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
            }}>
              <span style={{ fontSize: '1.1rem' }}>{f.icon}</span>
              {f.text}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{
        width: '460px',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 48px',
      }} className="auth-right-panel">
        <div style={{ width: '100%', maxWidth: 380, animation: 'slideUp 0.4s ease' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '1.8rem',
            marginBottom: 8,
            color: 'var(--text-primary)',
          }}>Sign in</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 32 }}>
            Welcome back! Enter your credentials to continue.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{
                  position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-muted)', pointerEvents: 'none',
                }} />
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  style={{ paddingLeft: 38 }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{
                  position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-muted)', pointerEvents: 'none',
                }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  style={{ paddingLeft: 38, paddingRight: 42 }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer',
                    padding: 2,
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ marginTop: 8, justifyContent: 'center', width: '100%' }}
            >
              {loading ? <div className="spinner" /> : (
                <><span>Sign In</span><ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div style={{
            textAlign: 'center',
            marginTop: 24,
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
          }}>
            Don't have an account?{' '}
            <Link to="/register" style={{
              color: 'var(--accent-primary)',
              fontWeight: 600,
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}>
              Create one
            </Link>
          </div>

          {/* Demo hint */}
          <div style={{
            marginTop: 24,
            background: 'rgba(124,92,252,0.07)',
            border: '1px solid rgba(124,92,252,0.15)',
            borderRadius: 10,
            padding: '12px 14px',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
          }}>
            💡 <strong style={{ color: 'var(--text-secondary)' }}>New here?</strong> Register an account to get started with your personal expense tracker.
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .auth-left-panel { display: none !important; }
          .auth-right-panel { width: 100% !important; padding: 40px 24px !important; }
        }
      `}</style>
    </div>
  );
}
