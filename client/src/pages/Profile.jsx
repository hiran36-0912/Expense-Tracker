import { useState } from 'react';
import {
  MdPerson,
  MdEdit,
  MdCheckCircle,
  MdEmail,
  MdCalendarToday,
  MdLock,
  MdKey,
} from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword } from '../services/userService';
import { useToast } from '../context/ToastContext';

function Profile() {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();

  // Name editing
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [nameError, setNameError] = useState('');
  const [nameLoading, setNameLoading] = useState(false);

  // Password changing
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('default', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

  const getInitials = (n) => {
    if (!n) return 'U';
    return n
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSaveName = async (e) => {
    e.preventDefault();
    setNameError('');

    if (!name.trim()) {
      setNameError('Name is required');
      return;
    }
    if (name.trim().length > 50) {
      setNameError('Name cannot exceed 50 characters');
      return;
    }

    setNameLoading(true);
    try {
      const { data } = await updateProfile({ name: name.trim() });
      updateUser(data);
      addToast('Profile name updated successfully', 'success');
      setEditingName(false);
    } catch (err) {
      setNameError(err.response?.data?.message || 'Failed to update name');
    } finally {
      setNameLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All password fields are required');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword(passwordData);
      setPasswordSuccess('Password changed successfully!');
      addToast('Password changed successfully!', 'success');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => setPasswordSuccess(''), 4000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">User Profile</h1>
        <p className="page-subtitle">Manage your personal credentials, identity, and account security</p>
      </div>

      <div className="profile-grid">
        {/* Profile Card */}
        <div className="card profile-card">
          <div className="card-body">
            <div className="profile-avatar">{getInitials(user?.name)}</div>

            {editingName ? (
              <form onSubmit={handleSaveName} style={{ marginBottom: 24 }}>
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
                  {nameError && <div className="form-error">{nameError}</div>}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={nameLoading}
                    id="save-profile-btn"
                  >
                    {nameLoading ? 'Saving...' : 'Save Name'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setName(user?.name || '');
                      setNameError('');
                      setEditingName(false);
                    }}
                    disabled={nameLoading}
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
                      onClick={() => setEditingName(true)}
                      id="edit-name-btn"
                      style={{ padding: '3px 10px', fontSize: 12 }}
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
                    Account Creation Date
                  </span>
                  <span className="profile-info-value">
                    {user?.createdAt ? formatDate(user.createdAt) : 'Member'}
                  </span>
                </div>
              </div>
            )}

            <hr className="divider" />
            <p className="text-xs text-muted">
              Your registered email address serves as your primary login identifier and cannot be modified directly.
            </p>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MdLock style={{ color: 'var(--primary)', fontSize: 20 }} />
              <h2 className="card-title">Security & Password</h2>
            </div>
          </div>
          <div className="card-body">
            {passwordError && <div className="alert alert-error">{passwordError}</div>}
            {passwordSuccess && (
              <div className="alert alert-success">
                <MdCheckCircle /> {passwordSuccess}
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label className="form-label" htmlFor="current-password">
                  Current Password <span>*</span>
                </label>
                <input
                  id="current-password"
                  type="password"
                  className="form-control"
                  placeholder="Enter current password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="new-password">
                  New Password <span>*</span>
                </label>
                <input
                  id="new-password"
                  type="password"
                  className="form-control"
                  placeholder="Minimum 6 characters"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirm-password">
                  Confirm New Password <span>*</span>
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  className="form-control"
                  placeholder="Re-enter new password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={passwordLoading}
                id="change-password-btn"
                style={{ marginTop: 10 }}
              >
                <MdKey /> {passwordLoading ? 'Updating Password...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
