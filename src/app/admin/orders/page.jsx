"use client";

import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Download, Search } from "lucide-react";
import toast from "react-hot-toast";

const statuses = ["processing", "confirmed", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const load = () => fetch("/api/orders?all=true").then((r) => r.json()).then(setOrders).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, orderStatus) => {
    await fetch(`/api/orders/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderStatus }) });
    toast.success("Order status updated");
    load();
  };

  // 🔍 অর্ডার নম্বর দিয়ে ফিল্টার করার লজিক
  const filteredOrders = orders.filter((o) =>
    o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner full size="lg" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl font-bold">Orders ({filteredOrders.length})</h1>
        
        {/* সার্চ ইনপুট বক্স */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Order # (e.g. ORD-...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="card p-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-3">Order #</th>
              <th className="pb-3">Customer</th>
              <th className="pb-3">Items & Size</th> {/* 👈 নতুন কলাম */}
              <th className="pb-3">Payment</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Total</th>
              <th className="pb-3">Invoice</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((o) => (
                <tr key={o._id} className="border-b border-gray-50">
                  <td className="py-3 font-semibold">{o.orderNumber}</td>
                  <td className="py-3">{o.user?.name}</td>
                  
                  {/* 👈 প্রোডাক্টের নাম, পরিমাণ এবং সাইজ রেন্ডার করার অংশ */}
                  <td className="py-3">
                    {o.items?.map((item, idx) => (
                      <div key={idx} className="text-xs space-y-0.5 mb-1">
                        <span className="font-medium text-gray-800">{item.name}</span>
                        {item.size && (
                          <span className="ml-2 px-1.5 py-0.5 bg-gray-100 border rounded text-[10px] font-semibold text-gray-700">
                            Size: {item.size}
                          </span>
                        )}
                        <span className="text-gray-500 ml-1">({item.quantity}x)</span>
                      </div>
                    ))}
                  </td>

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
                    <a href={`/api/admin/orders/${o._id}/invoice`} target="_blank" rel="noreferrer" className="text-primary-600 flex items-center gap-1 hover:underline">
                      <Download className="h-4 w-4" /> PDF
                    </a>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-500">
                  No orders found matching &quot;{searchTerm}&quot;
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}