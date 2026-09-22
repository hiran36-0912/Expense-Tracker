import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MdAccountBalanceWallet,
  MdTrendingUp,
  MdTrendingDown,
  MdSavings,
  MdAddCircleOutline,
  MdArrowUpward,
  MdArrowDownward,
  MdWarning,
  MdPieChart,
  MdCheckCircle,
  MdEventNote,
} from 'react-icons/md';
import { TbReceipt } from 'react-icons/tb';
import SummaryCard from '../components/SummaryCard';
import CategoryPieChart from '../components/CategoryPieChart';
import MonthlyBarChart from '../components/MonthlyBarChart';
import SpendingTrendChart from '../components/SpendingTrendChart';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { getDashboardSummary } from '../services/dashboardService';
import { useCurrency } from '../context/CurrencyContext';

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { formatCurrency } = useCurrency();

  const fetchSummary = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getDashboardSummary();
      setSummary(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('default', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  if (loading) return <Spinner />;

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert-error">{error}</div>
        <button className="btn btn-primary" onClick={fetchSummary} id="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  const comparison = summary?.monthlyComparison;
  const budgetOverview = summary?.budgetOverview;
  const goalsOverview = summary?.goalsOverview;
  const upcomingRecurring = summary?.upcomingRecurring || [];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1 className="page-title">Financial Dashboard</h1>
            <p className="page-subtitle">Track, budget, and analyze your wealth in real-time</p>
          </div>
          <div className="header-actions">
            <Link to="/add-transaction" className="btn btn-primary" id="add-transaction-link">
              <MdAddCircleOutline />
              Add Transaction
            </Link>
          </div>
        </div>
      </div>

      {/* Warning / In-App Notification Alerts */}
      {budgetOverview?.exceededBudgetsCount > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: 20 }}>
          <MdWarning style={{ fontSize: 20, flexShrink: 0 }} />
          <div>
            <strong>Budget Exceeded Alert:</strong> You have exceeded spending limits on{' '}
            {budgetOverview.exceededBudgetsCount} category budget(s) this month.{' '}
            <Link to="/budgets" style={{ textDecoration: 'underline', fontWeight: 600 }}>
              Review Budgets
            </Link>
          </div>
        </div>
      )}

      {upcomingRecurring.length > 0 && (
        <div className="alert alert-info" style={{ marginBottom: 20 }}>
          <MdEventNote style={{ fontSize: 20, flexShrink: 0 }} />
          <div>
            <strong>Upcoming Recurring Bills:</strong> You have upcoming payments (
            {upcomingRecurring.map((r) => `${r.description}: ${formatCurrency(r.amount)}`).join(', ')}
            ).{' '}
            <Link to="/recurring" style={{ textDecoration: 'underline', fontWeight: 600 }}>
              View Recurring
            </Link>
          </div>
        </div>
      )}

      {/* 4 Key Metric Cards */}
      <div className="summary-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <SummaryCard
          title="Total Balance"
          amount={summary?.balance}
          icon={<MdAccountBalanceWallet />}
          type="balance"
          subtitle="Net available capital"
        />
        <SummaryCard
          title="Total Income"
          amount={summary?.totalIncome}
          icon={<MdTrendingUp />}
          type="income"
          subtitle="All-time credited"
        />
        <SummaryCard
          title="Total Expenses"
          amount={summary?.totalExpenses}
          icon={<MdTrendingDown />}
          type="expense"
          subtitle="All-time debited"
        />
        <SummaryCard
          title="Net Savings"
          amount={summary?.savings}
          icon={<MdSavings />}
          type="savings"
          subtitle="Income minus expenses"
        />
      </div>

      {/* Monthly Comparison Widget */}
      {comparison && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <h2 className="card-title">Monthly Comparison</h2>
            <span className="text-sm text-muted">
              {comparison.currentMonth.name} vs {comparison.previousMonth.name}
            </span>
          </div>
          <div className="card-body">
            <div className="comparison-grid">
              <div className="comparison-card income-comp">
                <div className="comparison-label">Current Month Income</div>
                <div className="comparison-val">{formatCurrency(comparison.currentMonth.income)}</div>
                <div className="comparison-diff">
                  {comparison.incomeChangePercent >= 0 ? (
                    <span className="badge badge-success">
                      <MdArrowUpward /> +{comparison.incomeChangePercent}%
                    </span>
                  ) : (
                    <span className="badge badge-danger">
                      <MdArrowDownward /> {comparison.incomeChangePercent}%
                    </span>
                  )}
                  <span className="text-muted text-xs">
                    vs {formatCurrency(comparison.previousMonth.income)} prev
                  </span>
                </div>
              </div>

              <div className="comparison-card expense-comp">
                <div className="comparison-label">Current Month Expenses</div>
                <div className="comparison-val">{formatCurrency(comparison.currentMonth.expenses)}</div>
                <div className="comparison-diff">
                  {comparison.expenseChangePercent <= 0 ? (
                    <span className="badge badge-success">
                      <MdArrowDownward /> {comparison.expenseChangePercent}%
                    </span>
                  ) : (
                    <span className="badge badge-danger">
                      <MdArrowUpward /> +{comparison.expenseChangePercent}%
                    </span>
                  )}
                  <span className="text-muted text-xs">
                    vs {formatCurrency(comparison.previousMonth.expenses)} prev
                  </span>
                </div>
              </div>

              <div className="comparison-card net-comp">
                <div className="comparison-label">Monthly Net Savings</div>
                <div className="comparison-val">
                  {formatCurrency(comparison.currentMonth.income - comparison.currentMonth.expenses)}
                </div>
                <div className="comparison-diff">
                  <span className="text-muted text-xs">
                    Retained this month ({comparison.currentMonth.income > 0
                      ? Math.round(((comparison.currentMonth.income - comparison.currentMonth.expenses) / comparison.currentMonth.income) * 100)
                      : 0}% rate)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Budget Status & Savings Goals Highlights */}
      <div className="dashboard-grid" style={{ marginBottom: 24 }}>
        {/* Budget Status Card */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MdPieChart style={{ color: 'var(--primary)', fontSize: 20 }} />
              <h2 className="card-title">Active Budget Status</h2>
            </div>
            <Link to="/budgets" className="btn btn-outline btn-sm">
              Manage
            </Link>
          </div>
          <div className="card-body">
            {budgetOverview?.budgetCount === 0 ? (
              <p className="text-muted" style={{ padding: '12px 0' }}>
                No category budgets set for this month.{' '}
                <Link to="/budgets" style={{ color: 'var(--primary)', fontWeight: 500 }}>
                  Create a monthly budget
                </Link>
              </p>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                  <span>
                    Spent: <strong>{formatCurrency(budgetOverview.currentMonthExpenses)}</strong>
                  </span>
                  <span>
                    Total Budget: <strong>{formatCurrency(budgetOverview.totalBudgeted)}</strong>
                  </span>
                </div>
                <div className="progress-bar-container">
                  <div
                    className={`progress-bar-fill ${
                      budgetOverview.currentMonthExpenses > budgetOverview.totalBudgeted
                        ? 'danger'
                        : 'primary'
                    }`}
                    style={{
                      width: `${
                        budgetOverview.totalBudgeted > 0
                          ? Math.min(100, Math.round((budgetOverview.currentMonthExpenses / budgetOverview.totalBudgeted) * 100))
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12 }}>
                  <span className="text-muted">
                    {budgetOverview.budgetCount} tracked budget categories
                  </span>
                  {budgetOverview.exceededBudgetsCount > 0 ? (
                    <span className="badge badge-danger">
                      {budgetOverview.exceededBudgetsCount} Exceeded
                    </span>
                  ) : (
                    <span className="badge badge-success">All on track</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Savings Goal Progress */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MdSavings style={{ color: 'var(--success)', fontSize: 20 }} />
              <h2 className="card-title">Savings Goals Progress</h2>
            </div>
            <Link to="/goals" className="btn btn-outline btn-sm">
              View Goals
            </Link>
          </div>
          <div className="card-body">
            {goalsOverview?.count === 0 ? (
              <p className="text-muted" style={{ padding: '12px 0' }}>
                No savings goals created yet.{' '}
                <Link to="/goals" style={{ color: 'var(--primary)', fontWeight: 500 }}>
                  Set a savings target
                </Link>
              </p>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                  <span>
                    Saved: <strong>{formatCurrency(goalsOverview.totalCurrent)}</strong>
                  </span>
                  <span>
                    Target: <strong>{formatCurrency(goalsOverview.totalTarget)}</strong>
                  </span>
                </div>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill success"
                    style={{ width: `${goalsOverview.overallProgress}%` }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12 }}>
                  <span className="text-muted">
                    {goalsOverview.completedCount} of {goalsOverview.count} goals completed
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--success-dark)' }}>
                    {goalsOverview.overallProgress}% Achieved
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid: Spending Trend & Expense Distribution */}
      <div className="dashboard-grid" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Expense Distribution</h2>
            <span className="text-xs text-muted">Category Breakdown & % Share</span>
          </div>
          <div className="card-body">
            <CategoryPieChart data={summary?.categoryData} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Spending Trend</h2>
            <span className="text-xs text-muted">Expense Trajectory Over Time</span>
          </div>
          <div className="card-body">
            <SpendingTrendChart data={summary?.monthlyChartData} />
          </div>
        </div>
      </div>

      {/* Monthly Inflow vs Outflow Overview */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <h2 className="card-title">Income vs Expense History</h2>
          <span className="text-xs text-muted">Recent Months Overview</span>
        </div>
        <div className="card-body">
          <MonthlyBarChart data={summary?.monthlyChartData} />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Transactions</h2>
          <Link to="/transactions" className="btn btn-outline btn-sm" id="view-all-link">
            View All
          </Link>
        </div>
        <div className="card-body">
          {summary?.recentTransactions?.length === 0 ? (
            <EmptyState
              icon={<TbReceipt />}
              title="No transactions yet"
              message="Add your first transaction to start tracking your finances."
              actionLabel="Add Transaction"
              actionTo="/add-transaction"
            />
          ) : (
            <div className="recent-list">
              {summary?.recentTransactions?.map((t) => (
                <div className="recent-item" key={t._id}>
                  <div className={`recent-item-icon ${t.type}`}>
                    {t.type === 'income' ? <MdTrendingUp /> : <MdTrendingDown />}
                  </div>
                  <div className="recent-item-details">
                    <div className="recent-item-desc">{t.description}</div>
                    <div className="recent-item-category">{t.category}</div>
                  </div>
                  <div className="recent-item-date">{formatDate(t.date)}</div>
                  <div className={`recent-item-amount ${t.type}`}>
                    {t.type === 'income' ? '+' : '-'}
                    {formatCurrency(t.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
