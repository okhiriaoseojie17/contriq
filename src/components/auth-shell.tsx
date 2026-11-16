import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-sand px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-melon/25 blur-3xl"
      />

      <div className="relative w-full max-w-md">
        <div className="flex items-center justify-between">
          <BrandLogo />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-mocha/70 transition hover:text-mocha"
          >
            <ArrowLeft size={16} />
            Back to home
          </Link>
        </div>

        <div className="mt-8 rounded-3xl border border-border bg-card p-8 shadow-xl shadow-mocha/10">
          <div className="h-1 w-10 rounded-full bg-melon" />
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-mocha">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-mocha/70">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>

        <p className="mt-6 text-center text-sm text-mocha/70">{footer}</p>
      </div>
    </main>
  );
}