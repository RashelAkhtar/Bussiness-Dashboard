import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import "./styles/App.css";

import Header from './components/Header';
import SummaryPage from './pages/SummaryPage';
import ProductsPage from './pages/ProductsPage';
import SalesPage from './pages/SalesPage';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Header />
        <Routes>
          <Route path="/" element={<Navigate to="/summary" replace />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/sales" element={<SalesPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
