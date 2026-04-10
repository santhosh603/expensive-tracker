import React, { useState, useEffect, useCallback } from 'react';
import { expenseAPI, categoryAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Plus, Search, Filter, Trash2, Edit2, X, Download,
  ChevronLeft, ChevronRight, SlidersHorizontal, Check
} from 'lucide-react';

const CATEGORIES = [
  'Food & Dining','Transportation','Shopping','Entertainment','Bills & Utilities',
  'Healthcare','Education','Travel','Housing','Personal Care','Investments',
  'Salary','Freelance','Business','Gift','Other'
];

const PAYMENT_METHODS = ['Cash','Credit Card','Debit Card','UPI','Net Banking','Wallet','Cheque','Other'];

const CATEGORY_EMOJI = {
  'Food & Dining':'🍽️','Transportation':'🚗','Shopping':'🛍️','Entertainment':'🎬',
  'Bills & Utilities':'💡','Healthcare':'🏥','Education':'📚','Travel':'✈️',
  'Housing':'🏠','Personal Care':'💆','Investments':'📈','Salary':'💼',
  'Freelance':'💻','Business':'🏢','Gift':'🎁','Other':'📦',
};

const EMPTY_FORM = {
  title: '', amount: '', type: 'expense', category: 'Food & Dining',
  date: new Date().toISOString().split('T')[0],
  paymentMethod: 'Cash', description: '', merchant: '', location: '', tags: '',
};

