import React from 'react';
import '../styles/Modal.css';

export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-panel">
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-actions">
          <button className="btn primary" onClick={onClose}>OK</button>
        </div>
      </div>
    </div>
  );
}
