import Link from "next/link";
import { CampaignForm } from "./campaign-form";

export default function NewCampaignPage() {
  return (
    <main className="min-h-screen bg-sand px-4 py-10">
      <div className="mx-auto max-w-xl">
        <Link href="/dashboard" className="text-sm text-mocha/70 underline">
          ← Back to dashboard
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-mocha">
          New campaign
        </h1>
        <p className="mb-6 mt-1 text-sm text-mocha/70">
          You'll get a public link to share once it's created.
        </p>
        <div className="rounded-xl border border-mocha/15 bg-white/60 p-8">
          <CampaignForm />
        </div>
      </div>
    </main>
  );
}