export default function Expenses() {
  const { formatCurrency } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '', type: '', category: '', paymentMethod: '',
    startDate: '', endDate: '', minAmount: '', maxAmount: '',
    page: 1, limit: 15, sortBy: 'date', sortOrder: 'desc',
  });

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await expenseAPI.getAll(params);
      setExpenses(res.data.data);
      setPagination(res.data.pagination);
    } catch (e) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadExpenses(); }, [loadExpenses]);

  const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (exp) => {
    setEditItem(exp);
    setForm({
      title: exp.title, amount: exp.amount, type: exp.type,
      category: exp.category, date: exp.date?.split('T')[0] || '',
      paymentMethod: exp.paymentMethod || 'Cash',
      description: exp.description || '', merchant: exp.merchant || '',
      location: exp.location || '', tags: exp.tags?.join(', ') || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount) return toast.error('Title and amount required');
    setFormLoading(true);
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };
      if (editItem) {
        await expenseAPI.update(editItem._id, payload);
        toast.success('Transaction updated');
      } else {
        await expenseAPI.create(payload);
        toast.success('Transaction added ✅');
      }
      setShowModal(false);
      loadExpenses();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to save transaction');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await expenseAPI.delete(id);
      toast.success('Deleted');
      loadExpenses();
    } catch { toast.error('Delete failed'); }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selected.length} transactions?`)) return;
    try {
      await expenseAPI.bulkDelete(selected);
      toast.success(`${selected.length} deleted`);
      setSelected([]);
      loadExpenses();
    } catch { toast.error('Bulk delete failed'); }
  };

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleSelectAll = () => setSelected(s => s.length === expenses.length ? [] : expenses.map(e => e._id));

  const setPage = (p) => setFilters(f => ({ ...f, page: p }));

  const exportCSV = () => {
    const headers = ['Title','Amount','Type','Category','Date','Payment Method','Description'];
    const rows = expenses.map(e => [
      e.title, e.amount, e.type, e.category,
      new Date(e.date).toLocaleDateString(), e.paymentMethod, e.description || ''
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'transactions.csv'; a.click();
    toast.success('CSV exported');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.4s ease' }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">{pagination.total} total transactions</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {selected.length > 0 && (
            <button className="btn btn-danger btn-sm" onClick={handleBulkDelete}>
              <Trash2 size={14} /> Delete ({selected.length})
            </button>
          )}
          <button className="btn btn-ghost btn-sm" onClick={exportCSV}>
            <Download size={14} /> Export
          </button>
          <button
            className={`btn btn-sm ${showFilters ? 'btn-secondary' : 'btn-ghost'}`}
            onClick={() => setShowFilters(f => !f)}
          >
            <SlidersHorizontal size={14} /> Filters
          </button>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>
            <Plus size={15} /> Add Transaction
          </button>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', pointerEvents: 'none',
          }} />
          <input
            className="form-input"
            placeholder="Search transactions..."
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
            style={{ paddingLeft: 36 }}
          />
        </div>
        <select className="form-select" value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value, page: 1 }))} style={{ width: 'auto' }}>
          <option value="">All Types</option>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <select className="form-select" value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value, page: 1 }))} style={{ width: 'auto' }}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Extended filters */}
      {showFilters && (
        <div className="card" style={{ padding: '16px 20px', animation: 'slideUp 0.3s ease' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select className="form-select" value={filters.paymentMethod} onChange={e => setFilters(f => ({ ...f, paymentMethod: e.target.value }))}>
                <option value="">All</option>
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input type="date" className="form-input" value={filters.startDate} onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input type="date" className="form-input" value={filters.endDate} onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Min Amount</label>
              <input type="number" className="form-input" placeholder="0" value={filters.minAmount} onChange={e => setFilters(f => ({ ...f, minAmount: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Max Amount</label>
              <input type="number" className="form-input" placeholder="Any" value={filters.maxAmount} onChange={e => setFilters(f => ({ ...f, maxAmount: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Sort By</label>
              <select className="form-select" value={filters.sortBy} onChange={e => setFilters(f => ({ ...f, sortBy: e.target.value }))}>
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="title">Title</option>
              </select>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={() => setFilters({ search: '', type: '', category: '', paymentMethod: '', startDate: '', endDate: '', minAmount: '', maxAmount: '', page: 1, limit: 15, sortBy: 'date', sortOrder: 'desc' })}>
            Clear filters
          </button>
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 52, borderRadius: 10 }} />)}
          </div>
        ) : expenses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💳</div>
            <div className="empty-state-title">No transactions found</div>
            <div className="empty-state-desc">Add a transaction or change your filters</div>
            <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={openAdd}>
              <Plus size={14} /> Add Transaction
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 40, paddingLeft: 20 }}>
                    <input type="checkbox" checked={selected.length === expenses.length && expenses.length > 0} onChange={toggleSelectAll} style={{ accentColor: 'var(--accent-primary)', cursor: 'pointer' }} />
                  </th>
                  <th>Transaction</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Payment</th>
                  <th>Amount</th>
                  <th style={{ width: 80 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(exp => (
                  <tr key={exp._id} style={{ opacity: selected.includes(exp._id) ? 0.7 : 1 }}>
                    <td style={{ paddingLeft: 20 }}>
                      <input type="checkbox" checked={selected.includes(exp._id)} onChange={() => toggleSelect(exp._id)} style={{ accentColor: 'var(--accent-primary)', cursor: 'pointer' }} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                          background: exp.type === 'income' ? 'rgba(34,211,165,0.12)' : 'rgba(255,94,125,0.12)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
                        }}>
                          {CATEGORY_EMOJI[exp.category] || '💰'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{exp.title}</div>
                          {exp.merchant && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{exp.merchant}</div>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${exp.type === 'income' ? 'badge-income' : 'badge-expense'}`} style={{ fontSize: '0.72rem' }}>
                        {exp.category}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                      {new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{exp.paymentMethod}</td>
                    <td>
                      <span style={{
                        fontWeight: 700, fontSize: '0.9rem',
                        color: exp.type === 'income' ? 'var(--accent-green)' : 'var(--accent-red)',
                      }}>
                        {exp.type === 'income' ? '+' : '-'}{formatCurrency(exp.amount)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(exp)} style={{ padding: 6 }}>
                          <Edit2 size={14} color="var(--text-secondary)" />
                        </button>
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => handleDelete(exp._id)} style={{ padding: 6 }}>
                          <Trash2 size={14} color="var(--accent-red)" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 20px', borderTop: '1px solid var(--border-card)',
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {((pagination.page - 1) * filters.limit) + 1}–{Math.min(pagination.page * filters.limit, pagination.total)} of {pagination.total}
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setPage(pagination.page - 1)} disabled={pagination.page === 1}>
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                let p;
                if (pagination.pages <= 5) p = i + 1;
                else if (pagination.page <= 3) p = i + 1;
                else if (pagination.page >= pagination.pages - 2) p = pagination.pages - 4 + i;
                else p = pagination.page - 2 + i;
                return (
                  <button
                    key={p}
                    className={`btn btn-sm ${p === pagination.page ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setPage(p)}
                    style={{ minWidth: 34, padding: '7px 10px' }}
                  >{p}</button>
                );
              })}
              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setPage(pagination.page + 1)} disabled={pagination.page === pagination.pages}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h3 className="modal-title">{editItem ? 'Edit Transaction' : 'Add Transaction'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Type toggle */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                {['expense','income'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, type: t }))}
                    style={{
                      flex: 1, padding: '10px', borderRadius: 10,
                      fontWeight: 600, fontSize: '0.875rem',
                      border: `1px solid ${form.type === t ? (t === 'income' ? 'var(--accent-green)' : 'var(--accent-red)') : 'var(--border-card)'}`,
                      background: form.type === t ? (t === 'income' ? 'rgba(34,211,165,0.12)' : 'rgba(255,94,125,0.12)') : 'transparent',
                      color: form.type === t ? (t === 'income' ? 'var(--accent-green)' : 'var(--accent-red)') : 'var(--text-muted)',
                      transition: 'all 0.15s',
                    }}
                  >
                    {t === 'expense' ? '💸 Expense' : '💰 Income'}
                  </button>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Title *</label>
                  <input className="form-input" placeholder="e.g. Lunch at restaurant" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Amount *</label>
                  <input type="number" className="form-input" placeholder="0.00" step="0.01" min="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input type="date" className="form-input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_EMOJI[c]} {c}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select className="form-select" value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}>
                    {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Merchant</label>
                  <input className="form-input" placeholder="Store / Merchant name" value={form.merchant} onChange={e => setForm(f => ({ ...f, merchant: e.target.value }))} />
                </div>

                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input className="form-input" placeholder="City, Place" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Description</label>
                  <input className="form-input" placeholder="Add a note..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Tags (comma separated)</label>
                  <input className="form-input" placeholder="food, work, personal" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? <div className="spinner" /> : (editItem ? 'Update Transaction' : 'Add Transaction')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
