import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MdAddCircleOutline } from 'react-icons/md';
import TransactionTable from '../components/TransactionTable';
import Spinner from '../components/Spinner';
import { getTransactions } from '../services/transactionService';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTransactions = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getTransactions();
      setTransactions(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1 className="page-title">Transactions</h1>
            <p className="page-subtitle">
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <Link to="/add-transaction" className="btn btn-primary" id="add-transaction-link">
            <MdAddCircleOutline />
            Add Transaction
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <TransactionTable
        transactions={transactions}
        onRefresh={fetchTransactions}
      />
    </div>
  );
}

export default Transactions;
