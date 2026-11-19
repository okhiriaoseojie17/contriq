import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  ChevronDown,
  Download,
  Pencil,
  Receipt,
  Target,
  Wallet,
  Scale,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ShareButton } from "@/components/share-button";
import { DeleteCampaignButton } from "@/components/delete-campaign-button";

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
    .select("id, title, description, slug, target_amount, stop_at_goal")
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
  const target = Number(campaign.target_amount);
  const percent = Math.min(100, Math.round((totalCollected / target) * 100));
  const balance = Math.max(0, target - totalCollected);

  const { data: payments } = await supabase
    .from("payments")
    .select(
      "id, reference, amount, payer_name, payer_email, status, created_at, paid_at"
    )
    .eq("campaign_id", campaign.id)
    .order("created_at", { ascending: false })
    .limit(200);

  // Group by email (not name): every payment stays its own record,
  // but each payer is shown once.
  type Payment = NonNullable<typeof payments>[number];
  const groups = new Map<
    string,
    { email: string; name: string; items: Payment[] }
  >();
  for (const p of payments ?? []) {
    const key = p.payer_email.trim().toLowerCase();
    const g = groups.get(key);
    if (g) g.items.push(p);
    else groups.set(key, { email: p.payer_email, name: p.payer_name, items: [p] });
  }
  const payers = Array.from(groups.values()).map((g) => {
    const ok = g.items.filter((i) => i.status === "success");
    return {
      ...g,
      successCount: ok.length,
      successTotal: ok.reduce((s, i) => s + Number(i.amount), 0),
      latest: g.items[0],
    };
  });

  return (
    <main className="relative overflow-hidden px-4 py-8 lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-melon/20 blur-3xl"
      />

      <div className="relative mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/campaigns"
            className="inline-flex items-center gap-1.5 text-sm text-mocha/70 transition hover:text-mocha"
          >
            <ArrowLeft size={16} />
            Back to campaigns
          </Link>
        </div>

        {/* Campaign summary */}
        <section className="rounded-3xl border border-border bg-card p-8 text-mocha shadow-xl shadow-mocha/10">
          <div className="h-1 w-10 rounded-full bg-melon" />
          <h1 className="mt-5 text-3xl font-semibold tracking-tight">
            {campaign.title}
          </h1>
          {campaign.description && (
            <p className="mt-2 whitespace-pre-line text-sm font-normal text-mocha/60">
              {campaign.description}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <ShareButton slug={campaign.slug} title={campaign.title} />
            <Link
              href={`/c/${campaign.slug}`}
              className="rounded-full border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted"
            >
              Open public page
            </Link>
            <Link
              href={`/dashboard/campaigns/${campaign.id}/edit`}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted"
            >
              <Pencil size={15} />
              Edit
            </Link>
            <DeleteCampaignButton id={campaign.id} title={campaign.title} />
          </div>

          <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-mocha/10">
            <div
              className="h-full rounded-full bg-melon"
              style={{ width: `${percent}%` }}
            />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl bg-mocha/5 p-4">
              <Wallet size={18} />
              <p className="mt-2 text-xl font-bold">
                {formatNaira(totalCollected)}
              </p>
              <p className="text-xs text-mocha/70">Raised</p>
            </div>
            <div className="rounded-2xl bg-mocha/5 p-4">
              <Scale size={18} />
              <p className="mt-2 text-xl font-bold">{formatNaira(balance)}</p>
              <p className="text-xs text-mocha/70">Balance remaining</p>
            </div>
            <div className="rounded-2xl bg-mocha/5 p-4">
              <Target size={18} />
              <p className="mt-2 text-xl font-bold">{percent}%</p>
              <p className="text-xs text-mocha/70">of {formatNaira(target)} goal</p>
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
          {campaign.stop_at_goal && (
            <p className="mt-4 text-xs text-mocha/60">
              This campaign stops accepting payments once the goal is reached.
            </p>
          )}
        </section>

        {/* Payers */}
        <section className="rounded-3xl border border-border bg-card p-8 text-mocha shadow-lg shadow-mocha/5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Payers</h2>
            <a
              href={`/dashboard/campaigns/${campaign.id}/export`}
              className="inline-flex items-center gap-2 rounded-full bg-melon px-4 py-2 text-sm font-semibold text-mocha transition hover:bg-melon/90"
            >
              <Download size={15} />
              Download CSV
            </a>
          </div>

          {payers.length > 0 ? (
            <ul className="mt-5 divide-y divide-mocha/10">
              {payers.map((p) => (
                <li key={p.email.toLowerCase()}>
                  <details className="group py-3">
                    <summary className="flex cursor-pointer list-none items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{p.name}</p>
                        <p className="truncate text-xs text-mocha/70">
                          {p.email}
                        </p>
                      </div>
                      <div className="text-right">
                        {p.successCount > 0 ? (
                          <>
                            <p className="text-sm font-semibold">
                              {formatNaira(p.successTotal)}
                            </p>
                            <p className="text-xs text-mocha/60">
                              {p.successCount}{" "}
                              {p.successCount === 1 ? "payment" : "payments"}
                            </p>
                          </>
                        ) : (
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              statusStyles[p.latest.status] ?? "bg-mocha/10"
                            }`}
                          >
                            {p.latest.status}
                          </span>
                        )}
                      </div>
                      <ChevronDown
                        size={16}
                        className="shrink-0 text-mocha/50 transition group-open:rotate-180"
                      />
                    </summary>

                    <ul className="mt-3 space-y-2 rounded-2xl bg-mocha/5 p-3">
                      {p.items.map((i) => (
                        <li
                          key={i.id}
                          className="flex flex-wrap items-center justify-between gap-2 text-xs"
                        >
                          <span className="whitespace-nowrap text-mocha/80">
                            {formatDateTime(i.paid_at ?? i.created_at)}
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="text-sm font-semibold">
                              {formatNaira(Number(i.amount))}
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-1 font-medium ${
                                statusStyles[i.status] ?? "bg-mocha/10"
                              }`}
                            >
                              {i.status}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              ))}
            </ul>
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