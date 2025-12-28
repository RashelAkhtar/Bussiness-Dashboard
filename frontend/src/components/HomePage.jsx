import React, { useState } from "react";

import AddRemoveProduct from "./AddRemoveProduct";
import ProductSold from "./ProductSold";

import "../styles/HomePage.css"

function HomePage() {
    const [showAddProduct, setShowAddProduct] = useState(false)
    const [showProductSold, setShowProductSold] = useState(false)

    return (
        <div className="homepage container">
            <header className="header">
                <h1 className="dashboard-title" onClick={() => window.location.reload(true)}>
                    Business Dashboard
                </h1>

                <div className="tabs">
                    <button className="tab-btn" onClick={()=> {setShowProductSold(true); setShowAddProduct(false)}}>Product Sold</button>
                    <button className="tab-btn" onClick={() => {setShowAddProduct(true); setShowProductSold(false)}}>Add Product</button>
                </div>
            </header>

            <main className="main">
                {showAddProduct && <AddRemoveProduct /> }
                {showProductSold && <ProductSold />}
            </main>
        </div>
    )
}

export default HomePage