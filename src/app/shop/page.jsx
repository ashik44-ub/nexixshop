"use client";

import { Suspense, useEffect, useState } from "react";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import ProductCard from "@/components/store/ProductCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useSearchParams } from "next/navigation";

function ShopContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const qs = categoryParam ? `?category=${categoryParam}` : "";
    fetch(`/api/products${qs}`)
      .then((r) => r.json())
      .then((data) => setProducts(data.products || []))
      .catch((err) => console.error("Error fetching products:", err))
      .finally(() => setLoading(false));
  }, [categoryParam]);

  // Dynamic Page Title Logic
  const getDynamicTitle = () => {
    if (!categoryParam) return "Shop All Products";

    //১. প্রোডাক্ট ডাটা যদি ক্যাটাগরি অবজেক্টসহ লোড হয়ে থাকে (Populated Category Name)
    if (products.length > 0 && products[0]?.category) {
      if (typeof products[0].category === "object" && products[0].category.name) {
        return products[0].category.name;
      }
      if (typeof products[0].category === "string" && !products[0].category.match(/^[0-9a-fA-F]{24}$/)) {
        return products[0].category;
      }
    }

    // ২. যদি URL-এ সরাসরি নাম বা স্লগ থাকে (যেমন: "formal-wear" -> "Formal Wear")
    if (!categoryParam.match(/^[0-9a-fA-F]{24}$/)) {
      return decodeURIComponent(categoryParam).replace(/-/g, " ");
    }

    // ৩. আইডি থাকার কারণে ডাটা লোড না হওয়া পর্যন্ত সাময়িক শিরোনাম
    return "Category Products";
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 min-h-[60vh]">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 capitalize text-gray-900">
        {getDynamicTitle()}
      </h1>

      {loading ? (
        <LoadingSpinner full size="lg" />
      ) : products.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No products found in this category.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </main>
  );
}

export default function ShopPage() {
  return (
    <div suppressHydrationWarning>
      <Header />
      <Suspense fallback={<LoadingSpinner full size="lg" />}>
        <ShopContent />
      </Suspense>
      <Footer />
    </div>
  );
}