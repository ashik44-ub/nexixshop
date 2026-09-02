import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import { requireRole } from "@/lib/apiAuth";
import mongoose from "mongoose";

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

    // $and অ্যারে ব্যবহার করা হচ্ছে যেন একাধিক $or ফিল্টার কনফ্লিক্ট না করে
    const andConditions = [
      { $or: [{ isActive: true }, { isActive: { $exists: false } }] }
    ];

    // Category Filtering (ObjectId vs String Name/Slug Handling)
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        const objId = new mongoose.Types.ObjectId(category);
        andConditions.push({
          $or: [
            { category: objId },
            { category: category },
            { "category._id": objId },
            { "category._id": category }
          ]
        });
      } else {
        const cleanCategory = decodeURIComponent(category);
        const categoryRegex = { $regex: new RegExp(`^${cleanCategory}$`, "i") };
        andConditions.push({
          $or: [
            { category: categoryRegex },
            { "category.name": categoryRegex },
            { "category.slug": categoryRegex }
          ]
        });
      }
    }

    if (featured) {
      andConditions.push({ isFeatured: true });
    }

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      andConditions.push({
        $or: [{ name: searchRegex }, { title: searchRegex }]
      });
    }

    const query = { $and: andConditions };

    const total = await Product.countDocuments(query);

    let products = [];
    try {
      products = await Product.find(query)
        .populate("category", "name slug")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
    } catch {
      // If populate fails due to schema difference, fallback to normal query
      products = await Product.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
    }

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