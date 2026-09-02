import PDFDocument from "pdfkit";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { requireRole } from "@/lib/apiAuth";
import { NextResponse } from "next/server";

// Streams a generated invoice PDF for the given order (admin/manager only).
export async function GET(req, { params }) {
  const { id } = await params; // Next.js 15+ params unwrap

  const { ok, status } = await requireRole(["admin", "manager"]);
  if (!ok) return NextResponse.json({ message: "Forbidden" }, { status });

  await dbConnect();
  const order = await Order.findById(id).populate("user", "name email");
  if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });

  const chunks = [];
  const doc = new PDFDocument({ margin: 50 });
  doc.on("data", (chunk) => chunks.push(chunk));

  const done = new Promise((resolve) => doc.on("end", resolve));

  doc.fontSize(20).text("INVOICE", { align: "right" });
  doc.moveDown();
  doc.fontSize(10).text(`Order #: ${order.orderNumber}`, { align: "right" });
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, { align: "right" });
  doc.moveDown();

  // 👈 Topz Fashions এবং ঠিকানা বাদ দিয়ে শুধু Nexix Shop দেওয়া হলো
  doc.fontSize(14).text("Nexix Shop", 50, 50);
  doc.moveDown();

  doc.fontSize(12).text("Billed to:");
  doc.fontSize(10).text(order.shippingAddress?.name || order.user?.name || "");
  doc.text(order.user?.email || "");
  doc.text(order.shippingAddress?.line1 || "");
  doc.text(`${order.shippingAddress?.city || ""} ${order.shippingAddress?.postCode || ""}`);
  doc.moveDown();

  doc.fontSize(12).text("Items", { underline: true });
  doc.moveDown(0.5);

  const tableTop = doc.y;
  doc.fontSize(10);
  doc.text("Item", 50, tableTop);
  doc.text("Qty", 300, tableTop);
  doc.text("Price", 370, tableTop);
  doc.text("Total", 460, tableTop);
  doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

  let y = tableTop + 25;
  order.items.forEach((item) => {
    // 👈 প্রোডাক্টের নামের সাথে সাইজ সরাসরি যুক্ত করা হলো যাতে কোনোভাবেই মিস না হয়
    const displayName = item.size ? `${item.name} (Size: ${item.size})` : item.name;

    doc.fontSize(10).fillColor("black").text(displayName, 50, y, { width: 240 });
    doc.text(String(item.quantity), 300, y);
    doc.text(`$${item.price.toFixed(2)}`, 370, y);
    doc.text(`$${(item.price * item.quantity).toFixed(2)}`, 460, y);
    
    y += 25; // প্রতি লাইনের স্ট্যান্ডার্ড গ্যাপ
  });

  doc.moveTo(50, y + 5).lineTo(550, y + 5).stroke();
  y += 15;
  doc.text(`Subtotal: $${order.itemsPrice.toFixed(2)}`, 370, y);
  y += 15;
  doc.text(`Shipping: $${order.shippingPrice.toFixed(2)}`, 370, y);
  y += 15;
  doc.fontSize(12).text(`Total: $${order.totalPrice.toFixed(2)}`, 370, y);

  doc.moveDown(3);
  doc.fontSize(9).fillColor("gray").text(`Payment method: ${order.paymentMethod.toUpperCase()} — Status: ${order.paymentStatus.toUpperCase()}`, 50);

  doc.end();
  await done;
  const pdfBuffer = Buffer.concat(chunks);

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${order.orderNumber}.pdf"`,
    },
  });
}