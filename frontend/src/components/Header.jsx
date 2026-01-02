import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from 'react-router-dom';
import "../styles/Header.css";

export default function Header() {
  const [auth, setAuth] = useState(typeof window !== 'undefined' && localStorage.getItem('auth') === 'true');
  const navigate = useNavigate();

  useEffect(() => {
    const onStorage = () => setAuth(localStorage.getItem('auth') === 'true');
    window.addEventListener('storage', onStorage);
    const onAuthChanged = () => setAuth(localStorage.getItem('auth') === 'true');
    window.addEventListener('auth:changed', onAuthChanged);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('auth:changed', onAuthChanged);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth');
    setAuth(false);
    navigate('/login');
  };

  return (
    <header className="app-header card">
      <div className="brand">
        <h1>
          <NavLink to="/summary" className="brand-link">Business Dashboard</NavLink>
        </h1>
      </div>

      <nav className="nav-actions">
        {auth ? (
          <>
            <NavLink to="/summary" className={({isActive}) => isActive ? 'btn active' : 'btn'}>Summary</NavLink>
            <NavLink to="/products" className={({isActive}) => isActive ? 'btn active' : 'btn'}>Products</NavLink>
            <NavLink to="/sales" className={({isActive}) => isActive ? 'btn active' : 'btn'}>Record Sale</NavLink>
            <button className="btn" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <NavLink to="/login" className={({isActive}) => isActive ? 'btn active' : 'btn'}>Login</NavLink>
        )}
      </nav>
    </header>
  );
}
