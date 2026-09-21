import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MdAccountBalanceWallet,
  MdTrendingUp,
  MdTrendingDown,
  MdAddCircleOutline,
} from 'react-icons/md';
import { TbReceipt } from 'react-icons/tb';
import BudgetWidget from '../components/BudgetWidget';
import SummaryCard from '../components/SummaryCard';
import CategoryPieChart from '../components/CategoryPieChart';
import MonthlyBarChart from '../components/MonthlyBarChart';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { getDashboardSummary } from '../services/dashboardService';

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(value || 0);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', {
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

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Your financial overview at a glance</p>
          </div>
          <Link to="/add-transaction" className="btn btn-primary" id="add-transaction-link">
            <MdAddCircleOutline />
            Add Transaction
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <SummaryCard
          title="Total Balance"
          amount={summary?.balance}
          icon={<MdAccountBalanceWallet />}
          type="balance"
        />
        <SummaryCard
          title="Total Income"
          amount={summary?.totalIncome}
          icon={<MdTrendingUp />}
          type="income"
        />
        <SummaryCard
          title="Total Expenses"
          amount={summary?.totalExpenses}
          icon={<MdTrendingDown />}
          type="expense"
        />
      </div>

      {/* Monthly Budget & Spending Limit Feature */}
      <BudgetWidget
        currentMonthExpenses={
          summary?.monthlyChartData?.find(
            (d) => d.month === new Date().toISOString().slice(0, 7)
          )?.expenses ?? (summary?.totalExpenses || 0)
        }
        onBudgetUpdated={fetchSummary}
      />

      {/* Charts */}
      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Expense by Category</h2>
          </div>
          <div className="card-body">
            <CategoryPieChart data={summary?.categoryData} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Monthly Overview</h2>
            <span className="text-sm text-muted">Last 6 months</span>
          </div>
          <div className="card-body">
            <MonthlyBarChart data={summary?.monthlyChartData} />
          </div>
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
