import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import { requireRole } from "@/lib/apiAuth";

export async function PUT(req, { params }) {
  const { ok, status } = await requireRole(["admin", "manager"]);
  if (!ok) return NextResponse.json({ message: "Forbidden" }, { status });

  await dbConnect();
  
  const { id } = await params;
  const body = await req.json();
  
  const product = await Product.findByIdAndUpdate(id, body, { new: true });
  
  if (!product) return NextResponse.json({ message: "Product not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function DELETE(req, { params }) {
  const { ok, status } = await requireRole(["admin", "manager"]);
  if (!ok) return NextResponse.json({ message: "Forbidden" }, { status });

  await dbConnect();

  const { id } = await params;

  await Product.findByIdAndDelete(id);
  return NextResponse.json({ message: "Product deleted" });
}