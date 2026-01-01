import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import "../styles/DashboardSummary.css";

// charts
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

function DashboardSummary () {
    const API = import.meta.env.VITE_API;

    const [summary, setSummary] = useState(null);
    const [topProducts, setTopProducts] = useState([]);
    const [leastProducts, setLeastProducts] = useState([]);
    const [salesTrend, setSalesTrend] = useState([]);
    const [profitTrend, setProfitTrend] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [summaryRes, topRes, leastRes, salesRes, profitRes] = await Promise.all ([
                    fetch(`${API}/api/dashboard/summary`),
                    fetch(`${API}/api/dashboard/top-products`),
                    fetch(`${API}/api/dashboard/least-products`),
                    fetch(`${API}/api/dashboard/sales-trend`),
                    fetch(`${API}/api/dashboard/profit-trend`),
                ]);

                if ( !summaryRes.ok || !topRes.ok || ! leastRes.ok || !salesRes.ok || !profitRes.ok) {
                    throw new Error("Failed to load dashboard data");
                }

                const summaryData = await summaryRes.json();
                const topData = await topRes.json();
                const leastData = await leastRes.json();
                const salesData = await salesRes.json();
                const profitData = await profitRes.json();

                setSummary(summaryData);
                setTopProducts(topData);
                setLeastProducts(leastData);
                setSalesTrend(salesData);
                setProfitTrend(profitData);
            } catch (err) {
                console.error(err);
                setError("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();    
    }, [API]);


    if (loading) return <p>Loading Dashboard...</p>
    if (error) return <p style={{color: "red"}}>{error}</p>

    // prepare chart data
    const salesLabels = salesTrend.map(r => r.date || r.month || r.label);
    const salesValues = salesTrend.map(r => Number(r.total_sold ?? 0));

    const profitLabels = profitTrend.map(r => r.date || r.month || r.label);
    const profitValues = profitTrend.map(r => Number(r.profit ?? r.month_profit ?? 0));

    const topLabels = topProducts.map(p => p.product_name || p.productName);
    const topValues = topProducts.map(p => Number(p.total_sold ?? p.totalSold ?? 0));

    return (
        <div className="dashboard-summary">
            <div className="summary-header">
                <h2>Business Summary</h2>
            </div>

            <div className="kpi-grid">
                <div className="kpi card">
                    <div className="kpi-title">Total Revenue</div>
                    <div className="kpi-value">₹ {Number(summary?.total_revenue ?? 0).toFixed(2)}</div>
                </div>
                <div className="kpi card">
                    <div className="kpi-title">Total Profit</div>
                    <div className="kpi-value">₹ {Number(summary?.total_profit ?? 0).toFixed(2)}</div>
                </div>
                <div className="kpi card">
                    <div className="kpi-title">Total Units Sold</div>
                    <div className="kpi-value">{summary?.total_sold ?? 0}</div>
                </div>
                <div className="kpi card">
                    <div className="kpi-title">Total Products</div>
                    <div className="kpi-value">{summary?.total_products ?? 0}</div>
                </div>
            </div>

            <div className="charts-grid">
                                <div className="card chart-card">
                                        <h3>Sales Trend</h3>
                                        <div className="chart-wrapper">
                                            <Line data={{ labels: salesLabels, datasets: [{ label: 'Units sold', data: salesValues, borderColor: '#1976d2', backgroundColor: 'rgba(25,118,210,0.08)', tension: 0.2 }] }} options={{ responsive: true, maintainAspectRatio: false }} />
                                        </div>
                                </div>

                                <div className="card chart-card">
                                        <h3>Profit Trend</h3>
                                        <div className="chart-wrapper">
                                            <Line data={{ labels: profitLabels, datasets: [{ label: 'Profit', data: profitValues, borderColor: '#4caf50', backgroundColor: 'rgba(76,175,80,0.08)', tension: 0.2 }] }} options={{ responsive: true, maintainAspectRatio: false }} />
                                        </div>
                                </div>
            </div>

            <div className="tables-grid">
                                <div className="card table-card">
                                        <h3>Top Products</h3>
                                        <div className="chart-wrapper">
                                            <Bar data={{ labels: topLabels, datasets: [{ label: 'Units sold', data: topValues, backgroundColor: '#2196f3' }] }} options={{ responsive: true, maintainAspectRatio: false }} />
                                        </div>
                                </div>

                <div className="card table-card">
                    <h3>Least Sold Products</h3>
                    <table className="table">
                        <thead><tr><th>Product</th><th>Sold</th></tr></thead>
                        <tbody>
                            {leastProducts.map(p => (
                                <tr key={p.id}><td>{p.product_name}</td><td>{p.total_sold}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}


export default DashboardSummary;