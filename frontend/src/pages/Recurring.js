import React, { useState, useEffect, useCallback } from 'react';
import { recurringAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, X, Trash2, Edit2, RefreshCw, Calendar, ToggleLeft, ToggleRight } from 'lucide-react';

const CATEGORIES = ['Food & Dining','Transportation','Shopping','Entertainment','Bills & Utilities','Healthcare','Education','Travel','Housing','Personal Care','Investments','Salary','Freelance','Business','Gift','Other'];
const FREQUENCIES = ['daily','weekly','biweekly','monthly','quarterly','yearly'];

const EMPTY_FORM = {
  title: '', amount: '', type: 'expense', category: 'Bills & Utilities',
  frequency: 'monthly', startDate: new Date().toISOString().split('T')[0],
  endDate: '', paymentMethod: 'Auto', description: '',
  nextDueDate: new Date().toISOString().split('T')[0],
};

const FREQ_LABELS = { daily: 'Daily', weekly: 'Weekly', biweekly: 'Bi-weekly', monthly: 'Monthly', quarterly: 'Quarterly', yearly: 'Yearly' };

export default function Recurring() {
  const { formatCurrency } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await recurringAPI.getAll();
      setItems(res.data.data);
    } catch { toast.error('Failed to load recurring items'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      title: item.title, amount: item.amount, type: item.type,
      category: item.category, frequency: item.frequency,
      startDate: item.startDate?.split('T')[0] || '',
      endDate: item.endDate?.split('T')[0] || '',
      paymentMethod: item.paymentMethod || 'Auto',
      description: item.description || '',
      nextDueDate: item.nextDueDate?.split('T')[0] || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount) return toast.error('Title and amount required');
    setSaving(true);
    try {
      const payload = { ...form, amount: parseFloat(form.amount) };
      if (editItem) {
        await recurringAPI.update(editItem._id, payload);
        toast.success('Updated');
      } else {
        await recurringAPI.create(payload);
        toast.success('Recurring transaction created');
      }
      setShowModal(false);
      load();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this recurring transaction?')) return;
    try {
      await recurringAPI.delete(id);
      toast.success('Deleted');
      load();
    } catch { toast.error('Delete failed'); }
  };

  const toggleActive = async (item) => {
    try {
      await recurringAPI.update(item._id, { isActive: !item.isActive });
      toast.success(item.isActive ? 'Paused' : 'Resumed');
      load();
    } catch { toast.error('Failed to update'); }
  };

  const totalMonthlyExpense = items.filter(i => i.type === 'expense' && i.isActive).reduce((sum, i) => {
    const factors = { daily: 30, weekly: 4.3, biweekly: 2.15, monthly: 1, quarterly: 1/3, yearly: 1/12 };
    return sum + i.amount * (factors[i.frequency] || 1);
  }, 0);

  const totalMonthlyIncome = items.filter(i => i.type === 'income' && i.isActive).reduce((sum, i) => {
    const factors = { daily: 30, weekly: 4.3, biweekly: 2.15, monthly: 1, quarterly: 1/3, yearly: 1/12 };
    return sum + i.amount * (factors[i.frequency] || 1);
  }, 0);

  const getDueSoon = (nextDueDate) => {
    const diff = new Date(nextDueDate) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return { text: 'Overdue', color: 'var(--accent-red)', urgent: true };
    if (days === 0) return { text: 'Due today', color: 'var(--accent-red)', urgent: true };
    if (days <= 3) return { text: `${days}d`, color: 'var(--accent-amber)', urgent: true };
    if (days <= 7) return { text: `${days}d`, color: 'var(--accent-amber)', urgent: false };
    return { text: `${days}d`, color: 'var(--text-muted)', urgent: false };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.4s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Recurring</h1>
          <p className="page-subtitle">Subscriptions, bills & automatic transactions</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openAdd}><Plus size={15} /> Add Recurring</button>
      </div>

      {/* Summary cards */}
      {items.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="recurring-summary">
          {[
            { label: 'Monthly Outflow', value: formatCurrency(totalMonthlyExpense), color: 'var(--accent-red)' },
            { label: 'Monthly Inflow', value: formatCurrency(totalMonthlyIncome), color: 'var(--accent-green)' },
            { label: 'Net Monthly', value: formatCurrency(totalMonthlyIncome - totalMonthlyExpense), color: totalMonthlyIncome >= totalMonthlyExpense ? 'var(--accent-green)' : 'var(--accent-red)' },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ color: s.color, fontSize: '1.4rem' }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>Estimated</div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 14 }} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="card"><div className="empty-state">
          <div className="empty-state-icon">🔄</div>
          <div className="empty-state-title">No recurring transactions</div>
          <div className="empty-state-desc">Add recurring bills, subscriptions, or income</div>
          <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={openAdd}><Plus size={14} /> Add Recurring</button>
        </div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map(item => {
            const due = getDueSoon(item.nextDueDate);
            return (
              <div key={item._id} className="card" style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                opacity: item.isActive ? 1 : 0.6,
                borderColor: due.urgent && item.isActive ? 'rgba(255,94,125,0.25)' : 'var(--border-card)',
                transition: 'all 0.2s',
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                  background: item.type === 'income' ? 'rgba(34,211,165,0.12)' : 'rgba(124,92,252,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <RefreshCw size={18} color={item.type === 'income' ? 'var(--accent-green)' : 'var(--accent-primary)'} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.title}</span>
                    <span className={`badge ${item.type === 'income' ? 'badge-income' : 'badge-expense'}`} style={{ fontSize: '0.68rem' }}>
                      {FREQ_LABELS[item.frequency]}
                    </span>
                    {!item.isActive && <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 7px', borderRadius: 99 }}>Paused</span>}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <span>{item.category}</span>
                    {item.nextDueDate && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Calendar size={11} />
                        Next: {new Date(item.nextDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        <span style={{ color: due.color, fontWeight: 500, marginLeft: 2 }}>({due.text})</span>
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{
                    fontWeight: 800,
                    fontFamily: 'var(--font-display)',
                    color: item.type === 'income' ? 'var(--accent-green)' : 'var(--accent-red)',
                    fontSize: '1rem',
                  }}>
                    {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>per {item.frequency.replace('bi', 'bi-')}</div>
                </div>

                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button onClick={() => toggleActive(item)} className="btn btn-ghost btn-icon" style={{ padding: 6 }}
                    title={item.isActive ? 'Pause' : 'Resume'}>
                    {item.isActive ? <ToggleRight size={18} color="var(--accent-green)" /> : <ToggleLeft size={18} color="var(--text-muted)" />}
                  </button>
                  <button className="btn btn-ghost btn-icon" onClick={() => openEdit(item)} style={{ padding: 6 }}>
                    <Edit2 size={14} color="var(--text-muted)" />
                  </button>
                  <button className="btn btn-ghost btn-icon" onClick={() => handleDelete(item._id)} style={{ padding: 6 }}>
                    <Trash2 size={14} color="var(--accent-red)" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h3 className="modal-title">{editItem ? 'Edit Recurring' : 'Add Recurring Transaction'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                {['expense','income'].map(t => (
                  <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))} style={{
                    flex: 1, padding: '9px', borderRadius: 10, fontWeight: 600, fontSize: '0.875rem',
                    border: `1px solid ${form.type === t ? (t === 'income' ? 'var(--accent-green)' : 'var(--accent-red)') : 'var(--border-card)'}`,
                    background: form.type === t ? (t === 'income' ? 'rgba(34,211,165,0.1)' : 'rgba(255,94,125,0.1)') : 'transparent',
                    color: form.type === t ? (t === 'income' ? 'var(--accent-green)' : 'var(--accent-red)') : 'var(--text-muted)',
                  }}>
                    {t === 'expense' ? '💸 Expense' : '💰 Income'}
                  </button>
                ))}
              </div>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" placeholder="Netflix, Rent, Salary..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Amount *</label>
                  <input type="number" className="form-input" placeholder="0.00" min="0.01" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Frequency</label>
                  <select className="form-select" value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}>
                    {FREQUENCIES.map(fr => <option key={fr} value={fr}>{FREQ_LABELS[fr]}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <input className="form-input" placeholder="Auto / UPI" value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Start Date *</label>
                  <input type="date" className="form-input" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Next Due Date *</label>
                  <input type="date" className="form-input" value={form.nextDueDate} onChange={e => setForm(f => ({ ...f, nextDueDate: e.target.value }))} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">End Date (optional)</label>
                <input type="date" className="form-input" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <div className="spinner" /> : editItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) { .recurring-summary { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
