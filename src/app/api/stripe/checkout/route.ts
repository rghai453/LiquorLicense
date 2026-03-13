import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { email, userId, mode, priceId } = body as {
      email: string;
      userId: string;
      mode: "subscription" | "payment";
      priceId?: string;
    };

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (mode === "subscription") {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer_email: email,
        line_items: [
          { price: process.env.STRIPE_PRICE_PRO_MONTHLY!, quantity: 1 },
        ],
        success_url: `${BASE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${BASE_URL}/pricing`,
        metadata: { userId },
      });
      return NextResponse.json({ url: session.url });
    }

    if (mode === "payment" && priceId) {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: email,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${BASE_URL}/data/download?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${BASE_URL}/data`,
        metadata: { userId },
      });
      return NextResponse.json({ url: session.url });
    }

    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
