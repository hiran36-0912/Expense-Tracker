import { useState, useEffect } from 'react';
import {
  MdAnalytics,
  MdTrendingUp,
  MdTrendingDown,
  MdSavings,
  MdCategory,
  MdToday,
  MdStars,
} from 'react-icons/md';
import { getDashboardSummary } from '../services/dashboardService';
import { getTransactions } from '../services/transactionService';
import Spinner from '../components/Spinner';
import CategoryPieChart from '../components/CategoryPieChart';
import MonthlyBarChart from '../components/MonthlyBarChart';

function Analytics() {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [sumRes, txRes] = await Promise.all([
        getDashboardSummary(),
        getTransactions(),
      ]);
      setSummary(sumRes.data);
      setTransactions(txRes.data.transactions || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);

  if (loading) return <Spinner />;

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert-error">{error}</div>
        <button className="btn btn-primary" onClick={fetchData}>
          Retry
        </button>
      </div>
    );
  }

  const income = summary?.totalIncome || 0;
  const expenses = summary?.totalExpenses || 0;
  const balance = summary?.balance || 0;

  // Savings rate calculation
  const savingsRate = income > 0 ? Math.max(0, Math.round(((income - expenses) / income) * 100)) : 0;
  const isDeficit = expenses > income && income > 0;

  let savingsHealth = { label: 'Excellent', color: 'var(--success)', bg: 'var(--success-bg)', desc: 'High savings habit' };
  if (isDeficit) {
    savingsHealth = { label: 'Deficit', color: 'var(--danger)', bg: 'var(--danger-bg)', desc: 'Expenses exceed income' };
  } else if (savingsRate < 15) {
    savingsHealth = { label: 'Cautious', color: 'var(--warning)', bg: 'var(--warning-bg)', desc: 'Low savings buffer' };
  } else if (savingsRate < 35) {
    savingsHealth = { label: 'Good', color: 'var(--primary)', bg: 'var(--primary-bg)', desc: 'Healthy balance' };
  }

  // Top category
  const categoryData = summary?.categoryData || [];
  const sortedCategories = [...categoryData].sort((a, b) => b.value - a.value);
  const topCategory = sortedCategories[0] || null;

  // Largest single expense
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');
  const largestExpense = expenseTransactions.length > 0
    ? [...expenseTransactions].sort((a, b) => b.amount - a.amount)[0]
    : null;

  // Average daily expense (last 30 days estimation)
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate();
  const avgDaily = currentDay > 0 ? Math.round(expenses / Math.min(currentDay, daysInMonth)) : 0;

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: 'linear-gradient(135deg, var(--primary-bg) 0%, #eef2ff 100%)',
              border: '1px solid var(--primary-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              fontSize: 22,
              boxShadow: '0 2px 8px var(--primary-shadow)',
            }}
          >
            <MdAnalytics />
          </div>
          <div>
            <h1 className="page-title">Financial Insights & Analytics</h1>
            <p className="page-subtitle">Deep dive into your financial habits and trends</p>
          </div>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="summary-cards" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        {/* Savings Rate */}
        <div className="summary-card">
          <div className="summary-card-header">
            <span className="summary-card-label">Savings Rate</span>
            <div className="summary-card-icon balance">
              <MdSavings />
            </div>
          </div>
          <div className="summary-card-amount" style={{ color: savingsHealth.color }}>
            {savingsRate}%
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 99,
                background: savingsHealth.bg,
                color: savingsHealth.color,
              }}
            >
              {savingsHealth.label}
            </span>
            <span className="summary-card-sub">{savingsHealth.desc}</span>
          </div>
        </div>

        {/* Top Category */}
        <div className="summary-card">
          <div className="summary-card-header">
            <span className="summary-card-label">Top Expense Category</span>
            <div className="summary-card-icon expense">
              <MdCategory />
            </div>
          </div>
          <div className="summary-card-amount" style={{ fontSize: 20, textTransform: 'capitalize' }}>
            {topCategory ? topCategory.name : '—'}
          </div>
          <div className="summary-card-sub">
            {topCategory ? `${formatCurrency(topCategory.value)} spent` : 'No expenses recorded'}
          </div>
        </div>

        {/* Avg Daily Expense */}
        <div className="summary-card">
          <div className="summary-card-header">
            <span className="summary-card-label">Avg Daily Spend</span>
            <div className="summary-card-icon expense">
              <MdToday />
            </div>
          </div>
          <div className="summary-card-amount">
            {formatCurrency(avgDaily)}
          </div>
          <div className="summary-card-sub">Per day this cycle</div>
        </div>

        {/* Largest Single Expense */}
        <div className="summary-card">
          <div className="summary-card-header">
            <span className="summary-card-label">Largest Expense</span>
            <div className="summary-card-icon expense">
              <MdStars />
            </div>
          </div>
          <div className="summary-card-amount" style={{ color: 'var(--danger)' }}>
            {largestExpense ? formatCurrency(largestExpense.amount) : '—'}
          </div>
          <div className="summary-card-sub" style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {largestExpense ? largestExpense.description : 'None'}
          </div>
        </div>
      </div>

      {/* Cash Flow Distribution */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <h2 className="card-title">Cash Flow & Capital Retention</h2>
          <span className="text-sm text-muted">
            Net Savings: <strong style={{ color: balance >= 0 ? 'var(--success-dark)' : 'var(--danger)' }}>{formatCurrency(balance)}</strong>
          </span>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
            <span>
              <strong>Income:</strong> {formatCurrency(income)}
            </span>
            <span>
              <strong>Expenses:</strong> {formatCurrency(expenses)}
            </span>
          </div>

          <div
            style={{
              width: '100%',
              height: 12,
              borderRadius: 99,
              background: 'var(--gray-100)',
              overflow: 'hidden',
              display: 'flex',
            }}
          >
            <div
              style={{
                width: `${income > 0 ? Math.min(100, Math.round((expenses / income) * 100)) : 0}%`,
                background: 'var(--danger-light)',
                borderRight: '2px solid white',
              }}
              title={`Expenses: ${formatCurrency(expenses)}`}
            />
            <div
              style={{
                flex: 1,
                background: 'var(--success-light)',
              }}
              title={`Savings: ${formatCurrency(balance)}`}
            />
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 12, color: 'var(--gray-500)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--danger-light)' }} />
              Expenses ({income > 0 ? Math.round((expenses / income) * 100) : 0}%)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--success-light)' }} />
              Retained Savings ({income > 0 ? Math.max(0, 100 - Math.round((expenses / income) * 100)) : 0}%)
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown Progress Bars & Monthly Trends */}
      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Category Spending Distribution</h2>
            <span className="text-sm text-muted">{sortedCategories.length} categories</span>
          </div>
          <div className="card-body">
            {sortedCategories.length === 0 ? (
              <p className="text-muted" style={{ textAlign: 'center', padding: '24px 0' }}>
                No expense data available yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {sortedCategories.map((cat) => {
                  const share = expenses > 0 ? ((cat.value / expenses) * 100).toFixed(1) : 0;
                  return (
                    <div key={cat.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                        <span style={{ fontWeight: 500, color: 'var(--gray-800)' }}>{cat.name}</span>
                        <span style={{ color: 'var(--gray-600)' }}>
                          <strong>{formatCurrency(cat.value)}</strong> ({share}%)
                        </span>
                      </div>
                      <div
                        style={{
                          width: '100%',
                          height: 8,
                          borderRadius: 99,
                          background: 'var(--gray-100)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${share}%`,
                            height: '100%',
                            borderRadius: 99,
                            background: 'linear-gradient(90deg, #6366f1, #a5b4fc)',
                            transition: 'width 0.5s ease',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Visual Category Breakdown</h2>
          </div>
          <div className="card-body">
            <CategoryPieChart data={summary?.categoryData} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
