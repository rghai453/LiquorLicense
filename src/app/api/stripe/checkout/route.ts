import { NextResponse, type NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const PRICE_TO_LIST: Record<string, string> = {
  [process.env.STRIPE_PRICE_NEW_APPLICATIONS!]: "new-applications",
  [process.env.STRIPE_PRICE_ACTIVE_BARS!]: "active-bars",
  [process.env.STRIPE_PRICE_FULL_DATABASE!]: "full-database",
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as { priceId?: string };

    if (!body.priceId) {
      return NextResponse.json(
        { error: "priceId is required" },
        { status: 400 }
      );
    }

    const listSlug = PRICE_TO_LIST[body.priceId];
    if (!listSlug) {
      return NextResponse.json(
        { error: "Invalid priceId" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: body.priceId, quantity: 1 }],
      success_url: `${BASE_URL}/pricing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/pricing`,
      metadata: { list_slug: listSlug },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
