"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { TrendingUp, DollarSign, Package, Users as UsersIcon } from "lucide-react";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({ orders: [], products: 0, users: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [ordersRes, productsRes] = await Promise.all([
        fetch("/api/orders?all=true").then((r) => r.json()),
        fetch("/api/products?limit=1").then((r) => r.json()),
      ]);
      let users = 0;
      if (session?.user?.role === "admin") {
        const usersRes = await fetch("/api/admin/users").then((r) => r.json());
        users = Array.isArray(usersRes) ? usersRes.length : 0;
      }
      setStats({ orders: Array.isArray(ordersRes) ? ordersRes : [], products: productsRes.total || 0, users });
      setLoading(false);
    }
    if (session) load();
  }, [session]);

  if (loading) return <LoadingSpinner full size="lg" />;

  const totalRevenue = stats.orders.filter((o) => o.paymentStatus === "paid" || o.paymentMethod === "cod").reduce((s, o) => s + o.totalPrice, 0);
  const pendingOrders = stats.orders.filter((o) => o.orderStatus === "processing").length;

  const cards = [
    { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign },
    { label: "Total Orders", value: stats.orders.length, icon: TrendingUp },
    { label: "Products", value: stats.products, icon: Package },
    { label: "Registered Users", value: session?.user?.role === "admin" ? stats.users : "—", icon: UsersIcon },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 rounded-2xl p-8 text-white">
        <h1 className="text-2xl font-bold">Hello, {session?.user?.name}!</h1>
        <p className="text-primary-100 mt-1">Here's what's happening with your store today.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="font-bold mb-4">Recent Orders {pendingOrders > 0 && <span className="text-sm font-normal text-yellow-600">({pendingOrders} awaiting processing)</span>}</h2>
        {stats.orders.length === 0 ? (
          <p className="text-gray-500 text-sm">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-3">Order #</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {stats.orders.slice(0, 6).map((o) => (
                  <tr key={o._id} className="border-b border-gray-50">
                    <td className="py-3">{o.orderNumber}</td>
                    <td className="py-3">{o.user?.name}</td>
                    <td className="py-3 capitalize">{o.orderStatus}</td>
                    <td className="py-3 font-medium">${o.totalPrice.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
