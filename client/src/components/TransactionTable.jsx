import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiDownload } from 'react-icons/fi';
import { MdSearch, MdSwapVert } from 'react-icons/md';
import { TbReceipt } from 'react-icons/tb';
import DeleteConfirmModal from './DeleteConfirmModal';
import EmptyState from './EmptyState';
import { deleteTransaction } from '../services/transactionService';

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

const ALL_CATEGORIES = ['All', ...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES.filter((c) => c !== 'Other'), 'Other'];

function TransactionTable({ transactions, onRefresh }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('desc');
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const filtered = useMemo(() => {
    let result = [...transactions];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }

    if (typeFilter !== 'all') {
      result = result.filter((t) => t.type === typeFilter);
    }

    if (categoryFilter !== 'All') {
      result = result.filter((t) => t.category === categoryFilter);
    }

    result.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [transactions, search, typeFilter, categoryFilter, sortOrder]);

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteTransaction(deleteId);
      setDeleteId(null);
      onRefresh();
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete transaction');
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCSV = () => {
    if (filtered.length === 0) return;

    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount (INR)'];
    const rows = filtered.map((t) => [
      `"${new Date(t.date).toISOString().split('T')[0]}"`,
      `"${t.type}"`,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.amount,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `ExpenseTrack_Transactions_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {deleteError && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          {deleteError}
        </div>
      )}

      {/* Filters & Export Bar */}
      <div className="filters-bar">
        <div className="search-input-wrapper">
          <MdSearch />
          <input
            type="text"
            className="form-control"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="search-transactions"
          />
        </div>

        <select
          className="form-control filter-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          id="filter-type"
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select
          className="form-control filter-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          id="filter-category"
        >
          {ALL_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c === 'All' ? 'All Categories' : c}
            </option>
          ))}
        </select>

        <button
          className="btn btn-outline btn-sm"
          onClick={handleExportCSV}
          disabled={filtered.length === 0}
          title="Export filtered transactions to CSV spreadsheet"
          id="export-csv-btn"
          style={{ height: 42 }}
        >
          <FiDownload /> Export CSV
        </button>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<TbReceipt />}
          title="No transactions found"
          message={
            search || typeFilter !== 'all' || categoryFilter !== 'All'
              ? 'Try adjusting your filters.'
              : 'You have no transactions yet.'
          }
          actionLabel={!search && typeFilter === 'all' && categoryFilter === 'All' ? 'Add Transaction' : undefined}
          actionTo="/add-transaction"
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th
                  className="sortable"
                  onClick={() =>
                    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))
                  }
                  id="sort-date-btn"
                >
                  Date{' '}
                  <MdSwapVert
                    style={{ fontSize: 14, verticalAlign: 'middle' }}
                  />
                </th>
                <th>Type</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t._id}>
                  <td>{formatDate(t.date)}</td>
                  <td>
                    <span className={`type-badge ${t.type}`}>
                      {t.type === 'income' ? '↑' : '↓'} {t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                    </span>
                  </td>
                  <td>
                    <span className="category-badge">{t.category}</span>
                  </td>
                  <td style={{ maxWidth: 200, wordBreak: 'break-word' }}>
                    {t.description}
                  </td>
                  <td>
                    <span className={`amount-cell ${t.type}`}>
                      {t.type === 'income' ? '+' : '-'}
                      {formatCurrency(t.amount)}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button
                        className="btn-icon edit"
                        title="Edit"
                        onClick={() => navigate(`/edit-transaction/${t._id}`)}
                        id={`edit-btn-${t._id}`}
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        className="btn-icon delete"
                        title="Delete"
                        onClick={() => setDeleteId(t._id)}
                        id={`delete-btn-${t._id}`}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={!!deleteId}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </>
  );
}

export default TransactionTable;
