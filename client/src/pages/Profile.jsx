import { useState } from 'react';
import { MdPerson, MdEdit, MdCheckCircle, MdEmail, MdCalendarToday } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/userService';

function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [nameError, setNameError] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setNameError('');
    setApiError('');

    if (!name.trim()) {
      setNameError('Name is required');
      return;
    }
    if (name.trim().length > 50) {
      setNameError('Name cannot exceed 50 characters');
      return;
    }

    setLoading(true);
    try {
      const { data } = await updateProfile({ name: name.trim() });
      updateUser(data);
      setSuccess(true);
      setEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || '');
    setNameError('');
    setApiError('');
    setEditing(false);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Manage your account information</p>
      </div>

      <div className="card profile-card">
        <div className="card-body">
          {/* Avatar */}
          <div className="profile-avatar">{getInitials(user?.name)}</div>

          {apiError && (
            <div className="alert alert-error" style={{ marginBottom: 16 }}>
              {apiError}
            </div>
          )}

          {success && (
            <div className="alert alert-success" style={{ marginBottom: 16 }}>
              <MdCheckCircle />
              Profile updated successfully!
            </div>
          )}

          {/* Name Edit */}
          {editing ? (
            <form onSubmit={handleSave} style={{ marginBottom: 24 }}>
              <div className="form-group">
                <label htmlFor="profile-name" className="form-label">
                  Full Name <span>*</span>
                </label>
                <input
                  id="profile-name"
                  type="text"
                  className={`form-control${nameError ? ' error' : ''}`}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (nameError) setNameError('');
                  }}
                  maxLength={50}
                  autoFocus
                />
                {nameError && (
                  <div className="form-error">{nameError}</div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  id="save-profile-btn"
                >
                  {loading ? (
                    <>
                      <div className="spinner sm" /> Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleCancel}
                  disabled={loading}
                  id="cancel-edit-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-info-grid">
              <div className="profile-info-item">
                <span className="profile-info-label">
                  <MdPerson style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Full Name
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="profile-info-value">{user?.name}</span>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => setEditing(true)}
                    id="edit-name-btn"
                  >
                    <MdEdit /> Edit
                  </button>
                </div>
              </div>

              <div className="profile-info-item">
                <span className="profile-info-label">
                  <MdEmail style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Email Address
                </span>
                <span className="profile-info-value">{user?.email}</span>
              </div>

              <div className="profile-info-item">
                <span className="profile-info-label">
                  <MdCalendarToday style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Member Since
                </span>
                <span className="profile-info-value">
                  {user?.createdAt ? formatDate(user.createdAt) : '—'}
                </span>
              </div>
            </div>
          )}

          <hr className="divider" />
          <p className="text-sm text-muted">
            Your email address cannot be changed. Contact support if you need assistance.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Profile;
