import express from "express";
import cors from "cors";
import pool from "./db.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

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

        const result = await pool.query(
            "INSERT INTO product_list (product_name, buying_price, quantity) VALUES ($1, $2, $3) RETURNING *",
            [productName, buyingPrice, productQty]
        );

        res.status(201).json({
            message: "Data saved successfully",
            data: result.rows[0],
        });
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