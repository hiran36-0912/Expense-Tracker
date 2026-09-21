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
import EmptyState from './EmptyState';
import { MdBarChart } from 'react-icons/md';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: '10px 14px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          fontSize: 13,
        }}
      >
        <p style={{ fontWeight: 600, color: '#1f2937', marginBottom: 6 }}>
          {label}
        </p>
        {payload.map((entry) => (
          <p key={entry.name} style={{ color: entry.fill, marginBottom: 2 }}>
            {entry.name === 'income' ? 'Income' : 'Expenses'}: ₹
            {entry.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function MonthlyBarChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={<MdBarChart />}
        title="No monthly data"
        message="Add transactions to see the monthly income vs expenses chart."
      />
    );
  }

  const formattedData = data.map((d) => {
    const [year, month] = d.month.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return {
      ...d,
      label: date.toLocaleString('en-IN', { month: 'short', year: '2-digit' }),
    };
  });

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={formattedData}
          margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
          barCategoryGap="30%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>
                {value === 'income' ? 'Income' : 'Expenses'}
              </span>
            )}
          />
          <Bar dataKey="income" fill="#34d399" radius={[6, 6, 0, 0]} />
          <Bar dataKey="expenses" fill="#fb7185" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MonthlyBarChart;
