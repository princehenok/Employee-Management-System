import React from 'react';
import './Header.css';

function Header({ title, subtitle, icon }) {
  return (
    <header className="header-container">
      {icon && <i className={`bi ${icon} header-icon`}></i>}
      <h1 className="header-title">{title}</h1>
      {subtitle && <p className="header-subtitle">{subtitle}</p>}
    </header>
  );
}

export default Header;
