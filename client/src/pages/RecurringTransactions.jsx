import { useState, useEffect } from 'react';
import {
  MdAdd,
  MdAutorenew,
  MdEdit,
  MdDelete,
  MdCalendarToday,
  MdTrendingUp,
  MdTrendingDown,
  MdCheckCircle,
  MdPause,
} from 'react-icons/md';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import {
  getRecurring,
  createRecurring,
  updateRecurring,
  toggleRecurringActive,
  deleteRecurring,
} from '../services/recurringService';
import { getCategories } from '../services/categoryService';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';

function RecurringTransactions() {
  const { formatCurrency } = useCurrency();
  const { addToast } = useToast();

  const [recurringList, setRecurringList] = useState([]);
  const [categories, setCategories] = useState({ expense: [], income: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    frequency: 'Monthly',
    nextDate: '',
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [recRes, catRes] = await Promise.all([
        getRecurring(),
        getCategories(),
      ]);
      setRecurringList(recRes.data || []);
      setCategories({
        expense: catRes.data.expenseCategories || [],
        income: catRes.data.incomeCategories || [],
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load recurring items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('default', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    const defaultType = 'expense';
    const availableCats = categories[defaultType] || [];
    setFormData({
      type: defaultType,
      amount: '',
      category: availableCats.length > 0 ? availableCats[0] : 'Bills',
      description: '',
      frequency: 'Monthly',
      nextDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      type: item.type,
      amount: item.amount.toString(),
      category: item.category,
      description: item.description,
      frequency: item.frequency,
      nextDate: new Date(item.nextDate).toISOString().split('T')[0],
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleToggleStatus = async (item) => {
    try {
      const newStatus = !item.active;
      await toggleRecurringActive(item._id, newStatus);
      addToast(
        `'${item.description}' ${newStatus ? 'activated' : 'paused'}`,
        'success'
      );
      fetchData();
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.description.trim()) {
      setFormError('Description is required');
      return;
    }

    const numAmount = parseFloat(formData.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Amount must be greater than 0');
      return;
    }

    if (!formData.category) {
      setFormError('Category is required');
      return;
    }

    if (!formData.nextDate) {
      setFormError('Next occurrence date is required');
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        await updateRecurring(editingItem._id, {
          type: formData.type,
          amount: numAmount,
          category: formData.category,
          description: formData.description.trim(),
          frequency: formData.frequency,
          nextDate: formData.nextDate,
        });
        addToast('Recurring transaction updated', 'success');
      } else {
        await createRecurring({
          type: formData.type,
          amount: numAmount,
          category: formData.category,
          description: formData.description.trim(),
          frequency: formData.frequency,
          nextDate: formData.nextDate,
        });
        addToast('Recurring transaction created', 'success');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save recurring item');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await deleteRecurring(deleteId);
      setDeleteId(null);
      addToast('Recurring transaction deleted', 'success');
      fetchData();
    } catch (err) {
      addToast('Failed to delete recurring transaction', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const activeCount = recurringList.filter((r) => r.active).length;
  const activeExpenseMonthly = recurringList
    .filter((r) => r.active && r.type === 'expense')
    .reduce((sum, r) => {
      if (r.frequency === 'Weekly') return sum + r.amount * 4.33;
      if (r.frequency === 'Yearly') return sum + r.amount / 12;
      return sum + r.amount;
    }, 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1 className="page-title">Recurring Transactions</h1>
            <p className="page-subtitle">Automated ledger schedules for subscriptions, bills, and regular salaries</p>
          </div>
          <button className="btn btn-primary" onClick={handleOpenCreateModal} id="add-recurring-btn">
            <MdAdd /> New Recurring
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* KPI Cards */}
      <div className="summary-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: 24 }}>
        <div className="summary-card">
          <div className="summary-card-header">
            <span className="summary-card-label">Active Schedules</span>
            <div className="summary-card-icon balance"><MdAutorenew /></div>
          </div>
          <div className="summary-card-amount">{activeCount}</div>
          <div className="summary-card-sub">{recurringList.length} Total Registered</div>
        </div>

        <div className="summary-card">
          <div className="summary-card-header">
            <span className="summary-card-label">Est. Monthly Outflow</span>
            <div className="summary-card-icon expense"><MdTrendingDown /></div>
          </div>
          <div className="summary-card-amount">{formatCurrency(activeExpenseMonthly)}</div>
          <div className="summary-card-sub">From active subscriptions & bills</div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Spinner />
      ) : recurringList.length === 0 ? (
        <EmptyState
          icon={<MdAutorenew />}
          title="No recurring transactions"
          message="Set up recurring transactions for your rent, salary, Netflix, or wifi bill."
          actionLabel="Add Recurring Transaction"
          onAction={handleOpenCreateModal}
        />
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Frequency</th>
                  <th>Next Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recurringList.map((r) => (
                  <tr key={r._id} style={{ opacity: r.active ? 1 : 0.6 }}>
                    <td style={{ fontWeight: 500 }}>{r.description}</td>
                    <td>
                      <span className={`type-badge ${r.type}`}>
                        {r.type === 'income' ? '↑ Income' : '↓ Expense'}
                      </span>
                    </td>
                    <td>
                      <span className="category-badge">{r.category}</span>
                    </td>
                    <td>
                      <span className="badge badge-primary">{r.frequency}</span>
                    </td>
                    <td>
                      <MdCalendarToday style={{ verticalAlign: 'middle', marginRight: 4, fontSize: 13 }} />
                      {formatDate(r.nextDate)}
                    </td>
                    <td>
                      <span className={`amount-cell ${r.type}`}>
                        {r.type === 'income' ? '+' : '-'}
                        {formatCurrency(r.amount)}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`badge ${r.active ? 'badge-success' : 'badge-danger'}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                        onClick={() => handleToggleStatus(r)}
                        title="Click to toggle status"
                      >
                        {r.active ? <MdCheckCircle /> : <MdPause />}
                        {r.active ? 'Active' : 'Paused'}
                      </button>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button
                          className="btn-icon edit"
                          onClick={() => handleOpenEditModal(r)}
                          title="Edit"
                          id={`edit-rec-${r._id}`}
                        >
                          <MdEdit />
                        </button>
                        <button
                          className="btn-icon delete"
                          onClick={() => setDeleteId(r._id)}
                          title="Delete"
                          id={`delete-rec-${r._id}`}
                        >
                          <MdDelete />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingItem ? 'Edit Recurring Schedule' : 'New Recurring Transaction'}</h2>
              <button className="modal-close-btn" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {formError && <div className="alert alert-error">{formError}</div>}

                <div className="form-group">
                  <label className="form-label">Type <span>*</span></label>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="recurring-type"
                        value="expense"
                        checked={formData.type === 'expense'}
                        onChange={() => {
                          const expCats = categories.expense || [];
                          setFormData({
                            ...formData,
                            type: 'expense',
                            category: expCats.length > 0 ? expCats[0] : 'Bills',
                          });
                        }}
                      />
                      Expense
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="recurring-type"
                        value="income"
                        checked={formData.type === 'income'}
                        onChange={() => {
                          const incCats = categories.income || [];
                          setFormData({
                            ...formData,
                            type: 'income',
                            category: incCats.length > 0 ? incCats[0] : 'Salary',
                          });
                        }}
                      />
                      Income
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="recurring-desc">
                    Description <span>*</span>
                  </label>
                  <input
                    id="recurring-desc"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Netflix, Wifi, Office Salary, Apartment Rent"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    maxLength={200}
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="recurring-amount">
                    Amount <span>*</span>
                  </label>
                  <input
                    id="recurring-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="form-control"
                    placeholder="e.g. 999"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="recurring-category">
                    Category <span>*</span>
                  </label>
                  <select
                    id="recurring-category"
                    className="form-control"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {(formData.type === 'expense' ? categories.expense : categories.income).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="recurring-freq">
                    Frequency <span>*</span>
                  </label>
                  <select
                    id="recurring-freq"
                    className="form-control"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  >
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="recurring-date">
                    Next Due Date <span>*</span>
                  </label>
                  <input
                    id="recurring-date"
                    type="date"
                    className="form-control"
                    value={formData.nextDate}
                    onChange={(e) => setFormData({ ...formData, nextDate: e.target.value })}
                    required
                  />
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
                  id="submit-recurring-btn"
                >
                  {saving ? 'Saving...' : editingItem ? 'Update Schedule' : 'Create Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={!!deleteId}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  );
}

export default RecurringTransactions;
