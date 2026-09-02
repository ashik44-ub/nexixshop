"use client";

import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Download } from "lucide-react";
import toast from "react-hot-toast";

const statuses = ["processing", "confirmed", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => fetch("/api/orders?all=true").then((r) => r.json()).then(setOrders).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, orderStatus) => {
    await fetch(`/api/orders/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderStatus }) });
    toast.success("Order status updated");
    load();
  };

  if (loading) return <LoadingSpinner full size="lg" />;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Orders ({orders.length})</h1>
      <div className="card p-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-3">Order #</th>
              <th className="pb-3">Customer</th>
              <th className="pb-3">Payment</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Total</th>
              <th className="pb-3">Invoice</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id} className="border-b border-gray-50">
                <td className="py-3">{o.orderNumber}</td>
                <td className="py-3">{o.user?.name}</td>
                <td className="py-3">
                  <span className={`capitalize ${o.paymentStatus === "paid" ? "text-green-600" : "text-yellow-600"}`}>{o.paymentMethod} · {o.paymentStatus}</span>
                </td>
                <td className="py-3">
                  <select value={o.orderStatus} onChange={(e) => updateStatus(o._id, e.target.value)} className="input-field py-1 text-xs">
                    {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="py-3 font-medium">${o.totalPrice.toFixed(2)}</td>
                <td className="py-3">
                  <a href={`/api/admin/orders/${o._id}/invoice`} target="_blank" rel="noreferrer" className="text-primary-600 flex items-center gap-1">
                    <Download className="h-4 w-4" /> PDF
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
