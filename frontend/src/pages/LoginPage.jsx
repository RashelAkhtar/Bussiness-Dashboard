import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ProductSold.css';

export default function LoginPage(){
  const API = import.meta.env.VITE_API;
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.message || 'Login failed');
        setLoading(false);
        return;
      }

      // success: set a simple client-side flag and navigate
      localStorage.setItem('auth', 'true');
      // notify other components in same window
      window.dispatchEvent(new Event('auth:changed'));
      navigate('/summary', { replace: true });
    } catch (err) {
      console.error(err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="product-sold page">
      <h1 className="page-title">🔒 Sign In</h1>
      <div className="card">
        <form className="form" onSubmit={handleSubmit}>
          <label>Username</label>
          <input className="input" name="username" value={form.username} onChange={handleChange} required />
          <label>Password</label>
          <input className="input" name="password" type="password" value={form.password} onChange={handleChange} required />

          {error && <div style={{ color: 'var(--error)', marginTop: 8 }}>{error}</div>}

          <div className="actions">
            <button className="btn primary" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
