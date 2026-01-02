import { useEffect, useState } from "react";
import ProductTable from "./ProductTable";
import "../styles/ProductSold.css";

function ProductSold () {
    const API = import.meta.env.VITE_API;

    const [form, setForm] = useState({
        productId: "",
        productName: "",
        sellingPrice: "",
        productQty: "",
    });
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");

    // Fetch product
    const fetchProduct = async () => {
        try {
            const res = await fetch(`${API}/api/product`);
            const json = await res.json();

            const rows = (Array.isArray(json) ? json : json.data || [])
                .map((r) => ({
                    id: r.id,
                    productName: r.product_name ?? r.productName,
                    buyingPrice: r.buying_price ?? r.buyingPrice,
                    productQty: r.quantity ?? r.productQty,
                }));

            setData(rows);
        } catch (err) {
            console.log("Failed to fetch product: ", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProduct();
    }, []);

    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value})
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.productId) {
            alert('Please select a product');
            return;
        }

        const payload = {
            productId: form.productId,
            sellingPrice: Number(form.sellingPrice),
            quantity: Number(form.productQty),
        };

        if (Number.isNaN(payload.sellingPrice) || Number.isNaN(payload.quantity)) {
            alert('Please enter valid numeric selling price and quantity');
            return;
        }

        try {
            const res = await fetch(`${API}/api/sales`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const json = await res.json().catch(() => ({}));

            if (!res.ok) {
                alert(json.error || 'Failed to record sale');
                return;
            }


            // notify product table to refresh quantities
            window.dispatchEvent(new CustomEvent('product:sold', { detail: { productId: payload.productId } }));

            // reset form
            setForm({ productId: '', productName: '', sellingPrice: '', productQty: '' });
        } catch (err) {
            console.error(err);
            alert('Failed to record sale');
        }
    }

    if (loading) return <p className="loading">Loading products...</p>;

    return (
        <div className="product-sold page">
            <h1 className="page-title">💰 Product Sold</h1>

            <div className="card">
              <form className="form" onSubmit={handleSubmit}>
                <label>Product</label>
                <div>
                    <input
                        className="input"
                        type="text"
                        placeholder="Search products..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}                    
                    />

                    <select className="input" name="productId" value={form.productId} onChange={(e) => {
                        const id = e.target.value;
                        const prod = data.find(d => String(d.id) === String(id));
                        setForm({ ...form, productId: id, productName: prod ? prod.productName : "" });
                    }}>
                        <option value="">-- Select product --</option>
                        {data
                            .filter(p => p.productName.toLowerCase().includes(filter.toLowerCase()))
                            .map((p) => (
                                <option key={p.id} value={p.id}>{p.productName} (buying: {p.buyingPrice})</option>
                            ))}
                    </select>
                </div>

                    <label>Selling Price (per unit)</label>
                    <input className="input" type="number" name="sellingPrice" onChange={handleChange} placeholder="Enter selling price..." value={form.sellingPrice} required />

                    <label>Quantity</label>
                    <input className="input" type="number" name="productQty" onChange={handleChange} placeholder="Enter quantity..." value={form.productQty} required />

                    <div className="actions">
                        <button className="btn primary" type="submit">Record Sale</button>
                    </div>
                </form>
            </div>


            <div>
                <ProductTable />
            </div>
        </div>
    )
}

export default ProductSold