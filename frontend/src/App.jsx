import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import "./styles/App.css";

import Header from './components/Header';
import SummaryPage from './pages/SummaryPage';
import ProductsPage from './pages/ProductsPage';
import SalesPage from './pages/SalesPage';
import LoginPage from './pages/LoginPage';

const isAuth = () => typeof window !== 'undefined' && localStorage.getItem('auth') === 'true';

const Private = ({ children }) => {
  if (!isAuth()) return <Navigate to="/login" replace />;
  return children;
};

function App() {

  return (
    <BrowserRouter>
      <div className="app-container">
        <Header />
        <Routes>
          <Route path="/" element={<Navigate to="/summary" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/summary" element={<Private><SummaryPage /></Private>} />
          <Route path="/products" element={<Private><ProductsPage /></Private>} />
          <Route path="/sales" element={<Private><SalesPage /></Private>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
