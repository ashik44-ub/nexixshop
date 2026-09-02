import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { requireRole } from "@/lib/apiAuth";

// Update a user's role or active status (admin only)
export async function PUT(req, { params }) {
  const { id } = await params; // await params unwrap
  const { ok, status, session } = await requireRole(["admin"]);
  if (!ok) return NextResponse.json({ message: "Forbidden" }, { status });

  if (id === session.user.id) {
    return NextResponse.json({ message: "You cannot change your own role" }, { status: 400 });
  }

  await dbConnect();
  const body = await req.json(); // { role } and/or { isActive }
  const allowed = {};
  if (body.role) allowed.role = body.role;
  if (typeof body.isActive === "boolean") allowed.isActive = body.isActive;

  const user = await User.findByIdAndUpdate(id, allowed, { new: true }).select("-password");
  if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function DELETE(req, { params }) {
  const { id } = await params; // await params unwrap
  const { ok, status, session } = await requireRole(["admin"]);
  if (!ok) return NextResponse.json({ message: "Forbidden" }, { status });

  if (id === session.user.id) {
    return NextResponse.json({ message: "You cannot delete your own account" }, { status: 400 });
  }

  await dbConnect();
  await User.findByIdAndDelete(id);
  return NextResponse.json({ message: "User deleted" });
}