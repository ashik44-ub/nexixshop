"use client";

import { useState } from "react";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import { useCartStore } from "@/store/cartStore";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [form, setForm] = useState({ name: "", phone: "", line1: "", city: "", postCode: "", country: "Bangladesh" });

  if (status === "loading") return (<><Header /><LoadingSpinner full size="lg" /><Footer /></>);

  if (status === "unauthenticated") {
    return (
      <>
        <Header />
        <main className="max-w-md mx-auto px-4 py-20 text-center">
          <p className="mb-4 text-gray-600">Please log in to check out.</p>
          <button onClick={() => router.push("/login?callbackUrl=/checkout")} className="btn-primary">Log In</button>
        </main>
        <Footer />
      </>
    );
  }

  const shippingPrice = totalPrice() > 5000 ? 0 : 100;
  const total = totalPrice() + shippingPrice;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return toast.error("Your cart is empty");
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ product: i.product, name: i.name, image: i.image, price: i.price, quantity: i.quantity })),
          shippingAddress: form,
          paymentMethod,
        }),
      });
      const order = await res.json();
      if (!res.ok) throw new Error(order.message);

      if (paymentMethod === "cod") {
        clearCart();
        toast.success("Order placed successfully!");
        router.push(`/dashboard/orders/${order._id}`);
        return;
      }

      if (paymentMethod === "stripe") {
        const stripeRes = await fetch("/api/payment/stripe/create-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: order._id, items: order.items, totalPrice: order.totalPrice }),
        });
        const { url } = await stripeRes.json();
        clearCart();
        if (url) window.location.href = url;
        return;
      }

      if (paymentMethod === "sslcommerz") {
        const sslRes = await fetch("/api/payment/sslcommerz/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: order._id }),
        });
        const { url } = await sslRes.json();
        clearCart();
        if (url) window.location.href = url;
        return;
      }
    } catch (err) {
      toast.error(err.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="card p-6 space-y-4">
              <h2 className="font-bold">Shipping Address</h2>
              <input required placeholder="Full Name" className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input required placeholder="Phone Number" className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <input required placeholder="Address" className="input-field" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="City" className="input-field" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                <input required placeholder="Post Code" className="input-field" value={form.postCode} onChange={(e) => setForm({ ...form, postCode: e.target.value })} />
              </div>
            </div>

            <div className="card p-6 space-y-3">
              <h2 className="font-bold mb-2">Payment Method</h2>
              {[
                { id: "stripe", label: "Credit / Debit Card (Stripe)" },
                { id: "sslcommerz", label: "Mobile Banking / Card (SSLCommerz)" },
                { id: "cod", label: "Cash on Delivery" },
              ].map((opt) => (
                <label key={opt.id} className="flex items-center gap-3 border border-gray-200 rounded-lg p-3 cursor-pointer has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50">
                  <input type="radio" name="payment" checked={paymentMethod === opt.id} onChange={() => setPaymentMethod(opt.id)} />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="card p-6 h-fit">
            <h2 className="font-bold mb-4">Order Summary</h2>
            {items.map((item) => (
              <div key={item.product} className="flex justify-between text-sm mb-2">
                <span className="truncate mr-2">{item.name} × {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm mt-3 text-gray-500">
              <span>Shipping</span>
              <span>{shippingPrice === 0 ? "Free" : `$${shippingPrice.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-4 mt-4 mb-4">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Processing..." : "Place Order"}
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </>
  );
}
