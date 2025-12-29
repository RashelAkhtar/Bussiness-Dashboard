import React, { useState } from "react";

import AddRemoveProduct from "./AddRemoveProduct";
import ProductSold from "./ProductSold";
import ProductTable from "./ProductTable";
import DashboardSummary from "./DashboardSummary";
import Header from "./Header";

import "../styles/HomePage.css";

function HomePage() {
    const [showAddProduct, setShowAddProduct] = useState(true);
    const [showProductSold, setShowProductSold] = useState(false);

    return (
        <div className="homepage container">
            <Header onOpenAdd={() => { setShowAddProduct(true); setShowProductSold(false); }} onOpenSold={() => { setShowProductSold(true); setShowAddProduct(false); }} />

            <div className="layout-grid">
                <div className="main-col">
                    <DashboardSummary />
                    <div className="section card">
                        <ProductTable />
                    </div>
                </div>

                <aside className="side-col">
                    <div className="card">
                        {showAddProduct && <AddRemoveProduct />}
                        {showProductSold && <ProductSold />}
                    </div>
                </aside>
            </div>
        </div>
    );
}

export default HomePage;