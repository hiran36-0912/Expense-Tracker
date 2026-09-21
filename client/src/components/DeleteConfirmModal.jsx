import { MdWarning } from 'react-icons/md';
import { FiTrash2 } from 'react-icons/fi';

function DeleteConfirmModal({ isOpen, onConfirm, onCancel, loading }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-icon">
          <MdWarning />
        </div>
        <h3 className="modal-title">Delete Transaction</h3>
        <p className="modal-text">
          Are you sure you want to delete this transaction? This action cannot
          be undone.
        </p>
        <div className="modal-actions">
          <button
            className="btn btn-outline btn-full"
            onClick={onCancel}
            disabled={loading}
            id="cancel-delete-btn"
          >
            Cancel
          </button>
          <button
            className="btn btn-danger btn-full"
            onClick={onConfirm}
            disabled={loading}
            id="confirm-delete-btn"
          >
            {loading ? (
              <>
                <div className="spinner sm" />
                Deleting...
              </>
            ) : (
              <>
                <FiTrash2 />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;
