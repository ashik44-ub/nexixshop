import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import { requireRole } from "@/lib/apiAuth";

// Netlify/Vercel Serverless Function Dynamic Config
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    // Dynamic Query Builder
    const query = {};

    // isActive ফিল্ড না থাকলেও যেন ডাটা আসে
    query.$or = [{ isActive: true }, { isActive: { $exists: false } }];

    if (category) {
      // Case-insensitive matching
      query.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

    if (featured) {
      query.isFeatured = true;
    }

    if (search) {
      // Product schema-তে 'name' অথবা 'title' যেটিই থাক তা হ্যান্ডেল করবে
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Product.countDocuments(query);

    // populate-এর কারণে ক্র্যাশ করা ঠেকাতে সরাসরি ক্যোয়ারী করা নিরাপদ
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json(
      {
        products: products || [],
        total,
        page,
        pages: Math.ceil(total / limit) || 1,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { products: [], error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { ok, status } = await requireRole(["admin", "manager"]);
    if (!ok) return NextResponse.json({ message: "Forbidden" }, { status });

    await dbConnect();
    const body = await req.json();

    const productName = body.name || body.title || "product";
    const slug = productName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-");

    const product = await Product.create({
      ...body,
      slug: `${slug}-${Date.now().toString(36)}`,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}