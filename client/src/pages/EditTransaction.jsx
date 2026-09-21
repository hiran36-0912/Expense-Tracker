import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdCheckCircle } from 'react-icons/md';
import TransactionForm from '../components/TransactionForm';
import Spinner from '../components/Spinner';
import { getTransactions, updateTransaction } from '../services/transactionService';

function EditTransaction() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const { data } = await getTransactions();
        const found = data.find((t) => t._id === id);
        if (!found) {
          setError('Transaction not found');
        } else {
          setTransaction(found);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load transaction');
      } finally {
        setFetchLoading(false);
      }
    };
    fetchTransaction();
  }, [id]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError('');
    try {
      await updateTransaction(id, formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/transactions');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <Spinner />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Edit Transaction</h1>
        <p className="page-subtitle">Update the transaction details</p>
      </div>

      <div className="card profile-card">
        <div className="card-body">
          {error && (
            <div className="alert alert-error" style={{ marginBottom: 20 }}>
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success" style={{ marginBottom: 20 }}>
              <MdCheckCircle />
              Transaction updated successfully! Redirecting...
            </div>
          )}

          {transaction && (
            <TransactionForm
              onSubmit={handleSubmit}
              loading={loading}
              initialData={transaction}
              submitLabel="Update Transaction"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default EditTransaction;
