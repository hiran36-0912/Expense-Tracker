import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiDownload, FiRotateCcw } from 'react-icons/fi';
import { MdSearch, MdSwapVert, MdFilterList } from 'react-icons/md';
import { TbReceipt } from 'react-icons/tb';
import DeleteConfirmModal from './DeleteConfirmModal';
import EmptyState from './EmptyState';
import { deleteTransaction } from '../services/transactionService';
import { getCategories } from '../services/categoryService';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';

function TransactionTable({ transactions, onRefresh }) {
  const navigate = useNavigate();
  const { formatCurrency, symbol } = useCurrency();
  const { addToast } = useToast();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOption, setSortOption] = useState('newest'); // newest, oldest, highest, lowest
  const [categoriesList, setCategoriesList] = useState(['All']);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Load categories for filter dropdown
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const { data } = await getCategories();
        const allCats = data.all || [];
        setCategoriesList(['All', ...allCats]);
      } catch (e) {
        // Fallback to categories present in transactions
        const existingCats = Array.from(new Set(transactions.map((t) => t.category)));
        setCategoriesList(['All', ...existingCats]);
      }
    };
    fetchCats();
  }, [transactions]);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('default', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  // Filtered and sorted dataset
  const filtered = useMemo(() => {
    let result = [...transactions];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          (t.description || '').toLowerCase().includes(q) ||
          (t.category || '').toLowerCase().includes(q)
      );
    }

    if (typeFilter !== 'all') {
      result = result.filter((t) => t.type === typeFilter);
    }

    if (categoryFilter !== 'All') {
      result = result.filter((t) => t.category === categoryFilter);
    }

    if (startDate) {
      const start = new Date(startDate);
      result = result.filter((t) => new Date(t.date) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter((t) => new Date(t.date) <= end);
    }

    result.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (sortOption === 'newest') return dateB - dateA;
      if (sortOption === 'oldest') return dateA - dateB;
      if (sortOption === 'highest') return b.amount - a.amount;
      if (sortOption === 'lowest') return a.amount - b.amount;
      return dateB - dateA;
    });

    return result;
  }, [transactions, search, typeFilter, categoryFilter, startDate, endDate, sortOption]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter, categoryFilter, startDate, endDate, sortOption]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setCategoryFilter('All');
    setStartDate('');
    setEndDate('');
    setSortOption('newest');
    setCurrentPage(1);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteTransaction(deleteId);
      setDeleteId(null);
      addToast('Transaction deleted successfully', 'success');
      onRefresh();
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete transaction');
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCSV = () => {
    if (filtered.length === 0) return;

    const headers = ['Date', 'Type', 'Category', 'Description', `Amount (${symbol})`];
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
    addToast('Transactions exported to CSV successfully', 'success');
  };

  return (
    <>
      {deleteError && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          {deleteError}
        </div>
      )}

      {/* Advanced Filter, Search, Sort & Export Controls */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ padding: 16 }}>
          <div className="filters-grid">
            {/* Search Input */}
            <div className="search-input-wrapper">
              <MdSearch />
              <input
                type="text"
                className="form-control"
                placeholder="Search description or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                id="search-transactions"
              />
            </div>

            {/* Type Filter */}
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

            {/* Category Filter */}
            <select
              className="form-control filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              id="filter-category"
            >
              {categoriesList.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Categories' : c}
                </option>
              ))}
            </select>

            {/* Sort Order */}
            <select
              className="form-control filter-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              id="sort-select"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="highest">Sort: Highest Amount</option>
              <option value="lowest">Sort: Lowest Amount</option>
            </select>
          </div>

          {/* Date Range & Actions Row */}
          <div className="filters-sub-row">
            <div className="date-filter-group">
              <label className="filter-label">From:</label>
              <input
                type="date"
                className="form-control date-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                id="filter-start-date"
              />
              <label className="filter-label">To:</label>
              <input
                type="date"
                className="form-control date-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                id="filter-end-date"
              />
            </div>

            <div className="filter-actions-group">
              <button
                className="btn btn-outline btn-sm"
                onClick={handleResetFilters}
                id="reset-filters-btn"
                title="Clear all filters and reset list"
              >
                <FiRotateCcw /> Reset Filters
              </button>

              <button
                className="btn btn-outline btn-sm export-btn"
                onClick={handleExportCSV}
                disabled={filtered.length === 0}
                title="Export filtered transactions to CSV"
                id="export-csv-btn"
              >
                <FiDownload /> Export CSV ({filtered.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<TbReceipt />}
          title="No transactions found"
          message={
            search || typeFilter !== 'all' || categoryFilter !== 'All' || startDate || endDate
              ? 'No matching transactions found with active filters.'
              : 'You have no transactions yet.'
          }
          actionLabel={
            !search && typeFilter === 'all' && categoryFilter === 'All' && !startDate && !endDate
              ? 'Add Transaction'
              : undefined
          }
          actionTo="/add-transaction"
        />
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.map((t) => (
                  <tr key={t._id}>
                    <td>{formatDate(t.date)}</td>
                    <td>
                      <span className={`type-badge ${t.type}`}>
                        {t.type === 'income' ? '↑ Income' : '↓ Expense'}
                      </span>
                    </td>
                    <td>
                      <span className="category-badge">{t.category}</span>
                    </td>
                    <td style={{ maxWidth: 240, wordBreak: 'break-word' }}>
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination-bar">
              <div className="pagination-info text-xs text-muted">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} records
              </div>

              <div className="pagination-controls">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  id="pagination-prev"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    className={`pagination-num ${currentPage === num ? 'active' : ''}`}
                    onClick={() => setCurrentPage(num)}
                  >
                    {num}
                  </button>
                ))}

                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  id="pagination-next"
                >
                  Next
                </button>
              </div>
            </div>
          )}
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
