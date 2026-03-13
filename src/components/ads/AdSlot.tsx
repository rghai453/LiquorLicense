"use client";

import { useEffect, useRef, type ReactElement } from "react";

interface AdSlotProps {
  slot: string;
  format?: "auto" | "horizontal" | "vertical" | "rectangle";
  className?: string;
}

export function AdSlot({
  slot,
  format = "auto",
  className,
}: AdSlotProps): ReactElement | null {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;
  if (!publisherId) return null;

  useEffect(() => {
    if (pushed.current) return;
    try {
      const adsbygoogle = (window as unknown as Record<string, unknown>)
        .adsbygoogle as unknown[];
      if (adsbygoogle) {
        adsbygoogle.push({});
        pushed.current = true;
      }
    } catch {
      // AdSense not loaded yet — ignore
    }
  }, []);

  return (
    <div className={className} style={{ minHeight: 90 }}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={publisherId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
