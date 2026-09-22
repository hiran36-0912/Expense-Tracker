import { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'INR (₹)' },
  { code: 'USD', symbol: '$', label: 'USD ($)' },
  { code: 'EUR', symbol: '€', label: 'EUR (€)' },
  { code: 'GBP', symbol: '£', label: 'GBP (£)' },
];

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('expensetrack_currency') || 'INR';
  });

  useEffect(() => {
    localStorage.setItem('expensetrack_currency', currency);
  }, [currency]);

  const activeCurrency = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];

  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    const formattedNum = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(num);

    return `${activeCurrency.symbol}${formattedNum}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        symbol: activeCurrency.symbol,
        currencies: CURRENCIES,
        formatCurrency,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
