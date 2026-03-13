"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({
  error,
  reset,
}: ErrorPageProps): React.ReactElement {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center px-4 py-32 text-center">
      <AlertTriangle className="size-12 text-amber-500 mb-4" />
      <h1 className="text-3xl font-bold tracking-tight mb-2">
        Something went wrong
      </h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        An unexpected error occurred. Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-600"
      >
        Try again
      </button>
    </div>
  );
}
