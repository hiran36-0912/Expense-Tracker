import { useCurrency } from '../context/CurrencyContext';

function SummaryCard({ title, amount, icon, type, subtitle }) {
  const { formatCurrency } = useCurrency();

  const isNegative = (amount || 0) < 0;

  let amountClass = '';
  if (type === 'income') amountClass = 'income';
  else if (type === 'expense') amountClass = 'expense';
  else if (type === 'savings') amountClass = isNegative ? 'negative' : 'income';
  else if (isNegative) amountClass = 'negative';

  let defaultSub = '';
  if (type === 'balance') defaultSub = 'Available balance';
  else if (type === 'income') defaultSub = 'Total income';
  else if (type === 'expense') defaultSub = 'Total expenses';
  else if (type === 'savings') defaultSub = isNegative ? 'Deficit' : 'Net retained';

  return (
    <div className="summary-card">
      <div className="summary-card-header">
        <span className="summary-card-label">{title}</span>
        <div className={`summary-card-icon ${type}`}>{icon}</div>
      </div>
      <div className={`summary-card-amount ${amountClass}`}>
        {formatCurrency(amount)}
      </div>
      <div className="summary-card-sub">
        {subtitle || defaultSub}
      </div>
    </div>
  );
}

export default SummaryCard;
