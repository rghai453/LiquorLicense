import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (userId && session.mode === "subscription") {
        await db
          .update(users)
          .set({
            subscriptionTier: "pro",
            stripeCustomerId: session.customer as string,
            subscriptionId: session.subscription as string,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await db
        .update(users)
        .set({
          subscriptionTier: "free",
          subscriptionId: null,
          updatedAt: new Date(),
        })
        .where(eq(users.stripeCustomerId, subscription.customer as string));
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      console.error(
        `Payment failed for customer ${invoice.customer}:`,
        invoice.id
      );
      break;
    }
  }

  return NextResponse.json({ received: true });
}
