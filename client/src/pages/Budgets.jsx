import { useState, useEffect } from 'react';
import {
  MdAdd,
  MdPieChart,
  MdEdit,
  MdDelete,
  MdWarning,
  MdCheckCircle,
  MdCalendarToday,
} from 'react-icons/md';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} from '../services/budgetService';
import { getCategories } from '../services/categoryService';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';

function Budgets() {
  const { formatCurrency } = useCurrency();
  const { addToast } = useToast();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({ category: '', amount: '' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete modal state
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const years = [
    now.getFullYear() - 1,
    now.getFullYear(),
    now.getFullYear() + 1,
  ];

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [budgetRes, catRes] = await Promise.all([
        getBudgets(selectedMonth, selectedYear),
        getCategories(),
      ]);
      setBudgets(budgetRes.data.budgets || []);
      setCategories(catRes.data.expenseCategories || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const handleOpenCreateModal = () => {
    setEditingBudget(null);
    setFormData({
      category: categories.length > 0 ? categories[0] : '',
      amount: '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (b) => {
    setEditingBudget(b);
    setFormData({
      category: b.category,
      amount: b.amount.toString(),
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.category) {
      setFormError('Please select a category');
      return;
    }

    const numAmount = parseFloat(formData.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Budget amount must be a positive number');
      return;
    }

    setSaving(true);
    try {
      if (editingBudget) {
        await updateBudget(editingBudget._id, {
          category: formData.category,
          amount: numAmount,
          month: selectedMonth,
          year: selectedYear,
        });
        addToast(`Budget for ${formData.category} updated`, 'success');
      } else {
        await createBudget({
          category: formData.category,
          amount: numAmount,
          month: selectedMonth,
          year: selectedYear,
        });
        addToast(`Budget for ${formData.category} created`, 'success');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save budget');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await deleteBudget(deleteId);
      setDeleteId(null);
      addToast('Budget deleted successfully', 'success');
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete budget', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = Math.max(0, totalBudgeted - totalSpent);
  const exceededCount = budgets.filter((b) => b.isExceeded).length;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1 className="page-title">Monthly Budgets</h1>
            <p className="page-subtitle">Set category spending limits and monitor real-time usage</p>
          </div>
          <button className="btn btn-primary" onClick={handleOpenCreateModal} id="add-budget-btn">
            <MdAdd /> Set Budget
          </button>
        </div>
      </div>

      {/* Month & Year Selectors */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ padding: '14px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MdCalendarToday style={{ color: 'var(--primary)', fontSize: 18 }} />
              <span style={{ fontWeight: 600, fontSize: 14 }}>Budget Period:</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <select
                className="form-control"
                style={{ width: 'auto', minWidth: 130 }}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                id="select-budget-month"
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>

              <select
                className="form-control"
                style={{ width: 'auto', minWidth: 100 }}
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                id="select-budget-year"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Overview Stat Cards */}
      <div className="summary-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: 24 }}>
        <div className="summary-card">
          <div className="summary-card-header">
            <span className="summary-card-label">Total Allocated</span>
            <div className="summary-card-icon balance"><MdPieChart /></div>
          </div>
          <div className="summary-card-amount">{formatCurrency(totalBudgeted)}</div>
          <div className="summary-card-sub">{budgets.length} Category Budgets</div>
        </div>

        <div className="summary-card">
          <div className="summary-card-header">
            <span className="summary-card-label">Actual Spent</span>
            <div className="summary-card-icon expense"><MdWarning /></div>
          </div>
          <div className="summary-card-amount" style={{ color: totalSpent > totalBudgeted ? 'var(--danger)' : 'inherit' }}>
            {formatCurrency(totalSpent)}
          </div>
          <div className="summary-card-sub">
            {totalBudgeted > 0 ? `${((totalSpent / totalBudgeted) * 100).toFixed(0)}% of total allocated` : 'No budget set'}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-card-header">
            <span className="summary-card-label">Remaining Buffer</span>
            <div className="summary-card-icon income"><MdCheckCircle /></div>
          </div>
          <div className="summary-card-amount" style={{ color: 'var(--success)' }}>
            {formatCurrency(totalRemaining)}
          </div>
          <div className="summary-card-sub">
            {exceededCount > 0 ? (
              <span className="text-danger" style={{ fontWeight: 600 }}>{exceededCount} Category Exceeded</span>
            ) : (
              'All budgets on target'
            )}
          </div>
        </div>
      </div>

      {/* Budget Cards Grid */}
      {loading ? (
        <Spinner />
      ) : budgets.length === 0 ? (
        <EmptyState
          icon={<MdPieChart />}
          title="No budgets created yet"
          message={`You haven't defined any spending budgets for ${months.find((m) => m.value === selectedMonth)?.label} ${selectedYear}.`}
          actionLabel="Create Budget"
          onAction={handleOpenCreateModal}
        />
      ) : (
        <div className="budget-grid">
          {budgets.map((b) => (
            <div key={b._id} className={`budget-card card ${b.isExceeded ? 'border-danger' : ''}`}>
              <div className="budget-card-header">
                <div>
                  <h3 className="budget-card-title">{b.category}</h3>
                  <span className="text-xs text-muted">
                    {months.find((m) => m.value === b.month)?.label} {b.year}
                  </span>
                </div>
                <div className="actions-cell">
                  <button
                    className="btn-icon edit"
                    onClick={() => handleOpenEditModal(b)}
                    title="Edit budget"
                    id={`edit-budget-${b._id}`}
                  >
                    <MdEdit />
                  </button>
                  <button
                    className="btn-icon delete"
                    onClick={() => setDeleteId(b._id)}
                    title="Delete budget"
                    id={`delete-budget-${b._id}`}
                  >
                    <MdDelete />
                  </button>
                </div>
              </div>

              <div className="budget-card-body">
                <div className="budget-numbers">
                  <div className="budget-spent-ratio">
                    <span className="spent-val">{formatCurrency(b.spent)}</span>
                    <span className="total-val"> / {formatCurrency(b.amount)}</span>
                  </div>
                  <div className="budget-percentage">
                    {b.percentageUsed}% used
                  </div>
                </div>

                <div className="progress-bar-container">
                  <div
                    className={`progress-bar-fill ${b.isExceeded ? 'danger' : b.percentageUsed > 80 ? 'warning' : 'primary'}`}
                    style={{ width: `${Math.min(100, b.percentageUsed)}%` }}
                  />
                </div>

                <div className="budget-card-footer">
                  {b.isExceeded ? (
                    <span className="badge badge-danger">
                      <MdWarning /> Budget Exceeded ({formatCurrency(b.spent - b.amount)} over)
                    </span>
                  ) : (
                    <span className="text-xs text-muted">
                      Remaining: <strong style={{ color: 'var(--success-dark)' }}>{formatCurrency(b.remaining)}</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Budget Modal */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingBudget ? 'Edit Budget' : 'Create Monthly Budget'}</h2>
              <button
                className="modal-close-btn"
                onClick={() => setModalOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {formError && <div className="alert alert-error">{formError}</div>}

                <div className="form-group">
                  <label className="form-label" htmlFor="budget-category">
                    Category <span>*</span>
                  </label>
                  <select
                    id="budget-category"
                    className="form-control"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    disabled={!!editingBudget}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="budget-amount">
                    Monthly Limit Amount <span>*</span>
                  </label>
                  <input
                    id="budget-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="form-control"
                    placeholder="e.g. 5000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    autoFocus
                  />
                </div>

                <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 8 }}>
                  Applies to {months.find((m) => m.value === selectedMonth)?.label} {selectedYear}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                  id="submit-budget-btn"
                >
                  {saving ? 'Saving...' : editingBudget ? 'Update Budget' : 'Create Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteId}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  );
}

export default Budgets;
