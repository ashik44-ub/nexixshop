import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

function generateOrderNumber() {
  return "ORD-" + Date.now().toString(36).toUpperCase() + "-" + Math.floor(Math.random() * 1000);
}

// Create an order (user must be logged in). Stock is decremented here.
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Please log in to place an order" }, { status: 401 });

  await dbConnect();
  const body = await req.json();
  const { items, shippingAddress, paymentMethod, shippingPrice: reqShippingPrice } = body;

  if (!items?.length) return NextResponse.json({ message: "Cart is empty" }, { status: 400 });

  // ✅ items-কে স্পষ্টভাবে map করে size নিশ্চিত করা
  const formattedItems = items.map((item) => ({
    product: item.product,
    name: item.name,
    image: item.image,
    price: item.price,
    quantity: item.quantity,
    size: item.size || null, // 👈 নিশ্চিতভাবে size সেভ হবে
  }));

  let itemsPrice = 0;
  for (const item of formattedItems) {
    const product = await Product.findById(item.product);
    if (!product || product.stock < item.quantity) {
      return NextResponse.json(
        { message: `${item.name} is out of stock` },
        { status: 400 }
      );
    }
    itemsPrice += (product.discountPrice || product.price) * item.quantity;
  }

  // শিপিং ফি নির্ধারণ
  const shippingPrice = typeof reqShippingPrice === "number" 
    ? reqShippingPrice 
    : (shippingAddress?.deliveryZone === "inside_dhaka" ? 80 : 120);

  const totalPrice = itemsPrice + shippingPrice;

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    user: session.user.id,
    items: formattedItems, // 👈 ফরম্যাট করা items সেভ করা হচ্ছে
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    totalPrice,
    paymentStatus: "pending",
  });

  // Decrement stock only for COD immediately
  if (paymentMethod === "cod") {
    for (const item of formattedItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }
  }

  return NextResponse.json(order, { status: 201 });
}

// List orders — own orders for user, all orders for admin/manager
export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const { searchParams } = new URL(req.url);
  const isAdminView = searchParams.get("all") === "true";

  let query = {};
  if (isAdminView && ["admin", "manager"].includes(session.user.role)) {
    query = {};
  } else {
    query = { user: session.user.id };
  }

  const orders = await Order.find(query).populate("user", "name email").sort({ createdAt: -1 });
  return NextResponse.json(orders);
}