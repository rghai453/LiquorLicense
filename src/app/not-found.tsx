import Link from "next/link";
import { FileX2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export default function NotFound(): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-32 text-center">
      <FileX2 className="size-12 text-muted-foreground mb-4" />
      <h1 className="text-3xl font-bold tracking-tight mb-2">
        Page Not Found
      </h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link href="/" className={cn(buttonVariants())}>
          Go Home
        </Link>
        <Link
          href="/directory"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Browse Directory
        </Link>
      </div>
    </div>
  );
}
