import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "BarBook Texas privacy policy. Learn how we handle your data, cookies, and third-party services.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage(): React.ReactElement {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <nav className="mb-8 flex items-center gap-1.5 text-sm text-stone-400">
        <Link href="/" className="transition-colors hover:text-amber-600">
          Home
        </Link>
        <ChevronRight className="size-3" />
        <span className="font-medium text-stone-700">Privacy Policy</span>
      </nav>

      <h1 className="text-4xl font-bold tracking-tight text-stone-900">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-stone-400">
        Last updated: March 20, 2026
      </p>

      <div className="mt-8 space-y-8 text-stone-600 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-stone-900">Overview</h2>
          <p className="mt-3">
            BarBook Texas (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
            operates the website barbooktx.com. This page informs you of our
            policies regarding the collection, use, and disclosure of personal
            information when you use our service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900">
            Information We Collect
          </h2>
          <p className="mt-3">
            We do not require user accounts or registration. The information we
            collect is limited to:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              <strong>Payment information:</strong> When you purchase a data list,
              payment is processed securely by Stripe. We do not store credit card
              numbers. Stripe may collect your email address and billing details
              per their privacy policy.
            </li>
            <li>
              <strong>Usage data:</strong> We collect standard web analytics data
              including pages visited, referral source, browser type, and device
              type. This data is aggregated and not tied to individual users.
            </li>
            <li>
              <strong>Cookies:</strong> We use cookies for essential site
              functionality and for third-party advertising (Google AdSense).
              AdSense may use cookies to serve personalized ads based on your
              browsing history.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900">
            Public Records Data
          </h2>
          <p className="mt-3">
            All liquor license data displayed on BarBook Texas is sourced from
            publicly available government records published by the Texas Alcoholic
            Beverage Commission (TABC) and the Texas Comptroller of Public
            Accounts. This information is public record under the Texas Public
            Information Act.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900">
            Third-Party Services
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              <strong>Stripe:</strong> Payment processing. See{" "}
              <a
                href="https://stripe.com/privacy"
                className="text-amber-600 hover:text-amber-700"
                target="_blank"
                rel="noopener noreferrer"
              >
                Stripe&apos;s Privacy Policy
              </a>
              .
            </li>
            <li>
              <strong>Google AdSense:</strong> Display advertising. See{" "}
              <a
                href="https://policies.google.com/privacy"
                className="text-amber-600 hover:text-amber-700"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google&apos;s Privacy Policy
              </a>
              .
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900">
            Your Rights
          </h2>
          <p className="mt-3">
            Since we do not maintain user accounts or store personal data beyond
            what Stripe collects for payment processing, there is minimal personal
            data to manage. If you have questions about data Stripe holds, please
            contact Stripe directly or reach out to us.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900">Contact</h2>
          <p className="mt-3">
            If you have questions about this privacy policy, contact us at{" "}
            <a
              href="mailto:data@barbooktx.com"
              className="font-medium text-amber-600 hover:text-amber-700"
            >
              data@barbooktx.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
