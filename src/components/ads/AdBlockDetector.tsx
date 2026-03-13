"use client";

import { useEffect, useState, type ReactElement } from "react";

export function AdBlockDetector(): ReactElement | null {
  const [adBlocked, setAdBlocked] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Skip if no publisher ID configured
    if (!process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID) return;

    // Skip if user already dismissed this session
    if (sessionStorage.getItem("ab_dismissed") === "1") {
      setDismissed(true);
      return;
    }

    // Give AdSense time to load, then check
    const timer = setTimeout(() => {
      const detected = detectAdBlock();
      setAdBlocked(detected);
    }, 2500);

    return (): void => clearTimeout(timer);
  }, []);

  if (!adBlocked || dismissed) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6">
      <div className="mx-auto max-w-2xl rounded-xl bg-stone-900 text-white shadow-2xl border border-stone-700 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 text-2xl" aria-hidden="true">
            🛡️
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-base">
              Ad blocker detected
            </p>
            <p className="mt-1 text-sm text-stone-300 leading-relaxed">
              BarBook Texas is free because of ads. Please consider whitelisting
              us — we keep ads minimal and non-intrusive (max 3 per page, never
              above the fold).
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium bg-stone-700 hover:bg-stone-600 transition-colors cursor-pointer"
            aria-label="Dismiss ad blocker notice"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );

  function handleDismiss(): void {
    setDismissed(true);
    sessionStorage.setItem("ab_dismissed", "1");
  }
}

function detectAdBlock(): boolean {
  // Method 1: Check if adsbygoogle script loaded
  const adsbyGoogle = (window as unknown as Record<string, unknown>).adsbygoogle;
  if (!adsbyGoogle) return true;

  // Method 2: Create a bait element with ad-related classes and check visibility
  const bait = document.createElement("div");
  bait.className =
    "adsbox ad-slot ad-banner textads banner-ads";
  bait.style.cssText =
    "position:absolute;top:-9999px;left:-9999px;width:1px;height:1px;";
  document.body.appendChild(bait);

  const blocked =
    bait.offsetHeight === 0 ||
    bait.clientHeight === 0 ||
    getComputedStyle(bait).display === "none" ||
    getComputedStyle(bait).visibility === "hidden";

  document.body.removeChild(bait);

  if (blocked) return true;

  // Method 3: Check if any ad slots on the page were collapsed
  const adSlots = document.querySelectorAll(".adsbygoogle");
  for (const slot of adSlots) {
    const el = slot as HTMLElement;
    if (
      el.dataset.adStatus === "unfilled" ||
      el.innerHTML.trim() === ""
    ) {
      // Empty ad slot could mean blocked
      return true;
    }
  }

  return false;
}
