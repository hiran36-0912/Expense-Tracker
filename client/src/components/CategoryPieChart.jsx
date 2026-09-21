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

const COLORS = [
  '#6366f1', // soft indigo
  '#fb7185', // soft rose
  '#34d399', // soft mint
  '#fbbf24', // soft amber
  '#38bdf8', // soft sky
  '#a78bfa', // soft lavender
  '#f472b6', // soft pink
  '#2dd4bf', // soft teal
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: '8px 14px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          fontSize: 13,
        }}
      >
        <p style={{ fontWeight: 600, color: '#1f2937', marginBottom: 2 }}>
          {item.name}
        </p>
        <p style={{ color: item.payload.fill }}>
          ₹{item.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

function CategoryPieChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={<MdPieChart />}
        title="No expense data"
        message="Add some expenses to see the category breakdown."
      />
    );
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={3}
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span style={{ fontSize: 12, color: '#6b7280' }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CategoryPieChart;
