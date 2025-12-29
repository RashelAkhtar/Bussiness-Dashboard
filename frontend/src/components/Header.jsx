import React from "react";
import "../styles/Header.css";

export default function Header({ onOpenAdd, onOpenSold }) {
  return (
    <header className="app-header card">
      <div className="brand" onClick={() => window.location.reload()}>
        <h1>Business Dashboard</h1>
      </div>

      <nav className="nav-actions">
        <button className="btn" onClick={onOpenSold}>Record Sale</button>
        <button className="btn primary" onClick={onOpenAdd}>Add Product</button>
      </nav>
    </header>
  );
}
