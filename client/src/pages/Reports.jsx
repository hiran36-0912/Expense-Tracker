import { useState, useEffect } from 'react';
import {
  MdAssessment,
  MdTrendingUp,
  MdTrendingDown,
  MdSavings,
  MdCategory,
  MdDateRange,
  MdStars,
  MdBarChart,
} from 'react-icons/md';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Spinner from '../components/Spinner';
import CategoryPieChart from '../components/CategoryPieChart';
import {
  getReportSummary,
  getReportMonthly,
  getReportCategories,
} from '../services/reportService';
import { useCurrency } from '../context/CurrencyContext';

function Reports() {
  const { formatCurrency, symbol } = useCurrency();
  const now = new Date();

  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const years = [
    now.getFullYear() - 2,
    now.getFullYear() - 1,
    now.getFullYear(),
    now.getFullYear() + 1,
  ];

  const fetchReportData = async () => {
    setLoading(true);
    setError('');
    try {
      const [sumRes, monthRes, catRes] = await Promise.all([
        getReportSummary(selectedMonth, selectedYear),
        getReportMonthly(selectedYear),
        getReportCategories(selectedMonth, selectedYear),
      ]);
      setSummary(sumRes.data);
      setMonthlyData(monthRes.data.monthlyData || []);
      setCategoryData(catRes.data.categories || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [selectedMonth, selectedYear]);

  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="chart-tooltip-title">{label}</p>
          {payload.map((entry) => (
            <p key={entry.name} style={{ color: entry.fill, marginBottom: 2, fontSize: 13 }}>
              {entry.name === 'income' ? 'Income' : 'Expenses'}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1 className="page-title">Financial Reports & Analytics</h1>
            <p className="page-subtitle">Detailed analytics, savings rate metrics, and category breakdowns</p>
          </div>
        </div>
      </div>

      {/* Month / Year Selector Card */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-body" style={{ padding: '14px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MdDateRange style={{ color: 'var(--primary)', fontSize: 20 }} />
              <span style={{ fontWeight: 600, fontSize: 15 }}>Analysis Period:</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <select
                className="form-control"
                style={{ width: 'auto', minWidth: 140 }}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                id="report-month-select"
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>

              <select
                className="form-control"
                style={{ width: 'auto', minWidth: 100 }}
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                id="report-year-select"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <Spinner />
      ) : (
        <>
          {/* Key Metrics Grid */}
          <div className="summary-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: 24 }}>
            {/* Monthly Income */}
            <div className="summary-card">
              <div className="summary-card-header">
                <span className="summary-card-label">Monthly Income</span>
                <div className="summary-card-icon income"><MdTrendingUp /></div>
              </div>
              <div className="summary-card-amount" style={{ color: 'var(--success)' }}>
                {formatCurrency(summary?.monthlyIncome)}
              </div>
              <div className="summary-card-sub">
                {months.find((m) => m.value === selectedMonth)?.label} {selectedYear}
              </div>
            </div>

            {/* Monthly Expenses */}
            <div className="summary-card">
              <div className="summary-card-header">
                <span className="summary-card-label">Monthly Expenses</span>
                <div className="summary-card-icon expense"><MdTrendingDown /></div>
              </div>
              <div className="summary-card-amount" style={{ color: 'var(--danger)' }}>
                {formatCurrency(summary?.monthlyExpenses)}
              </div>
              <div className="summary-card-sub">
                {summary?.transactionCount} recorded transactions
              </div>
            </div>

            {/* Monthly Savings */}
            <div className="summary-card">
              <div className="summary-card-header">
                <span className="summary-card-label">Net Savings</span>
                <div className="summary-card-icon balance"><MdSavings /></div>
              </div>
              <div className="summary-card-amount" style={{ color: (summary?.savings || 0) >= 0 ? 'var(--success-dark)' : 'var(--danger)' }}>
                {formatCurrency(summary?.savings)}
              </div>
              <div className="summary-card-sub">
                Income minus expenses
              </div>
            </div>

            {/* Savings Rate */}
            <div className="summary-card">
              <div className="summary-card-header">
                <span className="summary-card-label">Savings Rate</span>
                <div className="summary-card-icon balance"><MdAssessment /></div>
              </div>
              <div className="summary-card-amount" style={{ color: (summary?.savingsRate || 0) > 20 ? 'var(--success)' : 'inherit' }}>
                {summary?.savingsRate}%
              </div>
              <div className="summary-card-sub">
                {(summary?.savingsRate || 0) >= 20 ? 'Strong retention' : 'Low savings buffer'}
              </div>
            </div>

            {/* Highest Spending Category */}
            <div className="summary-card">
              <div className="summary-card-header">
                <span className="summary-card-label">Highest Expense Category</span>
                <div className="summary-card-icon expense"><MdCategory /></div>
              </div>
              <div className="summary-card-amount" style={{ fontSize: 18 }}>
                {summary?.highestSpendingCategory?.category || 'None'}
              </div>
              <div className="summary-card-sub">
                {formatCurrency(summary?.highestSpendingCategory?.amount || 0)} spent
              </div>
            </div>

            {/* Average Monthly Expense */}
            <div className="summary-card">
              <div className="summary-card-header">
                <span className="summary-card-label">Avg Monthly Spend</span>
                <div className="summary-card-icon expense"><MdStars /></div>
              </div>
              <div className="summary-card-amount">
                {formatCurrency(summary?.avgMonthlyExpense)}
              </div>
              <div className="summary-card-sub">Across all ledger history</div>
            </div>
          </div>

          {/* Monthly Analysis (Month by month bar chart) */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MdBarChart style={{ color: 'var(--primary)', fontSize: 20 }} />
                <h2 className="card-title">Monthly Income vs Expenses ({selectedYear})</h2>
              </div>
              <span className="text-sm text-muted">Annual Trajectory</span>
            </div>
            <div className="card-body">
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={monthlyData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 4 }}
                    barCategoryGap="20%"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-200)" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12, fill: 'var(--gray-500)' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: 'var(--gray-500)' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${symbol}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                    />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Legend
                      formatter={(value) => (
                        <span style={{ fontSize: 12, color: 'var(--gray-600)', fontWeight: 500 }}>
                          {value === 'income' ? 'Income' : 'Expenses'}
                        </span>
                      )}
                    />
                    <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Category Analysis Grid */}
          <div className="dashboard-grid">
            {/* Category breakdown bars */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Category Spending Breakdown</h2>
                <span className="text-xs text-muted">{categoryData.length} categories active</span>
              </div>
              <div className="card-body">
                {categoryData.length === 0 ? (
                  <p className="text-muted" style={{ padding: '24px 0', textAlign: 'center' }}>
                    No expenses recorded in {months.find((m) => m.value === selectedMonth)?.label} {selectedYear}.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {categoryData.map((cat) => (
                      <div key={cat.name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                          <span style={{ fontWeight: 500 }}>{cat.name}</span>
                          <span>
                            <strong>{formatCurrency(cat.amount)}</strong> ({cat.percentage}%)
                          </span>
                        </div>
                        <div className="progress-bar-container" style={{ height: 8 }}>
                          <div
                            className="progress-bar-fill primary"
                            style={{ width: `${cat.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Visual Pie Chart */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Expense Distribution Chart</h2>
              </div>
              <div className="card-body">
                <CategoryPieChart
                  data={categoryData.map((c) => ({
                    name: c.name,
                    value: c.amount,
                  }))}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Reports;
