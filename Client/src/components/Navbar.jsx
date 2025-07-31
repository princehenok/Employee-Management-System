import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  const navItems = [
    { path: '/', label: 'Home', icon: 'bi-house-door-fill' },
    { path: '/employees', label: 'Employees', icon: 'bi-person-lines-fill' },
    { path: '/add', label: 'Add Employee', icon: 'bi-person-plus-fill' },
    { path: '/about', label: 'About', icon: 'bi-info-circle-fill' },
    { path: '/signin', label: 'Sign In', icon: 'bi-box-arrow-in-right' },
    { path: '/signup', label: 'Sign Up', icon: 'bi-person-plus' },
  ];

  return (
    <nav className={`navbar ${menuOpen ? 'expanded' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <i className="bi bi-people-fill logo-icon"></i>
          <span className="brand-name">EMS Central</span>
        </Link>

        <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
          <span className="menu-icon">{menuOpen ? '✕' : '☰'}</span>
        </button>

        <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {navItems.map(({ path, label, icon }) => (
            <li key={path}>
              <Link
                to={path}
                className={`nav-link ${pathname === path ? 'active' : ''}`}
                onClick={closeMenu}
              >
                <i className={`bi ${icon}`}></i> {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
