import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  MdDashboard,
  MdSwapHoriz,
  MdAnalytics,
  MdAddCircleOutline,
  MdPerson,
  MdLogout,
  MdMenu,
  MdClose,
  MdWallet,
} from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
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
    { to: '/analytics', icon: <MdAnalytics />, label: 'Analytics' },
    { to: '/add-transaction', icon: <MdAddCircleOutline />, label: 'Add Transaction' },
    { to: '/profile', icon: <MdPerson />, label: 'Profile' },
  ];

  const SidebarContent = () => (
    <div className="sidebar">
      <div className="sidebar-brand">
        <Link to="/dashboard" className="sidebar-logo" onClick={closeSidebar}>
          <div className="sidebar-logo-icon">
            <MdWallet />
          </div>
          <span className="sidebar-logo-text">
            Expense<span>Track</span>
          </span>
        </Link>
      </div>

      <div className="sidebar-user">
        <div className="sidebar-user-name">
          {user?.name || 'User'}
        </div>
        <div className="sidebar-user-label">Personal Account</div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-nav-section-label">Menu</div>
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            onClick={closeSidebar}
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout} id="logout-btn">
          <MdLogout />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-brand">
          <Link to="/dashboard" className="sidebar-logo" onClick={closeSidebar}>
            <div className="sidebar-logo-icon">
              <MdWallet />
            </div>
            <span className="sidebar-logo-text">
              Expense<span>Track</span>
            </span>
          </Link>
        </div>

        <div className="sidebar-user">
          <div className="sidebar-user-name">{user?.name || 'User'}</div>
          <div className="sidebar-user-label">Personal Account</div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-nav-section-label">Menu</div>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={closeSidebar}
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout} id="logout-btn">
            <MdLogout />
            Logout
          </button>
        </div>
      </div>

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
            Expense<span>Track</span>
          </span>
        </Link>
        <div style={{ width: 32 }} />
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
