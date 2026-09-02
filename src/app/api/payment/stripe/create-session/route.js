import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// Creates a Stripe Checkout session for a given order.
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { orderId, items, totalPrice } = await req.json();

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: { name: item.name, images: item.image ? [item.image] : [] },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      metadata: { orderId },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders/${orderId}?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?payment=cancelled`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Could not start Stripe checkout" }, { status: 500 });
  }
}
