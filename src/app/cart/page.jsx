"use client";

import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import { useCartStore } from "@/store/cartStore";
import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8 min-h-[60vh]">
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">Your cart is empty.</p>
            <Link href="/shop" className="btn-primary">Continue Shopping</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.size ? `${item.product}-${item.size}` : item.product} className="card p-4 flex gap-4 items-center">
                  <div className="relative h-20 w-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    <Image src={item.image || "/placeholder.png"} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>

                    {/* Size display section */}
                    {item.size && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Size: <span className="font-bold text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded border">{item.size}</span>
                      </p>
                    )}

                    <p className="text-primary-700 font-bold mt-1">৳{(item.price || 0).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button onClick={() => updateQuantity(item.product, Math.max(1, item.quantity - 1), item.size)} className="px-3 py-1">−</button>
                    <span className="px-3">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product, Math.min(item.stock, item.quantity + 1), item.size)} className="px-3 py-1">+</button>
                  </div>
                  <button onClick={() => removeItem(item.product, item.size)} className="text-red-500 p-2">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="card p-6 h-fit">
              <h2 className="font-bold mb-4">Order Summary</h2>
              <div className="flex justify-between text-sm mb-2">
                <span>Subtotal</span>
                <span>৳{totalPrice().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm mb-4 text-gray-500">
                <span>Shipping</span>
                <span>{totalPrice() > 5000 ? "Free" : "৳100.00"}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-4 mb-4">
                <span>Total</span>
                <span>৳{(totalPrice() + (totalPrice() > 5000 ? 0 : 100)).toLocaleString()}</span>
              </div>
              <Link href="/checkout" className="btn-primary w-full block text-center">Proceed to Checkout</Link>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}