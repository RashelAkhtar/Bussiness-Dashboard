import React from 'react';
import AddRemoveProduct from '../components/AddRemoveProduct';
import ProductTable from '../components/ProductTable';

export default function ProductsPage(){
  return (
    <div className="page">
      <div style={{display:'grid', gap:16}}>
        <AddRemoveProduct />
        <div className="card">
          <ProductTable />
        </div>
      </div>
    </div>
  );
}
