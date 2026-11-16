import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Download, Receipt, Target, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BrandLogo } from "@/components/brand-logo";

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const statusStyles: Record<string, string> = {
  success: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
};

async function CampaignDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Only the campaign's own organizer can open this page.
  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, title, slug, target_amount")
    .eq("id", id)
    .eq("organizer_id", user.id)
    .maybeSingle();

  if (!campaign) {
    notFound();
  }

  // Totals come from verified (success) payments only.
  const { data: progressRows } = await supabase.rpc("campaign_progress", {
    p_campaign_id: campaign.id,
  });
  const totalCollected = Number(progressRows?.[0]?.total_collected ?? 0);
  const paymentCount = Number(progressRows?.[0]?.payment_count ?? 0);
  const percent = Math.min(
    100,
    Math.round((totalCollected / campaign.target_amount) * 100)
  );

  const { data: payments } = await supabase
    .from("payments")
    .select(
      "id, reference, amount, payer_name, payer_email, status, created_at, paid_at"
    )
    .eq("campaign_id", campaign.id)
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <main className="relative min-h-screen overflow-hidden bg-sand px-4 py-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-melon/20 blur-3xl"
      />

      <div className="relative mx-auto max-w-4xl space-y-6">
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

        {/* Campaign summary */}
        <section className="rounded-3xl border border-border bg-card p-8 text-mocha shadow-xl shadow-mocha/10">
          <div className="h-1 w-10 rounded-full bg-melon" />
          <h1 className="mt-5 text-3xl font-semibold tracking-tight">
            {campaign.title}
          </h1>
          <Link
            href={`/c/${campaign.slug}`}
            className="mt-1 inline-block text-sm text-mocha/70 underline"
          >
            Public page: /c/{campaign.slug}
          </Link>

          <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-mocha/10">
            <div
              className="h-full rounded-full bg-melon"
              style={{ width: `${percent}%` }}
            />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-mocha/5 p-4">
              <Wallet size={18} />
              <p className="mt-2 text-xl font-bold">
                {formatNaira(totalCollected)}
              </p>
              <p className="text-xs text-mocha/70">Raised</p>
            </div>
            <div className="rounded-2xl bg-mocha/5 p-4">
              <Target size={18} />
              <p className="mt-2 text-xl font-bold">{percent}%</p>
              <p className="text-xs text-mocha/70">
                of {formatNaira(campaign.target_amount)} goal
              </p>
            </div>
            <div className="rounded-2xl bg-mocha/5 p-4">
              <Receipt size={18} />
              <p className="mt-2 text-xl font-bold">{paymentCount}</p>
              <p className="text-xs text-mocha/70">
                {paymentCount === 1
                  ? "successful payment"
                  : "successful payments"}
              </p>
            </div>
          </div>
        </section>

        {/* Payments table */}
        <section className="rounded-3xl border border-border bg-card p-8 text-mocha shadow-lg shadow-mocha/5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Payments</h2>
            <a
              href={`/dashboard/campaigns/${campaign.id}/export`}
              className="inline-flex items-center gap-2 rounded-full bg-melon px-4 py-2 text-sm font-semibold text-mocha transition hover:bg-melon/90"
            >
              <Download size={15} />
              Download CSV
            </a>
          </div>

          {payments && payments.length > 0 ? (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wide text-mocha/60">
                    <th className="py-3 pr-4 font-medium">Name</th>
                    <th className="py-3 pr-4 font-medium">Email</th>
                    <th className="py-3 pr-4 font-medium">Amount</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                    <th className="py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mocha/10">
                  {payments.map((p) => (
                    <tr key={p.id} className="transition hover:bg-mocha/5">
                      <td className="py-3 pr-4 font-medium">{p.payer_name}</td>
                      <td className="py-3 pr-4 text-mocha/80">
                        {p.payer_email}
                      </td>
                      <td className="py-3 pr-4 font-semibold">
                        {formatNaira(p.amount)}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            statusStyles[p.status] ?? "bg-mocha/10"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap py-3 text-mocha/80">
                        {formatDateTime(p.paid_at ?? p.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-mocha/25 p-8 text-center">
              <p className="font-semibold">No payments yet</p>
              <p className="mt-1 text-sm text-mocha/70">
                Share your public link to get started.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={<main className="min-h-screen bg-sand" aria-busy="true" />}
    >
      <CampaignDetailContent params={params} />
    </Suspense>
  );
}