import express from "express";
import cors from "cors";
import pool from "./db.js";
import dotenv from "dotenv";
import path from 'path';
import router from "./routes/dashboard.js";

// load .env located next to this file (backend/.env) so server works even when started from repo root
const envPath = path.join(path.dirname(new URL(import.meta.url).pathname), '.env');
dotenv.config({ path: envPath });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/api/dashboard", router);

// simple login endpoint - compares against env vars (no JWT)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body || {};
    const expectedUser = process.env.AUTH_USER;
    const expectedPass = process.env.AUTH_PASS;

    if (String(username) === String(expectedUser) && String(password) === String(expectedPass)) {
        return res.json({ success: true, message: 'Authenticated' });
    }

    return res.status(401).json({ success: false, message: 'Invalid credentials' });
});

app.get("/api/product", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM product_list ORDER BY id ASC "
        );

        res.json(result.rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({err: "Failed to fetch data"});
    }
});

app.post("/api/product", async (req, res) => {
    try {
        const {productName, buyingPrice, productQty} = req.body;

        if (!productName) return res.status(400).json({ err: 'productName is required' });

        // check if product already exists (case-insensitive match)
        const existing = await pool.query(
            'SELECT * FROM product_list WHERE LOWER(product_name) = LOWER($1) LIMIT 1',
            [productName]
        );

        if (existing.rowCount > 0) {
            const prod = existing.rows[0];
            // coerce incoming numbers
            const addQty = Number(productQty || 0);
            const newQty = Number(prod.quantity || 0) + addQty;
            // if buyingPrice provided, update it; otherwise keep existing
            const newBuying = (buyingPrice !== undefined && buyingPrice !== null) ? buyingPrice : prod.buying_price;

            const updated = await pool.query(
                'UPDATE product_list SET quantity = $1, buying_price = $2 WHERE id = $3 RETURNING *',
                [newQty, newBuying, prod.id]
            );

            return res.status(200).json({ message: 'Product updated', data: updated.rows[0] });
        }

        // insert new product when no existing match
        const result = await pool.query(
            "INSERT INTO product_list (product_name, buying_price, quantity) VALUES ($1, $2, $3) RETURNING *",
            [productName, buyingPrice, productQty]
        );

        res.status(201).json({ message: "Data saved successfully", data: result.rows[0] });
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: "Database error" })
    }
})

app.delete("/api/product/:id", async (req, res) => {
    try {
        const {id} = req.params;

        const result = await pool.query(
            "DELETE FROM product_list WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({message: "Product not found"});
        }

        // return deleted row for client verification
        res.json({message: "Product deleted successfully", data: result.rows[0]});
    } catch (err) {
        console.log(err);
        res.status(500).json({err: "Delete failed"});
    }
})

// Record a sale: insert into `sales` and decrement product quantity inside a transaction
app.post('/api/sales', async (req, res) => {
    const { productId, sellingPrice, quantity } = req.body;

    if (!productId || sellingPrice == null || quantity == null) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const result = await client.query(
            'SELECT id, buying_price, quantity FROM product_list WHERE id = $1 FOR UPDATE',
            [productId]
        );

        const product = result.rows[0];
        if (!product) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Product not found' });
        }

        if (Number(product.quantity) < Number(quantity)) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Insufficient stock' });
        }

        const profitPerUnit = Number(sellingPrice) - Number(product.buying_price);
        const totalProfit = profitPerUnit * Number(quantity);

        // insert sale record (sales table must be created separately)
        const insertSale = await client.query(
            `INSERT INTO sales (product_id, selling_price, quantity, profit_per_unit, total_profit)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [productId, sellingPrice, quantity, profitPerUnit, totalProfit]
        );

        // decrement inventory; do not touch aggregate columns unless they exist
        await client.query(
            `UPDATE product_list SET quantity = quantity - $1 WHERE id = $2`,
            [quantity, productId]
        );

        await client.query('COMMIT');

        // fetch updated product quantity to return to client
        const updated = await pool.query('SELECT id, product_name, buying_price, quantity FROM product_list WHERE id = $1', [productId]);

        res.status(201).json({ message: 'Sale recorded', sale: insertSale.rows[0], product: updated.rows[0] });
    } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        console.error(err);
        res.status(500).json({ error: 'Failed to record sale' });
    } finally {
        client.release();
    }
});

// GET sales list
app.get('/api/sales', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM sales ORDER BY sold_at DESC');
        // return rows directly (frontend accepts array or {data: []})
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch sales' });
    }
});

app.listen(PORT, ()=> {
    console.log(`Server running on http://localhost:${PORT}`);
})