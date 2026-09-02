import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";

export async function GET(req, { params }) {
  await dbConnect();

  // Next.js 15+ এর জন্য params কে await করা বাধ্যতামূলক
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const product = await Product.findOne({ slug }).populate("category", "name slug");

  if (!product) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}