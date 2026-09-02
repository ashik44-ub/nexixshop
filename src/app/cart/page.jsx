"use client";

import { useState } from "react";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import { useCartStore } from "@/store/cartStore";
import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();

  // Delivery zone state (inside_dhaka = 80, outside_dhaka = 120)
  const [deliveryZone, setDeliveryZone] = useState("inside_dhaka");

  const subtotal = totalPrice();
  const shippingFee = deliveryZone === "inside_dhaka" ? 80 : 120;
  const finalTotal = subtotal + shippingFee;

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

            {/* Order Summary Section */}
            <div className="card p-6 h-fit">
              <h2 className="font-bold mb-4">Order Summary</h2>
              
              <div className="flex justify-between text-sm mb-3">
                <span>Subtotal</span>
                <span className="font-medium">৳{subtotal.toLocaleString()}</span>
              </div>

              {/* Delivery Area Selection */}
              <div className="mb-4 pt-2 border-t">
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Delivery Location
                </label>
                <div className="space-y-2">
                  <label className={`flex items-center justify-between p-2.5 border rounded-lg text-xs cursor-pointer transition-all ${deliveryZone === "inside_dhaka" ? "border-primary-600 bg-primary-50/30 font-semibold" : "border-gray-200"}`}>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="cartDelivery"
                        value="inside_dhaka"
                        checked={deliveryZone === "inside_dhaka"}
                        onChange={() => setDeliveryZone("inside_dhaka")}
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      <span>Inside Dhaka</span>
                    </div>
                    <span>৳80</span>
                  </label>

                  <label className={`flex items-center justify-between p-2.5 border rounded-lg text-xs cursor-pointer transition-all ${deliveryZone === "outside_dhaka" ? "border-primary-600 bg-primary-50/30 font-semibold" : "border-gray-200"}`}>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="cartDelivery"
                        value="outside_dhaka"
                        checked={deliveryZone === "outside_dhaka"}
                        onChange={() => setDeliveryZone("outside_dhaka")}
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      <span>Outside Dhaka</span>
                    </div>
                    <span>৳120</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-between text-sm mb-4 text-gray-600">
                <span>Shipping</span>
                <span className="font-medium">৳{shippingFee}</span>
              </div>

              <div className="flex justify-between font-bold text-lg border-t pt-4 mb-4">
                <span>Total</span>
                <span className="text-primary-700">৳{finalTotal.toLocaleString()}</span>
              </div>

              <Link 
                href={{
                  pathname: "/checkout",
                  query: { zone: deliveryZone }
                }} 
                className="btn-primary w-full block text-center"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}