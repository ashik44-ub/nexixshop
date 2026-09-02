"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import toast from "react-hot-toast";

export default function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [imgLoaded, setImgLoaded] = useState(false);
  const price = product.discountPrice || product.price;

  const handleAdd = (e) => {
    e.preventDefault();
    if (product.stock < 1) return toast.error("Out of stock");
    addItem({
      product: product._id,
      name: product.name,
      image: product.images?.[0],
      price,
      quantity: 1,
      stock: product.stock,
    });
    toast.success("Added to cart");
  };

  return (
    <Link href={`/product/${product.slug}`} className="card overflow-hidden group block">
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {!imgLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-primary-600" />
          </div>
        )}
        <Image
          src={product.images?.[0] || "/placeholder.png"}
          alt={product.name}
          fill
          onLoad={() => setImgLoaded(true)}
          className={`object-cover group-hover:scale-105 transition-transform duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        {product.discountPrice > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">Sale</span>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-800 truncate">{product.name}</h3>
        <div className="flex items-center justify-between mt-2">
          <div>
            <span className="font-bold text-primary-700">${price.toFixed(2)}</span>
            {product.discountPrice > 0 && (
              <span className="text-xs text-gray-400 line-through ml-2">${product.price.toFixed(2)}</span>
            )}
          </div>
          <button
            onClick={handleAdd}
            className="h-8 w-8 flex items-center justify-center rounded-full bg-primary-50 text-primary-700 hover:bg-primary-600 hover:text-white transition-colors"
            aria-label="Add to cart"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
