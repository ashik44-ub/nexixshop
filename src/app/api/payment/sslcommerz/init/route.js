import { NextResponse } from "next/server";
import SSLCommerzPayment from "sslcommerz-lts";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const store_id = process.env.SSLCZ_STORE_ID;
const store_passwd = process.env.SSLCZ_STORE_PASSWORD;
const is_live = process.env.SSLCZ_IS_LIVE === "true";

// Initiates an SSLCommerz payment session for an existing order.
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const { orderId } = await req.json();
  const order = await Order.findById(orderId);
  if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });

  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

  const data = {
    total_amount: order.totalPrice,
    currency: "BDT",
    tran_id: order.orderNumber,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/sslcommerz/success`,
    fail_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/sslcommerz/fail`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/sslcommerz/cancel`,
    ipn_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/sslcommerz/success`,
    shipping_method: "Courier",
    product_name: order.items.map((i) => i.name).join(", ").slice(0, 250),
    product_category: "General",
    product_profile: "general",
    cus_name: order.shippingAddress.name,
    cus_email: session.user.email,
    cus_add1: order.shippingAddress.line1,
    cus_city: order.shippingAddress.city,
    cus_postcode: order.shippingAddress.postCode,
    cus_country: order.shippingAddress.country || "Bangladesh",
    cus_phone: order.shippingAddress.phone,
    ship_name: order.shippingAddress.name,
    ship_add1: order.shippingAddress.line1,
    ship_city: order.shippingAddress.city,
    ship_postcode: order.shippingAddress.postCode,
    ship_country: order.shippingAddress.country || "Bangladesh",
  };

  try {
    const apiResponse = await sslcz.init(data);
    if (apiResponse?.GatewayPageURL) {
      return NextResponse.json({ url: apiResponse.GatewayPageURL });
    }
    return NextResponse.json({ message: "Could not initiate SSLCommerz session" }, { status: 500 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "SSLCommerz error" }, { status: 500 });
  }
}
