import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CampaignForm } from "./campaign-form";

export default function NewCampaignPage() {
  return (
    <main className="relative overflow-hidden px-4 py-8 lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-melon/20 blur-3xl"
      />
      <div className="relative mx-auto max-w-xl space-y-6">
        <Link
          href="/dashboard/campaigns"
          className="inline-flex items-center gap-1.5 text-sm text-mocha/70 transition hover:text-mocha"
        >
          <ArrowLeft size={16} />
          Back to campaigns
        </Link>

        <section className="rounded-3xl border border-border bg-card p-8 text-mocha shadow-xl shadow-mocha/10">
          <div className="h-1 w-10 rounded-full bg-melon" />
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">
            Create a campaign
          </h1>
          <p className="mt-1 text-sm text-mocha/70">
            You will get a link to share with contributors. They don&apos;t need
            an account.
          </p>
          <div className="mt-6">
            <CampaignForm />
          </div>
        </section>
      </div>
    </main>
  );
}