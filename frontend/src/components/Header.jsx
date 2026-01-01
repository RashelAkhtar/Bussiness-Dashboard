import React from "react";
import { NavLink } from 'react-router-dom';
import "../styles/Header.css";

export default function Header() {
  return (
    <header className="app-header card">
      <div className="brand">
        <h1>
          <NavLink to="/summary" className="brand-link">Business Dashboard</NavLink>
        </h1>
      </div>

      <nav className="nav-actions">
        <NavLink to="/summary" className={({isActive}) => isActive ? 'btn active' : 'btn'}>Summary</NavLink>
        <NavLink to="/products" className={({isActive}) => isActive ? 'btn active' : 'btn'}>Products</NavLink>
        <NavLink to="/sales" className={({isActive}) => isActive ? 'btn primary active' : 'btn primary'}>Record Sale</NavLink>
      </nav>
    </header>
  );
}
