import { useState } from 'react';
import { MdTrackChanges, MdEdit, MdCheck, MdClose, MdWarningAmber } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/userService';

function BudgetWidget({ currentMonthExpenses = 0, onBudgetUpdated }) {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [budgetInput, setBudgetInput] = useState(user?.budget || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const budget = Number(user?.budget || 0);
  const spent = Number(currentMonthExpenses || 0);
  const percentUsed = budget > 0 ? Math.min(Math.round((spent / budget) * 100), 100) : 0;
  const rawPercent = budget > 0 ? ((spent / budget) * 100).toFixed(1) : 0;
  const remaining = budget > 0 ? budget - spent : 0;
  const isOverBudget = budget > 0 && spent > budget;

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    setError('');

    const val = parseFloat(budgetInput);
    if (isNaN(val) || val < 0) {
      setError('Please enter a valid positive number');
      return;
    }

    setSaving(true);
    try {
      const { data } = await updateProfile({ budget: val });
      updateUser(data);
      setEditing(false);
      if (onBudgetUpdated) onBudgetUpdated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update budget');
    } finally {
      setSaving(false);
    }
  };

  // Determine progress status color
  let statusColor = 'var(--success)';
  let statusBg = 'var(--success-bg)';
  let statusBorder = 'var(--success-border)';
  let statusText = 'On Track';

  if (isOverBudget) {
    statusColor = 'var(--danger)';
    statusBg = 'var(--danger-bg)';
    statusBorder = 'var(--danger-border)';
    statusText = 'Budget Exceeded';
  } else if (rawPercent >= 80) {
    statusColor = 'var(--warning)';
    statusBg = 'var(--warning-bg)';
    statusBorder = 'var(--warning-border)';
    statusText = 'Near Limit';
  }

  return (
    <div className="card" style={{ marginBottom: 24, overflow: 'hidden' }}>
      <div className="card-header" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: 'var(--primary-bg)',
              border: '1px solid var(--primary-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              fontSize: 18,
            }}
          >
            <MdTrackChanges />
          </div>
          <div>
            <h2 className="card-title" style={{ fontSize: 15, marginBottom: 2 }}>
              Monthly Spending Budget
            </h2>
            <span className="text-sm text-muted" style={{ fontSize: 12 }}>
              Keep your monthly spending in check
            </span>
          </div>
        </div>

        {!editing && (
          <button
            className="btn btn-outline btn-sm"
            onClick={() => {
              setBudgetInput(user?.budget || '');
              setEditing(true);
            }}
            id="edit-budget-btn"
          >
            <MdEdit /> {budget > 0 ? 'Edit Limit' : 'Set Budget'}
          </button>
        )}
      </div>

      <div className="card-body" style={{ padding: '20px' }}>
        {editing ? (
          <form onSubmit={handleSaveBudget}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
                <span
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--gray-500)',
                    fontWeight: 600,
                  }}
                >
                  ₹
                </span>
                <input
                  type="number"
                  className={`form-control${error ? ' error' : ''}`}
                  style={{ paddingLeft: 28 }}
                  placeholder="e.g. 25000"
                  value={budgetInput}
                  onChange={(e) => {
                    setBudgetInput(e.target.value);
                    if (error) setError('');
                  }}
                  min="0"
                  step="100"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={saving}
                id="save-budget-btn"
              >
                <MdCheck /> {saving ? 'Saving...' : 'Save Limit'}
              </button>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setEditing(false)}
                disabled={saving}
              >
                <MdClose /> Cancel
              </button>
            </div>
            {error && <div className="form-error">{error}</div>}
          </form>
        ) : budget === 0 ? (
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--border-radius-sm)',
              background: 'var(--primary-bg)',
              border: '1px dashed var(--primary-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, color: 'var(--gray-800)', fontSize: 14 }}>
                No budget limit set for this month
              </div>
              <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>
                Setting a budget helps track remaining allowances and prevents overspending.
              </div>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setBudgetInput('');
                setEditing(true);
              }}
              id="set-budget-prompt-btn"
            >
              Set Monthly Limit
            </button>
          </div>
        ) : (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginBottom: 10,
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <div>
                <span style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 500 }}>
                  Spent this month
                </span>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--gray-900)' }}>
                  {formatCurrency(spent)}
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: 'var(--gray-400)',
                      marginLeft: 6,
                    }}
                  >
                    of {formatCurrency(budget)} limit
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '4px 10px',
                  borderRadius: 'var(--border-radius-pill)',
                  fontSize: 12,
                  fontWeight: 600,
                  background: statusBg,
                  color: statusColor,
                  border: `1px solid ${statusBorder}`,
                }}
              >
                {isOverBudget && <MdWarningAmber style={{ fontSize: 14 }} />}
                {statusText} ({rawPercent}%)
              </div>
            </div>

            {/* Progress Bar Container */}
            <div
              style={{
                width: '100%',
                height: 10,
                borderRadius: 999,
                background: 'var(--gray-100)',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
              }}
            >
              <div
                style={{
                  width: `${percentUsed}%`,
                  height: '100%',
                  borderRadius: 999,
                  background: statusColor,
                  transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            </div>

            {/* Bottom info pills */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 10,
                fontSize: 12,
                color: 'var(--gray-500)',
              }}
            >
              <span>0%</span>
              <span style={{ fontWeight: 500 }}>
                {isOverBudget ? (
                  <span style={{ color: 'var(--danger)' }}>
                    Exceeded by {formatCurrency(spent - budget)}
                  </span>
                ) : (
                  <span style={{ color: 'var(--success-dark)' }}>
                    {formatCurrency(remaining)} remaining
                  </span>
                )}
              </span>
              <span>100%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BudgetWidget;
