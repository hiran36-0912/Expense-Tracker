function SummaryCard({ title, amount, icon, type }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(value || 0);
  };

  const isNegative = amount < 0;

  let amountClass = '';
  if (type === 'income') amountClass = 'income';
  else if (type === 'expense') amountClass = 'expense';
  else if (isNegative) amountClass = 'negative';

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
        {type === 'balance' && 'Current balance'}
        {type === 'income' && 'Total income'}
        {type === 'expense' && 'Total expenses'}
      </div>
    </div>
  );
}

export default SummaryCard;
