import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { CampaignForm } from "./campaign-form";

export default function NewCampaignPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-sand px-4 py-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-melon/20 blur-3xl"
      />

      <div className="relative mx-auto max-w-xl">
        <div className="flex items-center justify-between">
          <BrandLogo />
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-mocha/70 transition hover:text-mocha"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>
        </div>

        <div className="mt-8 rounded-3xl border border-border bg-card p-8 shadow-xl shadow-mocha/10">
          <div className="h-1 w-10 rounded-full bg-melon" />
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-mocha">
            New campaign
          </h1>
          <p className="mt-2 text-sm leading-6 text-mocha/70">
            You&apos;ll get a public link to share once it&apos;s created.
          </p>
          <div className="mt-6">
            <CampaignForm />
          </div>
        </div>
      </div>
    </main>
  );
}