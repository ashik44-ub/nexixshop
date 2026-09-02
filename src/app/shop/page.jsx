"use client";

import { Suspense, useEffect, useState } from "react";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import ProductCard from "@/components/store/ProductCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useSearchParams } from "next/navigation";

function ShopContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const qs = category ? `?category=${category}` : "";
    fetch(`/api/products${qs}`)
      .then((r) => r.json())
      .then((data) => setProducts(data.products || []))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 min-h-[60vh]">
      <h1 className="text-2xl font-bold mb-6">Shop All Products</h1>
      {loading ? (
        <LoadingSpinner full size="lg" />
      ) : products.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
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
    <>
      <Header />
      <Suspense fallback={<LoadingSpinner full size="lg" />}>
        <ShopContent />
      </Suspense>
      <Footer />
    </>
  );
}
