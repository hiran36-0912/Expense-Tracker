import { useState, useEffect } from 'react';
import {
  MdAdd,
  MdSavings,
  MdEdit,
  MdDelete,
  MdCheckCircle,
  MdCalendarToday,
  MdAttachMoney,
} from 'react-icons/md';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import {
  getGoals,
  createGoal,
  updateGoal,
  addMoneyToGoal,
  deleteGoal,
} from '../services/goalService';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';

function SavingsGoals() {
  const { formatCurrency } = useCurrency();
  const { addToast } = useToast();

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add/Edit Goal Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Add Money Modal
  const [depositGoal, setDepositGoal] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositError, setDepositError] = useState('');
  const [depositing, setDepositing] = useState(false);

  // Delete modal
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchGoals = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getGoals();
      setGoals(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load savings goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('default', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const handleOpenCreateModal = () => {
    setEditingGoal(null);
    setFormData({
      name: '',
      targetAmount: '',
      currentAmount: '0',
      targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (g) => {
    setEditingGoal(g);
    setFormData({
      name: g.name,
      targetAmount: g.targetAmount.toString(),
      currentAmount: g.currentAmount.toString(),
      targetDate: new Date(g.targetDate).toISOString().split('T')[0],
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Goal name is required');
      return;
    }

    const numTarget = parseFloat(formData.targetAmount);
    if (isNaN(numTarget) || numTarget <= 0) {
      setFormError('Target amount must be greater than 0');
      return;
    }

    const numCurrent = parseFloat(formData.currentAmount) || 0;
    if (numCurrent < 0) {
      setFormError('Current amount cannot be negative');
      return;
    }

    if (!formData.targetDate) {
      setFormError('Target completion date is required');
      return;
    }

    setSaving(true);
    try {
      if (editingGoal) {
        await updateGoal(editingGoal._id, {
          name: formData.name.trim(),
          targetAmount: numTarget,
          currentAmount: numCurrent,
          targetDate: formData.targetDate,
        });
        addToast(`Savings goal '${formData.name}' updated`, 'success');
      } else {
        await createGoal({
          name: formData.name.trim(),
          targetAmount: numTarget,
          currentAmount: numCurrent,
          targetDate: formData.targetDate,
        });
        addToast(`Savings goal '${formData.name}' created`, 'success');
      }
      setModalOpen(false);
      fetchGoals();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save goal');
    } finally {
      setSaving(false);
    }
  };

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    setDepositError('');

    const num = parseFloat(depositAmount);
    if (isNaN(num) || num <= 0) {
      setDepositError('Please enter a valid positive amount');
      return;
    }

    setDepositing(true);
    try {
      await addMoneyToGoal(depositGoal._id, num);
      addToast(`Added ${formatCurrency(num)} to '${depositGoal.name}'!`, 'success');
      setDepositGoal(null);
      setDepositAmount('');
      fetchGoals();
    } catch (err) {
      setDepositError(err.response?.data?.message || 'Failed to deposit money');
    } finally {
      setDepositing(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await deleteGoal(deleteId);
      setDeleteId(null);
      addToast('Savings goal deleted', 'success');
      fetchGoals();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete goal', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const totalTargetAll = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSavedAll = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const completedCount = goals.filter((g) => g.isCompleted).length;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1 className="page-title">Savings Goals</h1>
            <p className="page-subtitle">Set milestone targets, deposit savings, and track your progress</p>
          </div>
          <button className="btn btn-primary" onClick={handleOpenCreateModal} id="create-goal-btn">
            <MdAdd /> Create Goal
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* KPI Stats */}
      <div className="summary-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: 24 }}>
        <div className="summary-card">
          <div className="summary-card-header">
            <span className="summary-card-label">Total Target</span>
            <div className="summary-card-icon balance"><MdSavings /></div>
          </div>
          <div className="summary-card-amount">{formatCurrency(totalTargetAll)}</div>
          <div className="summary-card-sub">{goals.length} Goals Created</div>
        </div>

        <div className="summary-card">
          <div className="summary-card-header">
            <span className="summary-card-label">Total Accumulated</span>
            <div className="summary-card-icon income"><MdCheckCircle /></div>
          </div>
          <div className="summary-card-amount" style={{ color: 'var(--success)' }}>
            {formatCurrency(totalSavedAll)}
          </div>
          <div className="summary-card-sub">
            {totalTargetAll > 0 ? `${((totalSavedAll / totalTargetAll) * 100).toFixed(0)}% of cumulative goal` : 'No goals'}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-card-header">
            <span className="summary-card-label">Completed Goals</span>
            <div className="summary-card-icon income"><MdCheckCircle /></div>
          </div>
          <div className="summary-card-amount">{completedCount}</div>
          <div className="summary-card-sub">{goals.length - completedCount} in progress</div>
        </div>
      </div>

      {/* Goals Grid */}
      {loading ? (
        <Spinner />
      ) : goals.length === 0 ? (
        <EmptyState
          icon={<MdSavings />}
          title="No savings goals yet"
          message="Plan for your dream vacation, emergency fund, or next laptop by creating a goal."
          actionLabel="Create First Goal"
          onAction={handleOpenCreateModal}
        />
      ) : (
        <div className="budget-grid">
          {goals.map((g) => (
            <div key={g._id} className={`budget-card card ${g.isCompleted ? 'border-success' : ''}`}>
              <div className="budget-card-header">
                <div>
                  <h3 className="budget-card-title">{g.name}</h3>
                  <span className="text-xs text-muted">
                    <MdCalendarToday style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    Target: {formatDate(g.targetDate)}
                  </span>
                </div>
                <div className="actions-cell">
                  <button
                    className="btn-icon edit"
                    onClick={() => handleOpenEditModal(g)}
                    title="Edit goal"
                    id={`edit-goal-${g._id}`}
                  >
                    <MdEdit />
                  </button>
                  <button
                    className="btn-icon delete"
                    onClick={() => setDeleteId(g._id)}
                    title="Delete goal"
                    id={`delete-goal-${g._id}`}
                  >
                    <MdDelete />
                  </button>
                </div>
              </div>

              <div className="budget-card-body">
                <div className="budget-numbers">
                  <div className="budget-spent-ratio">
                    <span className="spent-val" style={{ color: g.isCompleted ? 'var(--success-dark)' : 'inherit' }}>
                      {formatCurrency(g.currentAmount)}
                    </span>
                    <span className="total-val"> / {formatCurrency(g.targetAmount)}</span>
                  </div>
                  <div className="budget-percentage" style={{ color: g.isCompleted ? 'var(--success)' : 'inherit' }}>
                    {g.progressPercentage}%
                  </div>
                </div>

                <div className="progress-bar-container">
                  <div
                    className={`progress-bar-fill ${g.isCompleted ? 'success' : 'primary'}`}
                    style={{ width: `${Math.min(100, g.progressPercentage)}%` }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
                  {g.isCompleted ? (
                    <span className="badge badge-success">
                      <MdCheckCircle /> Goal Completed!
                    </span>
                  ) : (
                    <span className="text-xs text-muted">
                      Remaining: <strong>{formatCurrency(g.remaining)}</strong>
                    </span>
                  )}

                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setDepositGoal(g);
                      setDepositAmount('');
                      setDepositError('');
                    }}
                    id={`deposit-btn-${g._id}`}
                    style={{ padding: '4px 10px', fontSize: 12 }}
                  >
                    <MdAttachMoney /> Add Money
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Goal Modal */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingGoal ? 'Edit Savings Goal' : 'Create New Savings Goal'}</h2>
              <button className="modal-close-btn" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {formError && <div className="alert alert-error">{formError}</div>}

                <div className="form-group">
                  <label className="form-label" htmlFor="goal-name">
                    Goal Name <span>*</span>
                  </label>
                  <input
                    id="goal-name"
                    type="text"
                    className="form-control"
                    placeholder="e.g. New Laptop, Bike, College Fees"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    maxLength={100}
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="goal-target">
                    Target Amount <span>*</span>
                  </label>
                  <input
                    id="goal-target"
                    type="number"
                    step="0.01"
                    min="1"
                    className="form-control"
                    placeholder="e.g. 60000"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="goal-current">
                    Current Amount Saved
                  </label>
                  <input
                    id="goal-current"
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control"
                    placeholder="0"
                    value={formData.currentAmount}
                    onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="goal-date">
                    Target Date <span>*</span>
                  </label>
                  <input
                    id="goal-date"
                    type="date"
                    className="form-control"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
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
                  id="submit-goal-btn"
                >
                  {saving ? 'Saving...' : editingGoal ? 'Update Goal' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Money Modal */}
      {depositGoal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Deposit Money to '{depositGoal.name}'</h2>
              <button className="modal-close-btn" onClick={() => setDepositGoal(null)}>×</button>
            </div>
            <form onSubmit={handleDepositSubmit}>
              <div className="modal-body">
                {depositError && <div className="alert alert-error">{depositError}</div>}

                <div style={{ marginBottom: 16, fontSize: 13 }}>
                  <div>Current Saved: <strong>{formatCurrency(depositGoal.currentAmount)}</strong></div>
                  <div>Target Amount: <strong>{formatCurrency(depositGoal.targetAmount)}</strong></div>
                  <div>Remaining to Goal: <strong>{formatCurrency(depositGoal.remaining)}</strong></div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="deposit-input">
                    Amount to Add <span>*</span>
                  </label>
                  <input
                    id="deposit-input"
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="form-control"
                    placeholder="e.g. 500"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setDepositGoal(null)}
                  disabled={depositing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={depositing}
                  id="confirm-deposit-btn"
                >
                  {depositing ? 'Processing...' : 'Deposit Amount'}
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

export default SavingsGoals;
