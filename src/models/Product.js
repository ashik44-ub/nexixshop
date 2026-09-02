import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    discountPrice: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    images: [{ type: String }],
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    brand: { type: String, default: "" },
    sizes: { type: [String], default: [] }, // <--- এই ফিল্ডটি যুক্ত করা হয়েছে
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Next.js Dev Server Caching সমস্যামুক্ত মডেল এক্সপোর্ট
export default mongoose.models.Product || mongoose.model("Product", ProductSchema);