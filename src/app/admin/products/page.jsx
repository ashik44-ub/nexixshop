"use client";

import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Plus, Pencil, Trash2, X, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

const AVAILABLE_SIZES = ["S", "M", "L", "XL", "XXL"];

const emptyForm = { 
  name: "", 
  description: "", 
  price: "", 
  discountPrice: "", 
  stock: "", 
  images: "", 
  category: "", 
  brand: "", 
  sizes: [], 
  isFeatured: false 
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadProducts = () => 
    fetch("/api/products?limit=100")
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []));

  useEffect(() => {
    Promise.all([
      loadProducts(), 
      fetch("/api/categories").then((r) => r.json()).then(setCategories)
    ]).finally(() => setLoading(false));
  }, []);

  const openAdd = () => { 
    setEditing(null); 
    setForm(emptyForm); 
    setShowModal(true); 
  };
  
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name || "", 
      description: p.description || "", 
      price: p.price || "", 
      discountPrice: p.discountPrice || "",
      stock: p.stock || "", 
      images: Array.isArray(p.images) ? p.images.join(", ") : p.images || "", 
      category: p.category?._id || "", 
      brand: p.brand || "", 
      sizes: Array.isArray(p.sizes) ? p.sizes : [],
      isFeatured: p.isFeatured || false,
    });
    setShowModal(true);
  };

  const handleSizeToggle = (size) => {
    setForm((prev) => {
      const currentSizes = prev.sizes || [];
      const exists = currentSizes.includes(size);
      return {
        ...prev,
        sizes: exists 
          ? currentSizes.filter((s) => s !== size) 
          : [...currentSizes, size],
      };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      price: parseFloat(form.price),
      discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : 0,
      stock: parseInt(form.stock),
      images: typeof form.images === "string" 
        ? form.images.split(",").map((s) => s.trim()).filter(Boolean) 
        : form.images,
      sizes: form.sizes,
      category: form.category || undefined,
    };

    try {
      const res = editing
        ? await fetch(`/api/admin/products/${editing._id}`, { 
            method: "PUT", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify(payload) 
          })
        : await fetch("/api/products", { 
            method: "POST", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify(payload) 
          });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(editing ? "Product updated" : "Product added");
      setShowModal(false);
      loadProducts();
    } catch (err) {
      toast.error(err.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    toast.success("Product deleted");
    loadProducts();
  };

  // মোডালে দেওয়ার জন্য ইমেজের অ্যারে তৈরি
  const previewImages = typeof form.images === "string"
    ? form.images.split(",").map((s) => s.trim()).filter(Boolean)
    : Array.isArray(form.images) ? form.images : [];

  if (loading) return <LoadingSpinner full size="lg" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Products ({products.length})</h1>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      <div className="card p-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-3 w-14">Image</th>
              <th className="pb-3">Name</th>
              <th className="pb-3">Category</th>
              <th className="pb-3">Price</th>
              <th className="pb-3">Sizes</th>
              <th className="pb-3">Stock</th>
              <th className="pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                {/* Image Column */}
                <td className="py-3">
                  {p.images && p.images.length > 0 ? (
                    <img 
                      src={p.images[0]} 
                      alt={p.name} 
                      className="w-10 h-10 object-cover rounded-md border bg-gray-100"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-md border bg-gray-100 flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  )}
                </td>
                <td className="py-3 font-medium">{p.name}</td>
                <td className="py-3">{p.category?.name || "—"}</td>
                <td className="py-3">৳{(p.price || 0).toLocaleString()}</td>
                <td className="py-3">
                  <div className="flex gap-1 flex-wrap">
                    {p.sizes && p.sizes.length > 0 ? (
                      p.sizes.map((s) => (
                        <span key={s} className="px-1.5 py-0.5 text-xs bg-gray-100 rounded font-semibold border">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </div>
                </td>
                <td className="py-3">{p.stock}</td>
                <td className="py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(p)} className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-black">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(p._id)} className="p-1 hover:bg-gray-100 rounded text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">{editing ? "Edit Product" : "Add Product"}</h2>
              <button onClick={() => setShowModal(false)}><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-3">
              <input required placeholder="Product name" className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <textarea placeholder="Description" className="input-field" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              
              <div className="grid grid-cols-2 gap-3">
                <input required type="number" step="0.01" placeholder="Price (৳)" className="input-field" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                <input type="number" step="0.01" placeholder="Discount price (optional)" className="input-field" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <input required type="number" placeholder="Stock" className="input-field" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                <input placeholder="Brand" className="input-field" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Available Sizes</label>
                <div className="flex gap-2 flex-wrap">
                  {AVAILABLE_SIZES.map((sz) => {
                    const active = form.sizes?.includes(sz);
                    return (
                      <button
                        type="button"
                        key={sz}
                        onClick={() => handleSizeToggle(sz)}
                        className={`h-9 w-10 text-xs font-bold border rounded transition-colors ${
                          active 
                            ? "bg-black text-white border-black" 
                            : "bg-gray-50 text-gray-700 border-gray-300 hover:border-black"
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="">No category</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>

              {/* Image Input and Live Small Preview */}
              <div className="space-y-2">
                <input 
                  placeholder="Image URLs (comma separated)" 
                  className="input-field" 
                  value={form.images} 
                  onChange={(e) => setForm({ ...form, images: e.target.value })} 
                />
                {previewImages.length > 0 && (
                  <div className="flex gap-2 flex-wrap pt-1">
                    {previewImages.map((url, i) => (
                      <img 
                        key={i} 
                        src={url} 
                        alt="Preview" 
                        className="w-12 h-12 object-cover rounded border bg-gray-50"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              <label className="flex items-center gap-2 text-sm pt-1 cursor-pointer">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> Featured product
              </label>

              <button type="submit" disabled={saving} className="btn-primary w-full mt-2">
                {saving ? "Saving..." : "Save Product"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}