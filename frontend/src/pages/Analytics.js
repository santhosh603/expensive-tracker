import React, { useState, useEffect, useCallback } from 'react';
import { analyticsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

const CATEGORY_COLORS = {
  'Food & Dining':'#f59e0b','Transportation':'#3b82f6','Shopping':'#ec4899',
  'Entertainment':'#8b5cf6','Bills & Utilities':'#f97316','Healthcare':'#ef4444',
  'Education':'#06b6d4','Travel':'#10b981','Housing':'#84cc16',
  'Personal Care':'#f43f5e','Investments':'#22c55e','Salary':'#22c55e',
  'Freelance':'#a855f7','Business':'#0ea5e9','Gift':'#f472b6','Other':'#94a3b8',
};

export default function Analytics() {
  const { formatCurrency } = useAuth();
  const [overview, setOverview] = useState(null);
  const [trend, setTrend] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [topExpenses, setTopExpenses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [daily, setDaily] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [trendPeriod, setTrendPeriod] = useState(6);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ov, tr, cat, top, pm, day] = await Promise.all([
        analyticsAPI.getOverview(),
        analyticsAPI.getTrend({ months: trendPeriod }),
        analyticsAPI.getCategoryBreakdown(),
        analyticsAPI.getTopExpenses({ limit: 8 }),
        analyticsAPI.getPaymentMethods(),
        analyticsAPI.getDaily(),
      ]);
      setOverview(ov.data.data);
      setTrend(tr.data.data);
      setCategoryBreakdown(cat.data.data);
      setTopExpenses(top.data.data);
      setPaymentMethods(pm.data.data);
      setDaily(day.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [trendPeriod]);

  useEffect(() => { loadData(); }, [loadData]);

  const tooltipStyle = {
    backgroundColor: '#1a1a40',
    titleColor: '#f0eeff',
    bodyColor: '#9b9bc8',
    borderColor: 'rgba(124,92,252,0.3)',
    borderWidth: 1,
    padding: 10,
    cornerRadius: 8,
  };

  const buildTrendData = () => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const now = new Date();
    const labels = [];
    const incomeData = [];
    const expenseData = [];
    for (let i = trendPeriod - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(months[d.getMonth()]);
      const y = d.getFullYear(), m = d.getMonth() + 1;
      const inc = trend.find(t => t._id.year === y && t._id.month === m && t._id.type === 'income');
      const exp = trend.find(t => t._id.year === y && t._id.month === m && t._id.type === 'expense');
      incomeData.push(inc?.total || 0);
      expenseData.push(exp?.total || 0);
    }
    return { labels, incomeData, expenseData };
  };

  const buildDailyData = () => {
    const now = new Date();
    const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const labels = Array.from({ length: days }, (_, i) => i + 1);
    const expData = Array(days).fill(0);
    const incData = Array(days).fill(0);
    daily.forEach(d => {
      const idx = d._id.day - 1;
      if (idx >= 0 && idx < days) {
        if (d._id.type === 'expense') expData[idx] = d.total;
        if (d._id.type === 'income') incData[idx] = d.total;
      }
    });
    return { labels, expData, incData };
  };

  const { labels: trendLabels, incomeData, expenseData } = buildTrendData();
  const { labels: dailyLabels, expData, incData } = buildDailyData();

  const chartDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { ...tooltipStyle, callbacks: { label: ctx => ` ${formatCurrency(ctx.raw)}` } },
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#5a5a8a', font: { size: 11 } }, border: { display: false } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#5a5a8a', font: { size: 11 }, callback: v => formatCurrency(v) }, border: { display: false } },
    },
  };

  const curMonth = overview?.currentMonth || {};
  const lastMonth = overview?.lastMonth || {};
  const allTime = overview?.allTime || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.4s ease' }}>
      <div>
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Deep insights into your financial patterns</p>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ width: 'fit-content' }}>
        {['overview','trends','categories','spending'].map(tab => (
          <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'grid', gap: 16 }}>
          {[1,2].map(i => <div key={i} className="skeleton" style={{ height: 280, borderRadius: 18 }} />)}
        </div>
      ) : (
        <>
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* KPI summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="analytics-kpi">
                {[
                  { label: 'This Month Expenses', value: formatCurrency(curMonth.expense || 0), sub: `vs ${formatCurrency(lastMonth.expense || 0)} last month`, color: 'var(--accent-red)' },
                  { label: 'This Month Income', value: formatCurrency(curMonth.income || 0), sub: `${curMonth.count || 0} transactions`, color: 'var(--accent-green)' },
                  { label: 'All Time Expenses', value: formatCurrency(allTime.expense || 0), sub: `${allTime.count || 0} total transactions`, color: 'var(--accent-primary)' },
                ].map((s, i) => (
                  <div key={i} className="stat-card">
                    <div className="stat-label">{s.label}</div>
                    <div className="stat-value" style={{ color: s.color, fontSize: '1.6rem' }}>{s.value}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* Income vs Expense bar */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Income vs Expenses</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Monthly comparison</div>
                  </div>
                  <select className="form-select" value={trendPeriod} onChange={e => setTrendPeriod(parseInt(e.target.value))} style={{ width: 'auto' }}>
                    <option value={3}>Last 3 months</option>
                    <option value={6}>Last 6 months</option>
                    <option value={12}>Last 12 months</option>
                  </select>
                </div>
                <div style={{ height: 260 }}>
                  <Bar
                    data={{
                      labels: trendLabels,
                      datasets: [
                        { label: 'Income', data: incomeData, backgroundColor: 'rgba(34,211,165,0.7)', borderRadius: 6, borderSkipped: false },
                        { label: 'Expenses', data: expenseData, backgroundColor: 'rgba(255,94,125,0.7)', borderRadius: 6, borderSkipped: false },
                      ],
                    }}
                    options={{ ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: true, labels: { color: '#9b9bc8', font: { size: 11 }, boxWidth: 10, boxHeight: 10 } } } }}
                  />
                </div>
              </div>

              {/* Top expenses list */}
              <div className="card">
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16 }}>Top Expenses This Month</div>
                {topExpenses.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {topExpenses.map((exp, i) => (
                      <div key={exp._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 10, background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', width: 16 }}>#{i+1}</span>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{exp.title}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{exp.category}</div>
                          </div>
                        </div>
                        <span style={{ fontWeight: 700, color: 'var(--accent-red)', fontSize: '0.9rem' }}>{formatCurrency(exp.amount)}</span>
                      </div>
                    ))}
                  </div>
                ) : <div className="empty-state" style={{ padding: '30px 0' }}><div className="empty-state-icon">💸</div><div className="empty-state-title">No expenses this month</div></div>}
              </div>
            </div>
          )}

          {activeTab === 'trends' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="card">
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 4 }}>Spending Trend</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: 20 }}>Daily expenses this month</div>
                <div style={{ height: 280 }}>
                  <Line
                    data={{
                      labels: dailyLabels,
                      datasets: [
                        { label: 'Expenses', data: expData, borderColor: '#ff5e7d', backgroundColor: 'rgba(255,94,125,0.08)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 3, pointHoverRadius: 5 },
                        { label: 'Income', data: incData, borderColor: '#22d3a5', backgroundColor: 'rgba(34,211,165,0.08)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 3, pointHoverRadius: 5 },
                      ],
                    }}
                    options={{ ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: true, labels: { color: '#9b9bc8', font: { size: 11 }, boxWidth: 10, boxHeight: 10 } } } }}
                  />
                </div>
              </div>

              <div className="card">
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20 }}>Monthly Trend ({trendPeriod} months)</div>
                <div style={{ height: 240 }}>
                  <Line
                    data={{
                      labels: trendLabels,
                      datasets: [
                        { label: 'Income', data: incomeData, borderColor: '#22d3a5', backgroundColor: 'rgba(34,211,165,0.1)', fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 4, pointHoverRadius: 6 },
                        { label: 'Expenses', data: expenseData, borderColor: '#ff5e7d', backgroundColor: 'rgba(255,94,125,0.1)', fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 4, pointHoverRadius: 6 },
                      ],
                    }}
                    options={{ ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: true, labels: { color: '#9b9bc8', font: { size: 11 } } } } }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="cat-grid">
              <div className="card">
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16 }}>Expense Distribution</div>
                {categoryBreakdown.length > 0 ? (
                  <div style={{ height: 260, position: 'relative' }}>
                    <Doughnut
                      data={{
                        labels: categoryBreakdown.slice(0,8).map(c => c._id),
                        datasets: [{
                          data: categoryBreakdown.slice(0,8).map(c => c.total),
                          backgroundColor: categoryBreakdown.slice(0,8).map(c => CATEGORY_COLORS[c._id] || '#94a3b8'),
                          borderWidth: 0,
                          hoverOffset: 8,
                        }],
                      }}
                      options={{
                        responsive: true, maintainAspectRatio: false,
                        plugins: { legend: { display: false }, tooltip: { ...tooltipStyle, callbacks: { label: ctx => ` ${formatCurrency(ctx.raw)} (${categoryBreakdown[ctx.dataIndex]?.percentage}%)` } } },
                        cutout: '68%',
                      }}
                    />
                  </div>
                ) : <div className="empty-state"><div className="empty-state-icon">🍩</div><div className="empty-state-title">No data</div></div>}
              </div>

              <div className="card">
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16 }}>Category Breakdown</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', maxHeight: 280 }}>
                  {categoryBreakdown.map((c, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: CATEGORY_COLORS[c._id] || '#94a3b8', flexShrink: 0 }} />
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{c._id}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)' }}>{formatCurrency(c.total)}</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 6 }}>{c.percentage}%</span>
                        </div>
                      </div>
                      <div className="progress-bar" style={{ height: 4 }}>
                        <div className="progress-fill" style={{ width: `${c.percentage}%`, background: CATEGORY_COLORS[c._id] || '#94a3b8' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'spending' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Payment methods */}
              <div className="card">
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16 }}>Payment Method Usage</div>
                {paymentMethods.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {paymentMethods.map((pm, i) => {
                      const maxTotal = paymentMethods[0]?.total || 1;
                      const pct = Math.round((pm.total / maxTotal) * 100);
                      const pmColors = { 'Cash': '#f59e0b', 'Credit Card': '#ef4444', 'Debit Card': '#3b82f6', 'UPI': '#8b5cf6', 'Net Banking': '#10b981', 'Wallet': '#ec4899', 'Cheque': '#94a3b8', 'Other': '#64748b' };
                      return (
                        <div key={i}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{pm._id || 'Unknown'}</span>
                            <div>
                              <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{formatCurrency(pm.total)}</span>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: 8 }}>{pm.count} txns</span>
                            </div>
                          </div>
                          <div className="progress-bar" style={{ height: 6 }}>
                            <div className="progress-fill" style={{ width: `${pct}%`, background: pmColors[pm._id] || '#94a3b8' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : <div className="empty-state"><div className="empty-state-icon">💳</div><div className="empty-state-title">No data</div></div>}
              </div>

              {/* Category bar chart */}
              {categoryBreakdown.length > 0 && (
                <div className="card">
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16 }}>Spending by Category (Bar)</div>
                  <div style={{ height: 260 }}>
                    <Bar
                      data={{
                        labels: categoryBreakdown.slice(0,10).map(c => c._id),
                        datasets: [{
                          label: 'Amount',
                          data: categoryBreakdown.slice(0,10).map(c => c.total),
                          backgroundColor: categoryBreakdown.slice(0,10).map(c => `${CATEGORY_COLORS[c._id] || '#94a3b8'}bb`),
                          borderRadius: 8,
                          borderSkipped: false,
                        }],
                      }}
                      options={{ ...chartDefaults, indexAxis: 'y' }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <style>{`
        @media (max-width: 900px) {
          .cat-grid { grid-template-columns: 1fr !important; }
          .analytics-kpi { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
