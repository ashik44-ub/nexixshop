"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import Image from "next/image";

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${id}`).then((r) => r.json()).then(setOrder).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner full size="lg" />;
  if (!order || order.message) return <p className="text-gray-500">Order not found.</p>;

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold">Order {order.orderNumber}</h1>
            <p className="text-gray-500 text-sm">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-medium capitalize bg-primary-50 text-primary-700">
            {order.orderStatus}
          </span>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-bold mb-4">Items</h2>
        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="relative h-14 w-14 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                <Image src={item.image || "/placeholder.png"} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium">{item.name}</p>
                <p className="text-gray-500">Qty: {item.quantity}</p>
              </div>
              <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
        <div className="border-t mt-4 pt-4 text-sm space-y-1">
          <div className="flex justify-between"><span>Subtotal</span><span>${order.itemsPrice.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>${order.shippingPrice.toFixed(2)}</span></div>
          <div className="flex justify-between font-bold text-base"><span>Total</span><span>${order.totalPrice.toFixed(2)}</span></div>
        </div>
      </div>

      <div className="card p-6 grid sm:grid-cols-2 gap-6 text-sm">
        <div>
          <h2 className="font-bold mb-2">Shipping Address</h2>
          <p>{order.shippingAddress.name}</p>
          <p>{order.shippingAddress.line1}</p>
          <p>{order.shippingAddress.city}, {order.shippingAddress.postCode}</p>
          <p>{order.shippingAddress.phone}</p>
        </div>
        <div>
          <h2 className="font-bold mb-2">Payment</h2>
          <p className="capitalize">Method: {order.paymentMethod}</p>
          <p className="capitalize">Status: {order.paymentStatus}</p>
        </div>
      </div>
    </div>
  );
}
