import {flexRender, getCoreRowModel, getPaginationRowModel, useReactTable} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import "../styles/ProductTable.css";

function ProductTable () {
    const API = import.meta.env.VITE_API;

    const [data, setData] = useState([]);
    const [soldData, setSoldData] = useState([]);
    const [mergedData, setMergedData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch product
    const fetchProduct = async () => {
        try {
            const res = await fetch(`${API}/api/product`);
            const json = await res.json();

            // backend returns rows with snake_case column names; map to frontend keys
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

    // Fetch sold product info
    const fetchSoldDetails = async () => {
        try {
            const res = await fetch(`${API}/api/sales`);
            const json = await res.json();

            const rows = (Array.isArray(json) ? json: json.data || [])
                .map((r) => ({
                    id: r.product_id ?? r.id,
                    sellingPrice: r.selling_price ?? r.sellingPrice,
                    quantitySold: r.quantity ?? r.quantitySold,
                    profitPerUnit: r.profit_per_unit ?? r.profitPerUnit,
                    totalProfit: r.total_profit ?? r.totalProfit,
                    sold_at: r.sold_at ?? r.soldAt,
                    __raw: r,
                }));

            setSoldData(rows);
        } catch (err) {
            console.log("Failed to fetch sold information: ", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchProduct();
        fetchSoldDetails();

        // listen for new products being added or sold and refresh
        const onAdded = () => fetchProduct();
        const onSold = () => fetchSoldDetails();
        window.addEventListener("product:added", onAdded);
        window.addEventListener("product:sold", onSold);
        return () => {
            window.removeEventListener("product:added", onAdded);
            window.removeEventListener("product:sold", onSold);
        };
    }, []);

    // whenever products or sales change, merge them
    useEffect(() => {
        // map product id -> aggregated sales
        const salesByProduct = {};
        for (const s of soldData) {
            const pid = String(s.id ?? s.product_id ?? s.__raw?.product_id);
            if (!salesByProduct[pid]) salesByProduct[pid] = [];
            salesByProduct[pid].push(s);
        }

        const merged = data.map((p) => {
            const pid = String(p.id);
            const sales = salesByProduct[pid] || [];
            // compute total sold and profit aggregates
            const totalSold = sales.reduce((sum, s) => sum + Number(s.quantitySold ?? s.quantity ?? 0), 0);
            const totalProfit = sales.reduce((sum, s) => sum + Number(s.totalProfit ?? s.total_profit ?? 0), 0);
            let latestProfitPerUnit = '';
            if (sales.length > 0) {
                sales.sort((a,b) => new Date(b.sold_at || b.__raw?.sold_at || 0) - new Date(a.sold_at || a.__raw?.sold_at || 0));
                latestProfitPerUnit = sales[0].profitPerUnit ?? sales[0].profit_per_unit ?? '';
            }
            return {
                ...p,
                profitPerUnit: latestProfitPerUnit,
                totalProfit: totalProfit,
                quantitySold: totalSold,
            };
        });

        setMergedData(merged);
    }, [data, soldData]);


    // DELETE product
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete?");
        if (!confirmDelete) return;

        try {
            console.log("Attempting delete for id:", id);
            const res = await fetch(`${API}/api/product/${id}`, {
                method: "DELETE",
            });

            const json = await res.json().catch(() => ({}));

            if (!res.ok) {
                const msg = json?.err || json?.message || "Delete failed";
                throw new Error(msg);
            }

            // Update UI (coerce to string to avoid type mismatch)
            setData((prev) => prev.filter((item) => String(item.id) !== String(id)));

            // show server message if present
            if (json?.message) alert(json.message);
        } catch (err) {
            alert("Error deleting record: " + (err.message || err));
            console.error(err);
        }
    }

    const columns = [
        {accessorKey: "id", header: "ID"},
        {accessorKey: "productName", header: "Name"},
        {accessorKey: "buyingPrice", header: "Buying Price"},
        {accessorKey: "productQty", header: "Quantity"},
        {accessorKey: "profitPerUnit", header: "Profit Per Unit"},
        {accessorKey: "quantitySold", header: "Quantity Sold"},
        {accessorKey: "totalProfit", header: "Total Profit"},
        {
            header: "Actions",
            cell: ({row}) => (
                <button onClick={() => handleDelete(row.original.id)}>DELETE</button>
            )
        }
    ];

    const table = useReactTable({
        data: mergedData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    if (loading) return <p className="loading">Loading...</p>;


    return(
        <div className="product-table page">
        <h2 className="page-title">Product Table</h2>

    <table className="table" cellPadding="8">
            <thead>
                {table.getHeaderGroups().map((group) => (
                    <tr key={group.id}>
                    {group.headers.map((header) => (
                        <th key={header.id}>
                        {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                        )}
                        </th>
                    ))}
                    </tr>
                ))}
            </thead>

            <tbody>
                {table.getRowModel().rows.map((row) => (
                    <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                        <td key={cell.id}>
                        {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                        )}
                        </td>
                    ))}
                </tr>
            ))}
        </tbody>
      </table>

    <div className="pagination">
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
    </button>

        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </button>
      </div>
    </div>
    )
}

export default ProductTable;