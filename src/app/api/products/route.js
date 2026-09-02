import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import { requireRole } from "@/lib/apiAuth";

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const featured = searchParams.get("featured");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");

  const query = { isActive: true };
  if (category) query.category = category;
  if (featured) query.isFeatured = true;
  if (search) query.name = { $regex: search, $options: "i" };

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate("category", "name slug")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return NextResponse.json({ products, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req) {
  const { ok, status } = await requireRole(["admin", "manager"]);
  if (!ok) return NextResponse.json({ message: "Forbidden" }, { status });

  await dbConnect();
  const body = await req.json();
  const slug = body.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
  const product = await Product.create({ ...body, slug: `${slug}-${Date.now().toString(36)}` });
  return NextResponse.json(product, { status: 201 });
}
