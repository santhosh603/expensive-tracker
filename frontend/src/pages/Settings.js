import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { User, Bell, Lock, Globe, Save, Eye, EyeOff } from 'lucide-react';

const CURRENCIES = [
  { code: 'INR', label: '₹ Indian Rupee' },
  { code: 'USD', label: '$ US Dollar' },
  { code: 'EUR', label: '€ Euro' },
  { code: 'GBP', label: '£ British Pound' },
  { code: 'JPY', label: '¥ Japanese Yen' },
  { code: 'CAD', label: 'CA$ Canadian Dollar' },
  { code: 'AUD', label: 'A$ Australian Dollar' },
  { code: 'SGD', label: 'S$ Singapore Dollar' },
];

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const [profile, setProfile] = useState({
    name: user?.name || '',
    currency: user?.currency || 'INR',
    monthlyIncome: user?.monthlyIncome || '',
  });

  const [notifications, setNotifications] = useState({
    budgetAlert: user?.notifications?.budgetAlert ?? true,
    weeklyReport: user?.notifications?.weeklyReport ?? true,
    goalReminder: user?.notifications?.goalReminder ?? true,
  });

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingNotif, setSavingNotif] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateUser({ ...profile, monthlyIncome: parseFloat(profile.monthlyIncome) || 0, notifications });
      toast.success('Profile updated ✅');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to update profile');
    } finally { setSavingProfile(false); }
  };

  const saveNotifications = async () => {
    setSavingNotif(true);
    try {
      await updateUser({ notifications });
      toast.success('Notification preferences saved');
    } catch { toast.error('Failed to update'); }
    finally { setSavingNotif(false); }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) return toast.error('New passwords do not match');
    if (passwords.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setSavingPwd(true);
    try {
      await authAPI.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to change password');
    } finally { setSavingPwd(false); }
  };

  const tabs = [
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'security', icon: Lock, label: 'Security' },
    { id: 'preferences', icon: Globe, label: 'Preferences' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 800, animation: 'fadeIn 0.4s ease' }}>
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account and preferences</p>
      </div>

      <div style={{ display: 'flex', gap: 6, background: 'var(--bg-input)', padding: 4, borderRadius: 12, border: '1px solid var(--border-card)', width: 'fit-content', flexWrap: 'wrap' }}>
        {tabs.map(({ id, icon: Icon, label }) => (
          <button key={id} className={`tab ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="card" style={{ maxWidth: 600 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 24 }}>Profile Information</h3>

          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, padding: '16px 20px', background: 'rgba(124,92,252,0.06)', borderRadius: 12, border: '1px solid rgba(124,92,252,0.12)' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c5cfc, #22d3a5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem', color: 'white',
            }}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '1rem' }}>{user?.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{user?.email}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: 2 }}>
                Joined {new Date(user?.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>

          <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" value={user?.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3 }}>Email cannot be changed</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Currency</label>
                <select className="form-select" value={profile.currency} onChange={e => setProfile(p => ({ ...p, currency: e.target.value }))}>
                  {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Monthly Income</label>
                <input type="number" className="form-input" placeholder="50000" min="0" value={profile.monthlyIncome} onChange={e => setProfile(p => ({ ...p, monthlyIncome: e.target.value }))} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={savingProfile} style={{ width: 'fit-content', marginTop: 6 }}>
              {savingProfile ? <div className="spinner" /> : <><Save size={15} /> Save Changes</>}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="card" style={{ maxWidth: 600 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 24 }}>Notification Preferences</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              { key: 'budgetAlert', title: 'Budget Alerts', desc: 'Get notified when you approach your budget limit' },
              { key: 'weeklyReport', title: 'Weekly Report', desc: 'Receive a weekly summary of your expenses' },
              { key: 'goalReminder', title: 'Goal Reminders', desc: 'Get reminded about your savings goals progress' },
            ].map(({ key, title, desc }) => (
              <div key={key} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '16px 18px', borderRadius: 12,
                background: notifications[key] ? 'rgba(124,92,252,0.06)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${notifications[key] ? 'rgba(124,92,252,0.15)' : 'rgba(255,255,255,0.04)'}`,
                transition: 'all 0.2s',
              }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>
                </div>
                <button
                  onClick={() => setNotifications(n => ({ ...n, [key]: !n[key] }))}
                  style={{
                    width: 44, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer', flexShrink: 0,
                    background: notifications[key] ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                    position: 'relative', transition: 'background 0.2s',
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', background: 'white',
                    position: 'absolute', top: 3,
                    left: notifications[key] ? 23 : 3,
                    transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                  }} />
                </button>
              </div>
            ))}
          </div>
          <button className="btn btn-primary" onClick={saveNotifications} disabled={savingNotif} style={{ marginTop: 20, width: 'fit-content' }}>
            {savingNotif ? <div className="spinner" /> : <><Save size={15} /> Save Preferences</>}
          </button>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="card" style={{ maxWidth: 600 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 24 }}>Change Password</h3>
          <form onSubmit={savePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { key: 'currentPassword', label: 'Current Password', placeholder: 'Enter current password' },
              { key: 'newPassword', label: 'New Password', placeholder: 'Min 6 characters' },
              { key: 'confirmPassword', label: 'Confirm New Password', placeholder: 'Confirm new password' },
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="form-group">
                <label className="form-label">{label}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPwd[key.replace('Password', '').toLowerCase()] ? 'text' : 'password'}
                    className="form-input"
                    placeholder={placeholder}
                    value={passwords[key]}
                    onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))}
                    required
                    style={{ paddingRight: 42 }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const k = key.replace('Password', '').toLowerCase();
                      setShowPwd(p => ({ ...p, [k]: !p[k] }));
                    }}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                    }}
                  >
                    {showPwd[key.replace('Password', '').toLowerCase()] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            ))}
            <button type="submit" className="btn btn-primary" disabled={savingPwd} style={{ width: 'fit-content', marginTop: 6 }}>
              {savingPwd ? <div className="spinner" /> : <><Lock size={15} /> Change Password</>}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="card" style={{ maxWidth: 600 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 24 }}>App Preferences</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: '16px 18px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid var(--border-card)' }}>
              <div style={{ fontWeight: 500, marginBottom: 6 }}>Theme</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 12 }}>Currently using dark theme</div>
              <div style={{ display: 'flex', gap: 10 }}>
                {['dark', 'light'].map(t => (
                  <button key={t} style={{
                    padding: '8px 18px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 500,
                    background: t === 'dark' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.07)',
                    color: t === 'dark' ? 'white' : 'var(--text-muted)',
                    border: '1px solid transparent', cursor: 'pointer',
                  }}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
                ))}
              </div>
            </div>

            <div style={{ padding: '16px 18px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid var(--border-card)' }}>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>Account</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 12 }}>Member since {new Date(user?.createdAt).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ padding: '6px 14px', background: 'rgba(34,211,165,0.1)', border: '1px solid rgba(34,211,165,0.2)', borderRadius: 8, fontSize: '0.78rem', color: 'var(--accent-green)' }}>
                  ✓ Account Active
                </div>
                <div style={{ padding: '6px 14px', background: 'rgba(124,92,252,0.1)', border: '1px solid rgba(124,92,252,0.2)', borderRadius: 8, fontSize: '0.78rem', color: 'var(--accent-primary)' }}>
                  {user?.currency || 'INR'} Currency
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
