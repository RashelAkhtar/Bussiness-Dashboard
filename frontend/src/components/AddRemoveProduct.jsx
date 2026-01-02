import React, { useState } from "react";
import "../styles/AddRemoveProduct.css";
import Modal from './Modal';

function AddRemoveProduct() {
    const API = import.meta.env.VITE_API;

    const [form, setForm] = useState({
        productName: "",
        buyingPrice: "",
        productQty: "",
    });
    const [modal, setModal] = useState({ open: false, title: '', message: '' });


    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // coerce numeric fields to numbers before sending
        const payload = {
            productName: form.productName,
            buyingPrice: Number(form.buyingPrice),
            productQty: Number(form.productQty),
        };

        const res = await fetch(`${API}/api/product`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (res.ok) {
            // notify listeners (ProductTable) to refresh
            window.dispatchEvent(new CustomEvent("product:added", { detail: data.data }));
            // reset form
            setForm({ productName: "", buyingPrice: "", productQty: "" });
        }

        // show modal with server response
        setModal({ open: true, title: res.ok ? 'Success' : 'Error', message: data.message || (res.ok ? 'Product added' : 'Failed to add product') });
    }


    return (
        <div className="add-product page">
            <h1 className="page-title">Add & Remove Product</h1>

            <div className="card">
              <form className="form" onSubmit={handleSubmit}>
                  <label>Name</label>
                  <input className="input" type="text" name="productName" placeholder="Enter product name..." onChange={handleChange} value={form.productName} required />

                  <label>Buying Price</label>
                  <input className="input" type="number" name="buyingPrice" placeholder="Enter buying price..." onChange={handleChange} value={form.buyingPrice} required />

                  <label>Quantity</label>
                  <input className="input" type="number" name="productQty" placeholder="Enter quantity..." onChange={handleChange} value={form.productQty} required />

                  <div className="actions">
                    <button className="btn primary" type="submit">Add Product</button>
                  </div>
              </form>
            </div>

                        {/* Product table is now on the Products page */}
                        <Modal open={modal.open} title={modal.title} onClose={() => setModal({ open: false })}>
                            <div>{modal.message}</div>
                        </Modal>
        </div>
    )
}

export default AddRemoveProduct