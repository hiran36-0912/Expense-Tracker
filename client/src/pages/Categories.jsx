import { useState, useEffect } from 'react';
import {
  MdCategory,
  MdAdd,
  MdEdit,
  MdDelete,
  MdLock,
  MdCheckCircle,
} from 'react-icons/md';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/categoryService';
import { useToast } from '../context/ToastContext';

function Categories() {
  const { addToast } = useToast();

  const [categoriesData, setCategoriesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add/Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('expense');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getCategories();
      setCategoriesData(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setType('expense');
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setType(cat.type);
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Category name is required');
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory._id, {
          name: name.trim(),
          type,
        });
        addToast(`Category '${name}' updated`, 'success');
      } else {
        await createCategory({
          name: name.trim(),
          type,
        });
        addToast(`Category '${name}' added`, 'success');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await deleteCategory(deleteId);
      setDeleteId(null);
      addToast('Category deleted successfully', 'success');
      fetchCategories();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete category', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Spinner />;

  const defaults = categoriesData?.defaults || { expense: [], income: [] };
  const customList = categoriesData?.custom || [];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1 className="page-title">Category Management</h1>
            <p className="page-subtitle">Configure system default categories and personalized custom spending tags</p>
          </div>
          <button className="btn btn-primary" onClick={handleOpenCreateModal} id="add-category-btn">
            <MdAdd /> Add Custom Category
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="dashboard-grid" style={{ marginBottom: 24 }}>
        {/* Custom User Categories Card */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MdCategory style={{ color: 'var(--primary)', fontSize: 20 }} />
              <h2 className="card-title">My Custom Categories</h2>
            </div>
            <span className="badge badge-primary">{customList.length} Custom</span>
          </div>
          <div className="card-body">
            {customList.length === 0 ? (
              <EmptyState
                icon={<MdCategory />}
                title="No custom categories yet"
                message="Add categories like Gym, Pets, Gaming, or Personal Care to personalize your tracking."
                actionLabel="Add Category"
                onAction={handleOpenCreateModal}
              />
            ) : (
              <div className="category-tag-list">
                {customList.map((cat) => (
                  <div key={cat._id} className="category-tag-card">
                    <div>
                      <div className="category-tag-name">{cat.name}</div>
                      <span className={`type-badge ${cat.type}`}>
                        {cat.type.charAt(0).toUpperCase() + cat.type.slice(1)}
                      </span>
                    </div>
                    <div className="actions-cell">
                      <button
                        className="btn-icon edit"
                        onClick={() => handleOpenEditModal(cat)}
                        title="Rename"
                        id={`edit-cat-${cat._id}`}
                      >
                        <MdEdit />
                      </button>
                      <button
                        className="btn-icon delete"
                        onClick={() => setDeleteId(cat._id)}
                        title="Delete"
                        id={`delete-cat-${cat._id}`}
                      >
                        <MdDelete />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* System Default Categories Card */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MdLock style={{ color: 'var(--gray-500)', fontSize: 20 }} />
              <h2 className="card-title">System Default Categories</h2>
            </div>
            <span className="badge">Built-in</span>
          </div>
          <div className="card-body">
            <h4 style={{ fontSize: 13, textTransform: 'uppercase', color: 'var(--gray-500)', marginBottom: 10 }}>
              Expense Categories
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {defaults.expense.map((c) => (
                <span key={c} className="badge badge-pill">
                  {c}
                </span>
              ))}
            </div>

            <h4 style={{ fontSize: 13, textTransform: 'uppercase', color: 'var(--gray-500)', marginBottom: 10 }}>
              Income Categories
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {defaults.income.map((c) => (
                <span key={c} className="badge badge-pill badge-success">
                  {c}
                </span>
              ))}
            </div>

            <hr className="divider" style={{ margin: '20px 0' }} />
            <p className="text-xs text-muted">
              Built-in categories ensure standard reporting consistency across all financial statements and analytics.
            </p>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingCategory ? 'Edit Category' : 'Add Custom Category'}</h2>
              <button className="modal-close-btn" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {formError && <div className="alert alert-error">{formError}</div>}

                <div className="form-group">
                  <label className="form-label" htmlFor="category-name">
                    Category Name <span>*</span>
                  </label>
                  <input
                    id="category-name"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Gym, Pets, Gaming, Gadgets"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={50}
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="category-type">
                    Category Type <span>*</span>
                  </label>
                  <select
                    id="category-type"
                    className="form-control"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                    <option value="both">Both (Income & Expense)</option>
                  </select>
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
                  id="submit-category-btn"
                >
                  {saving ? 'Saving...' : editingCategory ? 'Save Changes' : 'Add Category'}
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

export default Categories;
