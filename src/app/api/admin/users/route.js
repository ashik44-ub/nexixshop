import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { requireRole } from "@/lib/apiAuth";

// List all users (admin only)
export async function GET() {
  const { ok, status } = await requireRole(["admin"]);
  if (!ok) return NextResponse.json({ message: "Forbidden" }, { status });

  await dbConnect();
  const users = await User.find().select("-password -resetPasswordToken -resetPasswordExpires").sort({ createdAt: -1 });
  return NextResponse.json(users);
}
