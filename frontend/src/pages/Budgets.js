import React, { useState, useEffect, useCallback } from 'react';
import { budgetAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, X, Trash2, Edit2, AlertTriangle, CheckCircle } from 'lucide-react';

const CATEGORIES = [
  'Food & Dining','Transportation','Shopping','Entertainment','Bills & Utilities',
  'Healthcare','Education','Travel','Housing','Personal Care','Investments','Other'
];

const CATEGORY_EMOJI = {
  'Food & Dining':'🍽️','Transportation':'🚗','Shopping':'🛍️','Entertainment':'🎬',
  'Bills & Utilities':'💡','Healthcare':'🏥','Education':'📚','Travel':'✈️',
  'Housing':'🏠','Personal Care':'💆','Investments':'📈','Other':'📦',
};

const COLORS = ['#7c5cfc','#22d3a5','#ff5e7d','#f59e0b','#3b82f6','#ec4899','#10b981','#f97316','#8b5cf6','#06b6d4','#84cc16','#94a3b8'];

const EMPTY_FORM = { category: 'Food & Dining', limit: '', period: 'monthly', alertThreshold: 80, color: '#7c5cfc', icon: '💰' };

export default function Budgets() {
  const { formatCurrency } = useAuth();
  const now = new Date();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const loadBudgets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await budgetAPI.getAll({ month, year });
      setBudgets(res.data.data);
    } catch { toast.error('Failed to load budgets'); }
    finally { setLoading(false); }
  }, [month, year]);

  useEffect(() => { loadBudgets(); }, [loadBudgets]);

  const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (b) => {
    setEditItem(b);
    setForm({ category: b.category, limit: b.limit, period: b.period, alertThreshold: b.alertThreshold, color: b.color, icon: b.icon || '💰' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.limit || parseFloat(form.limit) <= 0) return toast.error('Valid limit required');
    setSaving(true);
    try {
      const payload = { ...form, limit: parseFloat(form.limit), month, year };
      if (editItem) {
        await budgetAPI.update(editItem._id, payload);
        toast.success('Budget updated');
      } else {
        await budgetAPI.create(payload);
        toast.success('Budget created ✅');
      }
      setShowModal(false);
      loadBudgets();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to save budget');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return;
    try {
      await budgetAPI.delete(id);
      toast.success('Budget deleted');
      loadBudgets();
    } catch { toast.error('Delete failed'); }
  };

  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + (b.spent || 0), 0);
  const overBudget = budgets.filter(b => b.percentage > 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.4s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Budgets</h1>
          <p className="page-subtitle">Set limits and track your spending</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select className="form-select" value={month} onChange={e => setMonth(parseInt(e.target.value))} style={{ width: 'auto' }}>
            {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select className="form-select" value={year} onChange={e => setYear(parseInt(e.target.value))} style={{ width: 'auto' }}>
            {[2022,2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className="btn btn-primary btn-sm" onClick={openAdd}><Plus size={15} /> New Budget</button>
        </div>
      </div>

      {/* Summary cards */}
      {!loading && budgets.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="budget-summary">
          {[
            { label: 'Total Budget', value: formatCurrency(totalLimit), color: 'var(--accent-primary)', bg: 'rgba(124,92,252,0.08)' },
            { label: 'Total Spent', value: formatCurrency(totalSpent), color: 'var(--accent-red)', bg: 'rgba(255,94,125,0.08)' },
            { label: 'Remaining', value: formatCurrency(Math.max(0, totalLimit - totalSpent)), color: 'var(--accent-green)', bg: 'rgba(34,211,165,0.08)' },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              {i === 1 && totalLimit > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{
                      width: `${Math.min(100, (totalSpent / totalLimit) * 100)}%`,
                      background: totalSpent > totalLimit ? 'var(--accent-red)' : 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
                    }} />
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    {Math.round((totalSpent / totalLimit) * 100)}% of total budget used
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Over budget alert */}
      {overBudget.length > 0 && (
        <div style={{
          background: 'rgba(255,94,125,0.08)',
          border: '1px solid rgba(255,94,125,0.25)',
          borderRadius: 12,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          color: 'var(--accent-red)',
          fontSize: '0.875rem',
        }}>
          <AlertTriangle size={18} />
          <span><strong>{overBudget.length}</strong> budget{overBudget.length > 1 ? 's' : ''} exceeded: {overBudget.map(b => b.category).join(', ')}</span>
        </div>
      )}

      {/* Budget cards grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 18 }} />)}
        </div>
      ) : budgets.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">💰</div>
            <div className="empty-state-title">No budgets for {MONTHS[month]} {year}</div>
            <div className="empty-state-desc">Create budgets to track your spending limits</div>
            <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={openAdd}>
              <Plus size={14} /> Create Budget
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {budgets.map(budget => {
            const pct = budget.percentage || 0;
            const isOver = pct > 100;
            const isAlert = pct >= (budget.alertThreshold || 80) && !isOver;
            return (
              <div key={budget._id} className="card" style={{
                borderColor: isOver ? 'rgba(255,94,125,0.3)' : isAlert ? 'rgba(251,191,36,0.3)' : 'var(--border-card)',
                transition: 'all 0.25s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 11,
                      background: `${budget.color}22`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.2rem',
                    }}>
                      {CATEGORY_EMOJI[budget.category] || '💰'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{budget.category}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 1, textTransform: 'capitalize' }}>{budget.period}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    {isOver ? <AlertTriangle size={16} color="var(--accent-red)" /> :
                     isAlert ? <AlertTriangle size={16} color="var(--accent-amber)" /> :
                     <CheckCircle size={16} color="var(--accent-green)" />}
                    <button className="btn btn-ghost btn-icon" onClick={() => openEdit(budget)} style={{ padding: 5 }}>
                      <Edit2 size={13} color="var(--text-muted)" />
                    </button>
                    <button className="btn btn-ghost btn-icon" onClick={() => handleDelete(budget._id)} style={{ padding: 5 }}>
                      <Trash2 size={13} color="var(--accent-red)" />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {formatCurrency(budget.spent || 0)} spent
                  </span>
                  <span style={{
                    fontSize: '0.82rem', fontWeight: 700,
                    color: isOver ? 'var(--accent-red)' : isAlert ? 'var(--accent-amber)' : 'var(--text-secondary)',
                  }}>{pct}%</span>
                </div>

                <div className="progress-bar" style={{ height: 8 }}>
                  <div className="progress-fill" style={{
                    width: `${Math.min(100, pct)}%`,
                    background: isOver
                      ? 'var(--accent-red)'
                      : isAlert
                      ? 'linear-gradient(90deg, var(--accent-amber), #f97316)'
                      : `linear-gradient(90deg, ${budget.color}, ${budget.color}99)`,
                  }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {isOver
                      ? <span style={{ color: 'var(--accent-red)' }}>Over by {formatCurrency(Math.abs(budget.remaining))}</span>
                      : `${formatCurrency(budget.remaining || 0)} remaining`}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Limit: {formatCurrency(budget.limit)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="modal-title">{editItem ? 'Edit Budget' : 'Create Budget'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_EMOJI[c]} {c}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Limit Amount *</label>
                  <input type="number" className="form-input" placeholder="5000" min="1" step="1" value={form.limit} onChange={e => setForm(f => ({ ...f, limit: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Period</label>
                  <select className="form-select" value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))}>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Alert Threshold: {form.alertThreshold}%</label>
                <input type="range" min="50" max="100" step="5" value={form.alertThreshold} onChange={e => setForm(f => ({ ...f, alertThreshold: parseInt(e.target.value) }))}
                  style={{ width: '100%', accentColor: 'var(--accent-primary)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  <span>50%</span><span>Alert at {form.alertThreshold}% usage</span><span>100%</span>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Color</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {COLORS.map(c => (
                    <div key={c} onClick={() => setForm(f => ({ ...f, color: c }))} style={{
                      width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer',
                      border: form.color === c ? '2px solid white' : '2px solid transparent',
                      transform: form.color === c ? 'scale(1.2)' : 'scale(1)',
                      transition: 'transform 0.15s, border 0.15s',
                    }} />
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <div className="spinner" /> : editItem ? 'Update Budget' : 'Create Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .budget-summary { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
