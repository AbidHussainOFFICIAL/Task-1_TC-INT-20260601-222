import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const navLinks = user ? (
    <>
      <Link to="/dashboard" className="header-nav-link">Dashboard</Link>
      {user.role === 'Service Provider' && (
        <Link to="/profile/complete" className="header-nav-link">Complete Profile</Link>
      )}
      <button type="button" className="header-nav-link header-nav-btn" onClick={logout}>
        Logout
      </button>
    </>
  ) : (
    <>
      <Link to="/login" className="header-nav-link">Login</Link>
      <Link to="/register" className="header-nav-link header-nav-link-primary">Register</Link>
    </>
  );

  return (
    <header className="header-bar">
      <div className="header-bar-top">
        <Link to="/marketplace" className="header-bar-identity">
          {user ? (
            <>
              <strong>{user.name}</strong>
              <span>{user.role ? user.role : ''}</span>
            </>
          ) : (
            <>
              <strong>Service Marketplace</strong>
              <span>Browse and hire freelancers</span>
            </>
          )}
        </Link>

        <button
          type="button"
          className="header-menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="site-navigation"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="header-menu-icon" aria-hidden="true" />
        </button>
      </div>

      <nav
        id="site-navigation"
        className={`header-links ${menuOpen ? 'header-links-open' : ''}`}
        aria-label="Main navigation"
      >
        <Link to="/marketplace" className="header-nav-link">Marketplace</Link>
        {navLinks}
      </nav>

      {menuOpen && (
        <button
          type="button"
          className="header-backdrop"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </header>
  );
}
