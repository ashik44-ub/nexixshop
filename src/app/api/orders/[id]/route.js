import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(req, { params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const order = await Order.findById(id).populate("user", "name email");
  if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });

  const isOwner = order.user._id.toString() === session.user.id;
  const isStaff = ["admin", "manager"].includes(session.user.role);
  if (!isOwner && !isStaff) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  return NextResponse.json(order);
}

// Update order status (admin/manager only)
export async function PUT(req, { params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || !["admin", "manager"].includes(session.user.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  await dbConnect();
  const body = await req.json();
  const order = await Order.findByIdAndUpdate(id, body, { new: true });
  if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });
  return NextResponse.json(order);
}