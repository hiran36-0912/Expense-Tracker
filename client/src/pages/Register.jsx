import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdWallet, MdErrorOutline, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    else if (formData.name.trim().length > 50) newErrors.name = 'Name cannot exceed 50 characters';

    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Enter a valid email address';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      await register(formData.name.trim(), formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <MdWallet />
          </div>
          <span className="auth-logo-text">
            Expense<span>Track</span>
          </span>
        </div>

        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Start tracking your finances today</p>

        {apiError && (
          <div className="alert alert-error">
            <MdErrorOutline style={{ flexShrink: 0 }} />
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name <span>*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              className={`form-control${errors.name ? ' error' : ''}`}
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
            />
            {errors.name && (
              <div className="form-error">
                <MdErrorOutline /> {errors.name}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address <span>*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              className={`form-control${errors.email ? ' error' : ''}`}
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
            {errors.email && (
              <div className="form-error">
                <MdErrorOutline /> {errors.email}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password <span>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 6 characters"
                className={`form-control${errors.password ? ' error' : ''}`}
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                style={{ paddingRight: 42 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  fontSize: 20,
                  display: 'flex',
                  cursor: 'pointer',
                }}
                id="toggle-password-btn"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>
            {errors.password && (
              <div className="form-error">
                <MdErrorOutline /> {errors.password}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password <span>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter your password"
                className={`form-control${errors.confirmPassword ? ' error' : ''}`}
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                style={{ paddingRight: 42 }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((p) => !p)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  fontSize: 20,
                  display: 'flex',
                  cursor: 'pointer',
                }}
                id="toggle-confirm-password-btn"
                aria-label="Toggle confirm password visibility"
              >
                {showConfirmPassword ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>
            {errors.confirmPassword && (
              <div className="form-error">
                <MdErrorOutline /> {errors.confirmPassword}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
            id="register-btn"
          >
            {loading ? (
              <>
                <div className="spinner sm" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
