import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";

// Netlify Serverless Dynamic Config
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req, { params }) {
  try {
    await dbConnect();

    // Next.js 15+ এর জন্য params await করা
    const resolvedParams = await params;
    const slug = resolvedParams?.slug;

    if (!slug) {
      return NextResponse.json({ message: "Slug is required" }, { status: 400 });
    }

    // populate নিরাপদ করতে try-catch এর ভেতর খোঁজা
    let product;
    try {
      product = await Product.findOne({ slug }).populate("category", "name slug");
    } catch {
      // যদি populate Mongoose Schema Schema mismatch এর জন্য ফেইল করে
      product = await Product.findOne({ slug });
    }

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error("GET /api/products/[slug] error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}