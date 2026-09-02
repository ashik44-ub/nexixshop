// Seeds the database with a demo admin user, categories, and products.
// Run with: npm run seed   (make sure .env.local has MONGODB_URI set)
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import User from "../src/models/User.js";
import Category from "../src/models/Category.js";
import Product from "../src/models/Product.js";

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  const adminEmail = "admin@shop.com";
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: "Admin",
      email: adminEmail,
      password: await bcrypt.hash("admin123", 10),
      role: "admin",
      provider: "credentials",
    });
    console.log("Created admin user: admin@shop.com / admin123");
  }

  const categoryNames = ["Electronics", "Fashion", "Home & Living", "Beauty", "Sports", "Books"];
  const categories = {};
  for (const name of categoryNames) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    let cat = await Category.findOne({ slug });
    if (!cat) cat = await Category.create({ name, slug });
    categories[name] = cat._id;
  }
  console.log("Categories ready");

  const sampleProducts = [
    { name: "Wireless Headphones", price: 59.99, category: "Electronics", images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"] },
    { name: "Smart Watch", price: 129.99, category: "Electronics", images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"] },
    { name: "Running Shoes", price: 79.99, category: "Sports", images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"] },
    { name: "Leather Backpack", price: 89.99, category: "Fashion", images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600"] },
    { name: "Ceramic Vase Set", price: 34.99, category: "Home & Living", images: ["https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600"] },
    { name: "Skincare Bundle", price: 44.99, category: "Beauty", images: ["https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600"] },
  ];

  for (const p of sampleProducts) {
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const exists = await Product.findOne({ slug });
    if (!exists) {
      await Product.create({
        ...p,
        slug,
        description: `${p.name} — high quality, great value, and fast shipping.`,
        stock: 25,
        isFeatured: true,
        category: categories[p.category],
      });
    }
  }
  console.log("Sample products ready");

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
