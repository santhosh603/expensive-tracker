import React, { useState, useEffect, useCallback } from 'react';
import { goalAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, X, Trash2, Edit2, Target, CheckCircle, PlusCircle } from 'lucide-react';

const GOAL_CATEGORIES = ['Emergency Fund','Vacation','Home','Car','Education','Retirement','Wedding','Technology','Business','Other'];
const GOAL_ICONS = { 'Emergency Fund':'🛡️','Vacation':'🏖️','Home':'🏠','Car':'🚗','Education':'📚','Retirement':'🧓','Wedding':'💍','Technology':'💻','Business':'🏢','Other':'🎯' };
const COLORS = ['#7c5cfc','#22d3a5','#ff5e7d','#f59e0b','#3b82f6','#ec4899','#10b981','#8b5cf6'];

const EMPTY_FORM = {
  title: '', description: '', targetAmount: '', currentAmount: '0',
  targetDate: '', category: 'Other', priority: 'medium', color: '#7c5cfc',
};

export default function Goals() {
  const { formatCurrency } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showContribute, setShowContribute] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [contributeAmount, setContributeAmount] = useState('');
  const [contributeNote, setContributeNote] = useState('');
  const [saving, setSaving] = useState(false);

  const loadGoals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await goalAPI.getAll();
      setGoals(res.data.data);
    } catch { toast.error('Failed to load goals'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadGoals(); }, [loadGoals]);

  const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (g) => {
    setEditItem(g);
    setForm({
      title: g.title, description: g.description || '', targetAmount: g.targetAmount,
      currentAmount: g.currentAmount, targetDate: g.targetDate?.split('T')[0] || '',
      category: g.category, priority: g.priority, color: g.color,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        targetAmount: parseFloat(form.targetAmount),
        currentAmount: parseFloat(form.currentAmount || 0),
        icon: GOAL_ICONS[form.category] || '🎯',
      };
      if (editItem) {
        await goalAPI.update(editItem._id, payload);
        toast.success('Goal updated');
      } else {
        await goalAPI.create(payload);
        toast.success('Goal created 🎯');
      }
      setShowModal(false);
      loadGoals();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to save goal');
    } finally { setSaving(false); }
  };

  const handleContribute = async () => {
    if (!contributeAmount || parseFloat(contributeAmount) <= 0) return toast.error('Enter valid amount');
    try {
      await goalAPI.contribute(showContribute._id, { amount: parseFloat(contributeAmount), note: contributeNote });
      toast.success(`${formatCurrency(contributeAmount)} added to goal! 💰`);
      setShowContribute(null);
      setContributeAmount('');
      setContributeNote('');
      loadGoals();
    } catch { toast.error('Contribution failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    try {
      await goalAPI.delete(id);
      toast.success('Goal deleted');
      loadGoals();
    } catch { toast.error('Delete failed'); }
  };

  const getDaysLeft = (targetDate) => {
    const diff = new Date(targetDate) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return { text: 'Overdue', color: 'var(--accent-red)' };
    if (days === 0) return { text: 'Due today', color: 'var(--accent-amber)' };
    if (days <= 30) return { text: `${days}d left`, color: 'var(--accent-amber)' };
    return { text: `${Math.ceil(days / 30)}mo left`, color: 'var(--text-muted)' };
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');
  const totalSaved = activeGoals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = activeGoals.reduce((s, g) => s + g.targetAmount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.4s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Savings Goals</h1>
          <p className="page-subtitle">{activeGoals.length} active goals · {completedGoals.length} completed</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openAdd}><Plus size={15} /> New Goal</button>
      </div>

      {/* Summary */}
      {goals.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="goals-summary">
          {[
            { label: 'Total Saved', value: formatCurrency(totalSaved), color: 'var(--accent-green)' },
            { label: 'Total Target', value: formatCurrency(totalTarget), color: 'var(--accent-primary)' },
            { label: 'Goals Achieved', value: completedGoals.length, color: 'var(--accent-amber)' },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ color: s.color, fontSize: '1.5rem' }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 220, borderRadius: 18 }} />)}
        </div>
      ) : goals.length === 0 ? (
        <div className="card"><div className="empty-state">
          <div className="empty-state-icon">🎯</div>
          <div className="empty-state-title">No goals yet</div>
          <div className="empty-state-desc">Create savings goals to track your financial targets</div>
          <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={openAdd}><Plus size={14} /> Create Your First Goal</button>
        </div></div>
      ) : (
        <>
          {activeGoals.length > 0 && (
            <>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-secondary)' }}>Active Goals</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 16 }}>
                {activeGoals.map(goal => {
                  const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                  const daysLeft = goal.targetDate ? getDaysLeft(goal.targetDate) : null;
                  return (
                    <div key={goal._id} className="card" style={{
                      borderTop: `3px solid ${goal.color}`,
                      position: 'relative', overflow: 'hidden',
                    }}>
                      <div style={{
                        position: 'absolute', top: -30, right: -30, width: 100, height: 100,
                        borderRadius: '50%', background: `${goal.color}12`, pointerEvents: 'none',
                      }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>{goal.icon || '🎯'}</span>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{goal.title}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{goal.category}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 3 }}>
                          <button className="btn btn-ghost btn-icon" onClick={() => openEdit(goal)} style={{ padding: 5 }}>
                            <Edit2 size={13} color="var(--text-muted)" />
                          </button>
                          <button className="btn btn-ghost btn-icon" onClick={() => handleDelete(goal._id)} style={{ padding: 5 }}>
                            <Trash2 size={13} color="var(--accent-red)" />
                          </button>
                        </div>
                      </div>

                      <div style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{formatCurrency(goal.currentAmount)} saved</span>
                          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', color: goal.color }}>{pct}%</span>
                        </div>
                        <div className="progress-bar" style={{ height: 8 }}>
                          <div className="progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${goal.color}, ${goal.color}bb)` }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Target: {formatCurrency(goal.targetAmount)}</span>
                          {daysLeft && <span style={{ fontSize: '0.72rem', color: daysLeft.color }}>{daysLeft.text}</span>}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 600,
                          background: goal.priority === 'high' ? 'rgba(255,94,125,0.12)' : goal.priority === 'medium' ? 'rgba(251,191,36,0.12)' : 'rgba(34,211,165,0.12)',
                          color: goal.priority === 'high' ? 'var(--accent-red)' : goal.priority === 'medium' ? 'var(--accent-amber)' : 'var(--accent-green)',
                        }}>{goal.priority} priority</span>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => setShowContribute(goal)}
                          style={{ gap: 5 }}
                        >
                          <PlusCircle size={13} /> Add Funds
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {completedGoals.length > 0 && (
            <>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-secondary)', marginTop: 8 }}>Completed Goals 🎉</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {completedGoals.map(goal => (
                  <div key={goal._id} className="card" style={{ opacity: 0.75, borderColor: 'rgba(34,211,165,0.2)' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontSize: '1.4rem' }}>{goal.icon || '🎯'}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                          {goal.title}
                          <CheckCircle size={14} color="var(--accent-green)" />
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--accent-green)' }}>Completed! {formatCurrency(goal.currentAmount)} saved</div>
                      </div>
                      <button className="btn btn-ghost btn-icon" onClick={() => handleDelete(goal._id)} style={{ padding: 5 }}>
                        <Trash2 size={13} color="var(--accent-red)" />
                      </button>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: '100%', background: 'var(--accent-green)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h3 className="modal-title">{editItem ? 'Edit Goal' : 'Create Savings Goal'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Goal Title *</label>
                <input className="form-input" placeholder="e.g. Emergency Fund" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Target Amount *</label>
                  <input type="number" className="form-input" placeholder="100000" min="1" value={form.targetAmount} onChange={e => setForm(f => ({ ...f, targetAmount: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Already Saved</label>
                  <input type="number" className="form-input" placeholder="0" min="0" value={form.currentAmount} onChange={e => setForm(f => ({ ...f, currentAmount: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Target Date *</label>
                  <input type="date" className="form-input" value={form.targetDate} onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {GOAL_CATEGORIES.map(c => <option key={c} value={c}>{GOAL_ICONS[c]} {c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select className="form-select" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input className="form-input" placeholder="Why is this goal important?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Color</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {COLORS.map(c => (
                    <div key={c} onClick={() => setForm(f => ({ ...f, color: c }))} style={{
                      width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer',
                      border: form.color === c ? '2px solid white' : '2px solid transparent',
                      transform: form.color === c ? 'scale(1.2)' : 'scale(1)',
                      transition: 'all 0.15s',
                    }} />
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <div className="spinner" /> : editItem ? 'Update Goal' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contribute Modal */}
      {showContribute && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowContribute(null)}>
          <div className="modal-box" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3 className="modal-title">Add Funds</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowContribute(null)}><X size={18} /></button>
            </div>
            <div style={{ marginBottom: 20, padding: '12px 14px', background: 'rgba(124,92,252,0.07)', borderRadius: 10, border: '1px solid rgba(124,92,252,0.15)' }}>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{showContribute.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {formatCurrency(showContribute.currentAmount)} / {formatCurrency(showContribute.targetAmount)}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Contribution Amount *</label>
                <input type="number" className="form-input" placeholder="1000" min="1" value={contributeAmount} onChange={e => setContributeAmount(e.target.value)} autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Note (optional)</label>
                <input className="form-input" placeholder="Monthly savings" value={contributeNote} onChange={e => setContributeNote(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setShowContribute(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleContribute}>
                  <PlusCircle size={15} /> Add Funds
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) { .goals-summary { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
