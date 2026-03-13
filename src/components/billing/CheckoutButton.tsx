"use client";

import { useState, type ReactElement } from "react";
import { cn } from "@/lib/utils";

interface CheckoutButtonProps {
  priceId?: string;
  label?: string;
  fullWidth?: boolean;
}

export function CheckoutButton({
  priceId,
  label = "Buy CSV",
  fullWidth,
}: CheckoutButtonProps): ReactElement {
  const [loading, setLoading] = useState(false);

  async function handleCheckout(): Promise<void> {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      const data = (await res.json()) as { url?: string; error?: string };

      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={loading}
      className={cn(
        "rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-600 disabled:opacity-50",
        fullWidth && "w-full"
      )}
    >
      {loading ? "Loading..." : label}
    </button>
  );
}
