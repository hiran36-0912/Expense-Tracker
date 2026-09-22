import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import EmptyState from './EmptyState';
import { MdPieChart } from 'react-icons/md';
import { useCurrency } from '../context/CurrencyContext';

const COLORS = [
  '#6366f1', // soft indigo
  '#ec4899', // soft pink
  '#10b981', // emerald
  '#f59e0b', // amber
  '#06b6d4', // cyan
  '#8b5cf6', // purple
  '#f97316', // orange
  '#14b8a6', // teal
  '#64748b', // slate
];

function CategoryPieChart({ data }) {
  const { formatCurrency } = useCurrency();

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={<MdPieChart />}
        title="No expense data"
        message="Add some expenses to see the category breakdown."
      />
    );
  }

  const totalExpense = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const percent = totalExpense > 0 ? ((item.value / totalExpense) * 100).toFixed(1) : 0;
      return (
        <div className="chart-tooltip">
          <p className="chart-tooltip-title">{item.name}</p>
          <p className="chart-tooltip-value" style={{ color: item.payload.fill }}>
            {formatCurrency(item.value)}
          </p>
          <p className="chart-tooltip-sub">{percent}% of total expenses</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={3}
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value, entry) => {
              const item = data.find((d) => d.name === value);
              const percent =
                item && totalExpense > 0
                  ? ` (${((item.value / totalExpense) * 100).toFixed(0)}%)`
                  : '';
              return (
                <span style={{ fontSize: 12, color: 'var(--gray-600)' }}>
                  {value}
                  {percent}
                </span>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CategoryPieChart;
