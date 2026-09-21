import { useState, useEffect } from 'react';
import { MdErrorOutline } from 'react-icons/md';

const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Education',
  'Entertainment',
  'Health',
  'Other',
];

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Business', 'Gift', 'Other'];

const today = new Date().toISOString().split('T')[0];

function TransactionForm({ onSubmit, loading, initialData, submitLabel }) {
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: today,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type || 'expense',
        amount: initialData.amount || '',
        category: initialData.category || '',
        description: initialData.description || '',
        date: initialData.date
          ? new Date(initialData.date).toISOString().split('T')[0]
          : today,
      });
    }
  }, [initialData]);

  const categories =
    formData.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleTypeChange = (type) => {
    setFormData((prev) => ({ ...prev, type, category: '' }));
    setErrors((prev) => ({ ...prev, type: '', category: '' }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.type) newErrors.type = 'Transaction type is required';
    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length > 200) {
      newErrors.description = 'Description cannot exceed 200 characters';
    }
    if (!formData.date) newErrors.date = 'Date is required';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Type Toggle */}
      <div className="form-group">
        <label className="form-label">
          Transaction Type <span>*</span>
        </label>
        <div className="type-toggle">
          <button
            type="button"
            className={`type-btn income${formData.type === 'income' ? ' selected' : ''}`}
            onClick={() => handleTypeChange('income')}
            id="type-income-btn"
          >
            ↑ Income
          </button>
          <button
            type="button"
            className={`type-btn expense${formData.type === 'expense' ? ' selected' : ''}`}
            onClick={() => handleTypeChange('expense')}
            id="type-expense-btn"
          >
            ↓ Expense
          </button>
        </div>
      </div>

      {/* Amount */}
      <div className="form-group">
        <label htmlFor="amount" className="form-label">
          Amount <span>*</span>
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          className={`form-control${errors.amount ? ' error' : ''}`}
          value={formData.amount}
          onChange={handleChange}
        />
        {errors.amount && (
          <div className="form-error">
            <MdErrorOutline /> {errors.amount}
          </div>
        )}
      </div>

      {/* Category */}
      <div className="form-group">
        <label htmlFor="category" className="form-label">
          Category <span>*</span>
        </label>
        <select
          id="category"
          name="category"
          className={`form-control${errors.category ? ' error' : ''}`}
          value={formData.category}
          onChange={handleChange}
        >
          <option value="">Select category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && (
          <div className="form-error">
            <MdErrorOutline /> {errors.category}
          </div>
        )}
      </div>

      {/* Description */}
      <div className="form-group">
        <label htmlFor="description" className="form-label">
          Description <span>*</span>
        </label>
        <input
          id="description"
          name="description"
          type="text"
          placeholder="Brief description..."
          maxLength={200}
          className={`form-control${errors.description ? ' error' : ''}`}
          value={formData.description}
          onChange={handleChange}
        />
        {errors.description && (
          <div className="form-error">
            <MdErrorOutline /> {errors.description}
          </div>
        )}
      </div>

      {/* Date */}
      <div className="form-group">
        <label htmlFor="date" className="form-label">
          Date <span>*</span>
        </label>
        <input
          id="date"
          name="date"
          type="date"
          className={`form-control${errors.date ? ' error' : ''}`}
          value={formData.date}
          onChange={handleChange}
          max={today}
        />
        {errors.date && (
          <div className="form-error">
            <MdErrorOutline /> {errors.date}
          </div>
        )}
      </div>

      <button
        type="submit"
        className="btn btn-primary btn-full btn-lg"
        disabled={loading}
        id="submit-transaction-btn"
      >
        {loading ? (
          <>
            <div className="spinner sm" />
            Saving...
          </>
        ) : (
          submitLabel || 'Save Transaction'
        )}
      </button>
    </form>
  );
}

export default TransactionForm;
