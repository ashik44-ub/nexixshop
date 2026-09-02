"use client";

import { useEffect, useState } from "react";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import LoadingSpinner from "@/components/LoadingSpinner";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState(""); // সাইজ সিলেক্ট করার স্টেট
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then((r) => r.json())
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (<><Header /><LoadingSpinner full size="lg" /><Footer /></>);
  if (!product || product.message) return (<><Header /><p className="text-center py-20 text-gray-500">Product not found.</p><Footer /></>);

  const price = product.discountPrice || product.price;

  const handleAdd = () => {
    if (product.stock < qty) return toast.error("Not enough stock");
    
    // প্রোডাক্টে সাইজ থাকলে এবং সিলেক্ট না করলে অ্যালার্ট দেবে
    if (product.sizes?.length > 0 && !selectedSize) {
      return toast.error("Please select a size");
    }

    addItem({ 
      product: product._id, 
      name: product.name, 
      image: product.images?.[0], 
      price, 
      quantity: qty, 
      stock: product.stock,
      size: selectedSize // সিলেক্ট করা সাইজ কার্টে যাবে
    });
    
    toast.success("Added to cart");
  };

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-10">
        <div>
          <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden mb-3">
            <Image src={product.images?.[activeImg] || "/placeholder.png"} alt={product.name} fill className="object-cover" />
          </div>
          <div className="flex gap-2">
            {product.images?.map((img, i) => (
              <button key={i} onClick={() => setActiveImg(i)} className={`relative h-16 w-16 rounded-md overflow-hidden border-2 ${activeImg === i ? "border-primary-600" : "border-transparent"}`}>
                <Image src={img} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-gray-500 mt-1">{product.category?.name}</p>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary-700">৳{price.toLocaleString()}</span>
            {product.discountPrice > 0 && <span className="text-gray-400 line-through">৳{product.price.toLocaleString()}</span>}
          </div>
          <p className="mt-4 text-gray-600 leading-relaxed">{product.description}</p>
          <p className="mt-4 text-sm">
            {product.stock > 0 ? (
              <span className="text-green-600 font-medium">In stock ({product.stock} available)</span>
            ) : (
              <span className="text-red-600 font-medium">Out of stock</span>
            )}
          </p>

          {/* Size Selection Section */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Size: <span className="text-black font-bold">{selectedSize}</span>
              </label>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`h-10 min-w-[40px] px-3 text-sm font-semibold rounded-md border transition-all ${
                      selectedSize === sz
                        ? "bg-black text-white border-black shadow-sm"
                        : "bg-white text-gray-800 border-gray-300 hover:border-black"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2">−</button>
              <span className="px-4">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="px-3 py-2">+</button>
            </div>
            <button onClick={handleAdd} disabled={product.stock < 1} className="btn-primary flex-1">
              Add to Cart
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}