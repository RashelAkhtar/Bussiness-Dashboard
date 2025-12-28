import React, { useState } from "react";
import ProductTable from "./ProductTable";
import "../styles/AddRemoveProduct.css";

function AddRemoveProduct() {
    const API = import.meta.env.VITE_API;

    const [form, setForm] = useState({
        productName: "",
        buyingPrice: "",
        productQty: "",
    });
    // const [file, setFile] = useState(null);


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

        alert(data.message || (res.ok ? "Product added" : "Failed to add product"));
    }
    // const handleChange = (e) => {
    //     const selectedFile = e.target.files[0];
    //     if (selectedFile) {
    //         setFile(URL.createObjectURL(selectedFile));
    //     }
    // }


    return (
        <div className="add-product page">
            <h1 className="page-title">Add & Remove Product</h1>

            <div className="card">
              <form className="form" onSubmit={handleSubmit}>
                  <label>Name</label>
                  <input className="input" type="text" name="productName" placeholder="Enter product name..." onChange={handleChange} value={form.productName}/>

                  <label>Buying Price</label>
                  <input className="input" type="number" name="buyingPrice" placeholder="Enter buying price..." onChange={handleChange} value={form.buyingPrice}/>

                  <label>Quantity</label>
                  <input className="input" type="number" name="productQty" placeholder="Enter quantity..." onChange={handleChange} value={form.productQty}/>

                  <div className="actions">
                    <button className="btn primary" type="submit">Add Product</button>
                  </div>
              </form>
            </div>

            <div className="card">
                <ProductTable />
            </div>
        </div>
    )
}

export default AddRemoveProduct