import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import { requireRole } from "@/lib/apiAuth";

export async function GET() {
  await dbConnect();
  const categories = await Category.find().sort({ name: 1 });
  return NextResponse.json(categories);
}

export async function POST(req) {
  const { ok, status } = await requireRole(["admin", "manager"]);
  if (!ok) return NextResponse.json({ message: "Forbidden" }, { status });

  await dbConnect();
  const body = await req.json();
  const slug = body.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
  const category = await Category.create({ ...body, slug });
  return NextResponse.json(category, { status: 201 });
}
