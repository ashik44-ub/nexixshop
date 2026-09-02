"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function DashboardOverview() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders").then((r) => r.json()).then(setOrders).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner full size="lg" />;

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-xl font-bold">Welcome, {session?.user?.name}</h1>
        <p className="text-gray-500 text-sm mt-1">Here's a quick look at your account.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="card p-6">
          <p className="text-gray-500 text-sm">Total Orders</p>
          <p className="text-3xl font-bold mt-1">{orders.length}</p>
        </div>
        <div className="card p-6">
          <p className="text-gray-500 text-sm">Total Spent</p>
          <p className="text-3xl font-bold mt-1">${orders.reduce((s, o) => s + o.totalPrice, 0).toFixed(2)}</p>
        </div>
      </div>
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold">Recent Orders</h2>
          <Link href="/dashboard/orders" className="text-primary-600 text-sm">View all →</Link>
        </div>
        {orders.length === 0 ? (
          <p className="text-gray-500 text-sm">No orders yet.</p>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map((o) => (
              <Link key={o._id} href={`/dashboard/orders/${o._id}`} className="flex justify-between text-sm border-b border-gray-100 pb-2">
                <span>{o.orderNumber}</span>
                <span className="capitalize">{o.orderStatus}</span>
                <span className="font-medium">${o.totalPrice.toFixed(2)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
