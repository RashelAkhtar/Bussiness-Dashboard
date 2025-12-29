import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/summary", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                COALESCE(SUM(s.selling_price * s.quantity), 0)::numeric AS total_revenue,
                COALESCE(SUM(s.total_profit), 0)::numeric AS total_profit,
                COALESCE(SUM(s.quantity), 0)::int AS total_sold,
                (SELECT COUNT(*) FROM product_list)::int AS total_products
            FROM sales s`
        );

        // return single object
        res.json(result.rows[0] || { total_revenue: 0, total_profit: 0, total_sold: 0 });
    } catch (err) {
        console.error("GET /dashboard/summary error:", err);
        res.status(500).json({ err: "Failed to fetch summary" });
    }
});

router.get("/top-products", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                p.id,
                p.product_name,
                COALESCE(SUM(s.quantity), 0)::int AS total_sold
            FROM product_list p
            LEFT JOIN sales s ON p.id = s.product_id
            GROUP BY p.id, p.product_name
            ORDER BY total_sold DESC
            LIMIT 10`
        );

        res.json(result.rows);
    } catch (err) {
        console.error("GET /dashboard/top-products error:", err);
        res.status(500).json({ err: "Failed to fetch top products" });
    }
});

router.get("/least-products", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                p.id,
                p.product_name,
                COALESCE(SUM(s.quantity), 0)::int AS total_sold
            FROM product_list p
            LEFT JOIN sales s ON p.id = s.product_id
            GROUP BY p.id, p.product_name
            ORDER BY total_sold ASC
            LIMIT 10`
        );

        res.json(result.rows);
    } catch (err) {
        console.error("GET /dashboard/least-products error:", err);
        res.status(500).json({ err: "Failed to fetch least products" });
    }
});

router.get("/sales-trend", async (req, res) => {
    try {
        const result = await pool.query(
           `SELECT
                to_char(DATE(sold_at), 'YYYY-MM-DD') AS date,
                COALESCE(SUM(quantity),0)::int AS total_sold
            FROM sales
            GROUP BY DATE(sold_at)
            ORDER BY date`
        );

        res.json(result.rows);
    } catch (err) {
        console.error("GET /dashboard/sales-trend error:", err);
        res.status(500).json({ err: "Failed to fetch sales trend" });
    }
});

router.get("/profit-trend", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                to_char(DATE(sold_at), 'YYYY-MM-DD') AS date,
                COALESCE(SUM(total_profit),0)::numeric AS profit
            FROM sales
            GROUP BY DATE(sold_at)
            ORDER BY date`
        );

        res.json(result.rows);
    } catch (err) {
        console.error("GET /dashboard/profit-trend error:", err);
        res.status(500).json({ err: "Failed to fetch profit trend" });
    }
});

export default router;