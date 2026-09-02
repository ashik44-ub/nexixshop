import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import Product from "@/models/Product";

// SSLCommerz posts form-encoded data to this endpoint on success/IPN.
export async function POST(req) {
  const formData = await req.formData();
  const tran_id = formData.get("tran_id");
  const val_id = formData.get("val_id");

  await dbConnect();
  const order = await Order.findOne({ orderNumber: tran_id });

  if (order && order.paymentStatus !== "paid") {
    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentResult = { id: val_id, status: "VALID", update_time: new Date().toISOString() };
    await order.save();

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }
  }

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders/${order?._id}?payment=success`,
    { status: 303 }
  );
}
