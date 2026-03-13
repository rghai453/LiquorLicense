"use client";

import { useEffect, useRef } from "react";

interface DownloadTriggerProps {
  sessionId: string;
  listSlug: string;
}

export function DownloadTrigger({
  sessionId,
  listSlug,
}: DownloadTriggerProps): null {
  const triggered = useRef(false);

  useEffect(() => {
    if (triggered.current) return;
    triggered.current = true;

    const link = document.createElement("a");
    link.href = `/api/data-lists/${listSlug}/download?session_id=${sessionId}`;
    link.download = "";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, [sessionId, listSlug]);

  return null;
}
