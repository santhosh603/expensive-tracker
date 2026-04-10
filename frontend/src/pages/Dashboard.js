import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsAPI, expenseAPI, goalAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, TrendingDown, Wallet, Target, ArrowRight, Plus, AlertCircle } from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler);

const CATEGORY_COLORS = {
  'Food & Dining': '#f59e0b','Transportation': '#3b82f6','Shopping': '#ec4899',
  'Entertainment': '#8b5cf6','Bills & Utilities': '#f97316','Healthcare': '#ef4444',
  'Education': '#06b6d4','Travel': '#10b981','Housing': '#84cc16',
  'Personal Care': '#f43f5e','Investments': '#22c55e','Salary': '#22c55e',
  'Freelance': '#a855f7','Business': '#0ea5e9','Gift': '#f472b6','Other': '#94a3b8',
};

export default function Dashboard() {
  const { formatCurrency, user } = useAuth();
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [trend, setTrend] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [ov, tr, cat, recent, gl] = await Promise.all([
        analyticsAPI.getOverview(),
        analyticsAPI.getTrend({ months: 6 }),
        analyticsAPI.getCategoryBreakdown(),
        expenseAPI.getAll({ limit: 5, sortBy: 'date', sortOrder: 'desc' }),
        goalAPI.getAll(),
      ]);
      setOverview(ov.data.data);
      setTrend(tr.data.data);
      setCategoryData(cat.data.data);
      setRecentExpenses(recent.data.data);
      setGoals(gl.data.data.slice(0, 3));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Build trend chart data
  const buildTrendChart = () => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const now = new Date();
    const labels = [];
    const incomeData = [];
    const expenseData = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(months[d.getMonth()]);
      const y = d.getFullYear(), m = d.getMonth() + 1;
      const incEntry = trend.find(t => t._id.year === y && t._id.month === m && t._id.type === 'income');
      const expEntry = trend.find(t => t._id.year === y && t._id.month === m && t._id.type === 'expense');
      incomeData.push(incEntry?.total || 0);
      expenseData.push(expEntry?.total || 0);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          borderColor: '#22d3a5',
          backgroundColor: 'rgba(34,211,165,0.08)',
          borderWidth: 2.5,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#22d3a5',
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: 'Expenses',
          data: expenseData,
          borderColor: '#ff5e7d',
          backgroundColor: 'rgba(255,94,125,0.08)',
          borderWidth: 2.5,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#ff5e7d',
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  };

  const buildDoughnutData = () => ({
    labels: categoryData.slice(0, 6).map(c => c._id),
    datasets: [{
      data: categoryData.slice(0, 6).map(c => c.total),
      backgroundColor: categoryData.slice(0, 6).map(c => CATEGORY_COLORS[c._id] || '#94a3b8'),
      borderWidth: 0,
      hoverOffset: 6,
    }],
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a1a40',
        titleColor: '#f0eeff',
        bodyColor: '#9b9bc8',
        borderColor: 'rgba(124,92,252,0.3)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => ` ${formatCurrency(ctx.raw)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#5a5a8a', font: { size: 11 } },
        border: { display: false },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#5a5a8a', font: { size: 11 }, callback: v => formatCurrency(v) },
        border: { display: false },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a1a40',
        titleColor: '#f0eeff',
        bodyColor: '#9b9bc8',
        borderColor: 'rgba(124,92,252,0.3)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => ` ${formatCurrency(ctx.raw)} (${categoryData[ctx.dataIndex]?.percentage}%)`,
        },
      },
    },
    cutout: '72%',
  };

  const curMonth = overview?.currentMonth || {};
  const lastMonth = overview?.lastMonth || {};
  const savings = (curMonth.income || 0) - (curMonth.expense || 0);
  const savingsRate = curMonth.income > 0 ? Math.round((savings / curMonth.income) * 100) : 0;

  const expChangePct = lastMonth.expense > 0
    ? Math.round(((curMonth.expense - lastMonth.expense) / lastMonth.expense) * 100)
    : 0;

  if (loading) {
    return (
      <div style={{ display: 'grid', gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 110, borderRadius: 18 }} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
          <div className="skeleton" style={{ height: 280, borderRadius: 18 }} />
          <div className="skeleton" style={{ height: 280, borderRadius: 18 }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.4s ease' }}>
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }} className="kpi-grid">
        {[
          {
            label: 'Monthly Expenses',
            value: formatCurrency(curMonth.expense || 0),
            change: expChangePct !== 0 ? `${expChangePct > 0 ? '+' : ''}${expChangePct}% vs last month` : 'No change',
            positive: expChangePct <= 0,
            icon: <TrendingDown size={20} />,
            color: '#ff5e7d',
            bg: 'rgba(255,94,125,0.08)',
          },
          {
            label: 'Monthly Income',
            value: formatCurrency(curMonth.income || 0),
            change: 'This month',
            positive: true,
            icon: <TrendingUp size={20} />,
            color: '#22d3a5',
            bg: 'rgba(34,211,165,0.08)',
          },
          {
            label: 'Net Savings',
            value: formatCurrency(Math.abs(savings)),
            change: savings >= 0 ? `${savingsRate}% savings rate` : 'Overspent this month',
            positive: savings >= 0,
            icon: <Wallet size={20} />,
            color: savings >= 0 ? '#22d3a5' : '#ff5e7d',
            bg: savings >= 0 ? 'rgba(34,211,165,0.08)' : 'rgba(255,94,125,0.08)',
          },
          {
            label: 'Active Goals',
            value: goals.filter(g => g.status === 'active').length || goals.length || '0',
            change: 'Goals in progress',
            positive: true,
            icon: <Target size={20} />,
            color: '#7c5cfc',
            bg: 'rgba(124,92,252,0.08)',
          },
        ].map((stat, i) => (
          <div key={i} className="stat-card" style={{ animationDelay: `${i * 60}ms` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-value" style={{ color: stat.color, marginTop: 8 }}>{stat.value}</div>
              </div>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: stat.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: stat.color,
              }}>{stat.icon}</div>
            </div>
            <div className={`stat-change ${stat.positive ? 'positive' : 'negative'}`}>
              {stat.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }} className="charts-grid">
        {/* Line chart */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>
                Income vs Expenses
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 2 }}>Last 6 months</div>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              {[['#22d3a5','Income'],['#ff5e7d','Expenses']].map(([c,l]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ height: 220 }}>
            {trend.length > 0 ? (
              <Line data={buildTrendChart()} options={chartOptions} />
            ) : (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <div className="empty-state-icon">📈</div>
                <div className="empty-state-title">No data yet</div>
                <div className="empty-state-desc">Add transactions to see your trend</div>
              </div>
            )}
          </div>
        </div>

        {/* Doughnut chart */}
        <div className="card">
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>
            Spending by Category
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: 16 }}>This month</div>

          {categoryData.length > 0 ? (
            <>
              <div style={{ height: 160, position: 'relative' }}>
                <Doughnut data={buildDoughnutData()} options={doughnutOptions} />
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex',
                  flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  pointerEvents: 'none',
                }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                    {formatCurrency(curMonth.expense || 0)}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 16 }}>
                {categoryData.slice(0, 5).map((c, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: CATEGORY_COLORS[c._id] || '#94a3b8', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{c._id}</span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', flexShrink: 0 }}>{c.percentage}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🍩</div>
              <div className="empty-state-title">No expenses yet</div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="bottom-grid">
        {/* Recent transactions */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Recent Transactions</div>
            <button
              onClick={() => navigate('/expenses')}
              className="btn btn-ghost btn-sm"
              style={{ gap: 4, color: 'var(--accent-primary)' }}
            >
              View all <ArrowRight size={13} />
            </button>
          </div>

          {recentExpenses.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {recentExpenses.map(exp => (
                <div key={exp._id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 10px',
                  borderRadius: 10,
                  transition: 'background 0.15s',
                  cursor: 'default',
                }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 9,
                      background: `${CATEGORY_COLORS[exp.category]}22`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1rem', flexShrink: 0,
                    }}>
                      {getCategoryEmoji(exp.category)}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{exp.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {exp.category} · {new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  </div>
                  <span style={{
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: exp.type === 'income' ? 'var(--accent-green)' : 'var(--accent-red)',
                  }}>
                    {exp.type === 'income' ? '+' : '-'}{formatCurrency(exp.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="empty-state-icon">💳</div>
              <div className="empty-state-title">No transactions yet</div>
              <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => navigate('/expenses')}>
                <Plus size={14} /> Add your first
              </button>
            </div>
          )}
        </div>

        {/* Goals progress */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Savings Goals</div>
            <button
              onClick={() => navigate('/goals')}
              className="btn btn-ghost btn-sm"
              style={{ gap: 4, color: 'var(--accent-primary)' }}
            >
              View all <ArrowRight size={13} />
            </button>
          </div>

          {goals.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {goals.map(goal => {
                const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                return (
                  <div key={goal._id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ fontSize: '1.1rem' }}>{goal.icon || '🎯'}</span>
                        <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{goal.title}</span>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{pct}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, ${goal.color || '#7c5cfc'}, ${goal.color || '#5b8af7'})`,
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{formatCurrency(goal.currentAmount)} saved</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Goal: {formatCurrency(goal.targetAmount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="empty-state-icon">🎯</div>
              <div className="empty-state-title">No goals set</div>
              <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => navigate('/goals')}>
                <Plus size={14} /> Create a goal
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 1200px) {
          .kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 900px) {
          .charts-grid { grid-template-columns: 1fr !important; }
          .bottom-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .kpi-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function getCategoryEmoji(category) {
  const map = {
    'Food & Dining': '🍽️','Transportation': '🚗','Shopping': '🛍️','Entertainment': '🎬',
    'Bills & Utilities': '💡','Healthcare': '🏥','Education': '📚','Travel': '✈️',
    'Housing': '🏠','Personal Care': '💆','Investments': '📈','Salary': '💼',
    'Freelance': '💻','Business': '🏢','Gift': '🎁','Other': '📦',
  };
  return map[category] || '💰';
}
