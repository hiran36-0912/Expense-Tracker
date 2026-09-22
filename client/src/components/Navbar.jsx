import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  MdDashboard,
  MdSwapHoriz,
  MdAddCircleOutline,
  MdPieChart,
  MdSavings,
  MdAutorenew,
  MdAssessment,
  MdCategory,
  MdPerson,
  MdLogout,
  MdMenu,
  MdClose,
  MdWallet,
  MdDarkMode,
  MdLightMode,
} from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';

function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { currency, setCurrency, currencies } = useCurrency();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  const navLinks = [
    { to: '/dashboard', icon: <MdDashboard />, label: 'Dashboard' },
    { to: '/transactions', icon: <MdSwapHoriz />, label: 'Transactions' },
    { to: '/add-transaction', icon: <MdAddCircleOutline />, label: 'Add Transaction' },
    { to: '/budgets', icon: <MdPieChart />, label: 'Budgets' },
    { to: '/goals', icon: <MdSavings />, label: 'Savings Goals' },
    { to: '/recurring', icon: <MdAutorenew />, label: 'Recurring' },
    { to: '/reports', icon: <MdAssessment />, label: 'Reports' },
    { to: '/categories', icon: <MdCategory />, label: 'Categories' },
    { to: '/profile', icon: <MdPerson />, label: 'Profile' },
  ];

  const NavContent = () => (
    <>
      <div className="sidebar-brand">
        <Link to="/dashboard" className="sidebar-logo" onClick={closeSidebar}>
          <div className="sidebar-logo-icon">
            <MdWallet />
          </div>
          <span className="sidebar-logo-text">
            Expense<span>Track Pro</span>
          </span>
        </Link>
        <button
          className="sidebar-close-btn"
          onClick={closeSidebar}
          aria-label="Close menu"
        >
          <MdClose />
        </button>
      </div>

      <div className="sidebar-user">
        <div className="sidebar-user-avatar">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{user?.name || 'User'}</div>
          <div className="sidebar-user-label">{user?.email || 'Personal Account'}</div>
        </div>
      </div>

      {/* Quick Settings: Theme & Currency */}
      <div className="sidebar-quick-settings">
        <div className="quick-setting-item">
          <span className="setting-label">Theme</span>
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            id="theme-toggle-btn"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          >
            {isDark ? <MdLightMode /> : <MdDarkMode />}
            <span>{isDark ? 'Light' : 'Dark'}</span>
          </button>
        </div>

        <div className="quick-setting-item">
          <span className="setting-label">Currency</span>
          <select
            className="currency-select"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            id="currency-select"
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-nav-section-label">Main Menu</div>
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            onClick={closeSidebar}
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout} id="logout-btn">
          <MdLogout />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <NavContent />
      </aside>

      {/* Mobile Top Bar */}
      <div className="top-bar">
        <button
          className="hamburger-btn"
          onClick={() => setSidebarOpen(true)}
          id="hamburger-btn"
          aria-label="Open menu"
        >
          <MdMenu />
        </button>
        <Link to="/dashboard" className="sidebar-logo">
          <div className="sidebar-logo-icon" style={{ width: 32, height: 32, fontSize: 16 }}>
            <MdWallet />
          </div>
          <span className="sidebar-logo-text" style={{ fontSize: 16 }}>
            Expense<span>Track Pro</span>
          </span>
        </Link>
        <button
          className="theme-toggle-btn mobile-toggle"
          onClick={toggleTheme}
          aria-label="Toggle Theme"
        >
          {isDark ? <MdLightMode /> : <MdDarkMode />}
        </button>
      </div>

      {/* Mobile Overlay */}
      <div
        className={`sidebar-overlay${sidebarOpen ? ' visible' : ''}`}
        onClick={closeSidebar}
      />
    </>
  );
}

export default Navbar;
