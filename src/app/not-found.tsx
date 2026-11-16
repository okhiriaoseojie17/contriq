import Link from "next/link";
import { SearchX } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-sand px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-melon/25 blur-3xl"
      />

      <div className="relative w-full max-w-md text-center text-mocha">
        <div className="flex justify-center">
          <BrandLogo />
        </div>

        <div className="mt-8 rounded-3xl border border-border bg-card p-10 shadow-xl shadow-mocha/10">
          <div className="mx-auto inline-flex rounded-2xl bg-melon/25 p-4">
            <SearchX size={28} />
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight">
            Page not found
          </h1>
          <p className="mt-2 text-sm leading-6 text-mocha/70">
            This link may be wrong, or the campaign may no longer exist. Check
            the link you were sent and try again.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-full bg-mocha px-6 py-3 text-sm font-semibold text-sand transition hover:bg-mocha/90"
          >
            Go to Contriq home
          </Link>
        </div>
      </div>
    </main>
  );
}