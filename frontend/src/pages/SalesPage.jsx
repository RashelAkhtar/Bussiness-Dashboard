import React from 'react';
import ProductSold from '../components/ProductSold';

export default function SalesPage(){
  return (
    <div className="page">
      <div style={{maxWidth: 520}}>
        <ProductSold />
      </div>
    </div>
  );
}
