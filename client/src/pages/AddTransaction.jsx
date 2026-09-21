import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdCheckCircle } from 'react-icons/md';
import TransactionForm from '../components/TransactionForm';
import { createTransaction } from '../services/transactionService';

function AddTransaction() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError('');
    try {
      await createTransaction(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/transactions');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Add Transaction</h1>
        <p className="page-subtitle">Record a new income or expense</p>
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
              Transaction saved successfully! Redirecting...
            </div>
          )}

          <TransactionForm
            onSubmit={handleSubmit}
            loading={loading}
            submitLabel="Add Transaction"
          />
        </div>
      </div>
    </div>
  );
}

export default AddTransaction;
