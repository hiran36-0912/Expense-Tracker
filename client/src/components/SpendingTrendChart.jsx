import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import EmptyState from './EmptyState';
import { MdTrendingDown } from 'react-icons/md';
import { useCurrency } from '../context/CurrencyContext';

function SpendingTrendChart({ data }) {
  const { formatCurrency, symbol } = useCurrency();

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={<MdTrendingDown />}
        title="No trend data"
        message="Record expenses to visualize spending trends over time."
      />
    );
  }

  const formattedData = data.map((d) => {
    const [year, month] = d.month.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return {
      ...d,
      label: date.toLocaleString('default', { month: 'short' }),
    };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="chart-tooltip-title">{label}</p>
          <p className="chart-tooltip-value" style={{ color: '#e11d48' }}>
            Expense: {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart
          data={formattedData}
          margin={{ top: 10, right: 10, left: -10, bottom: 4 }}
        >
          <defs>
            <linearGradient id="expenseTrendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#e11d48" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-200)" vertical={false} />
          <XAxis
            dataKey="label"
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
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="expenses"
            stroke="#e11d48"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#expenseTrendGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SpendingTrendChart;
