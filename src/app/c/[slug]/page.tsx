import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CalendarClock, HeartHandshake, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BrandLogo } from "@/components/brand-logo";
import { ContributeForm } from "./contribute-form";

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

function isPastDeadline(deadline: string | null) {
  return deadline ? new Date(deadline).getTime() < Date.now() : false;
}

function daysUntil(deadline: string) {
  const ms = new Date(deadline).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

async function CampaignContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, title, description, target_amount, fixed_amount, deadline")
    .eq("slug", slug)
    .maybeSingle();

  if (!campaign) {
    notFound();
  }

  const { data: progressRows } = await supabase.rpc("campaign_progress", {
    p_campaign_id: campaign.id,
  });
  const { data: contributors } = await supabase.rpc(
    "campaign_recent_contributors",
    { p_campaign_id: campaign.id, p_limit: 10 }
  );

  const totalCollected: number = Number(progressRows?.[0]?.total_collected ?? 0);
  const paymentCount: number = Number(progressRows?.[0]?.payment_count ?? 0);
  const percent = Math.min(
    100,
    Math.round((totalCollected / campaign.target_amount) * 100)
  );

  const closed = isPastDeadline(campaign.deadline);
  const daysLeft = campaign.deadline && !closed ? daysUntil(campaign.deadline) : null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-sand px-4 py-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-melon/25 blur-3xl"
      />

      <div className="relative mx-auto max-w-xl space-y-5">
        <div className="flex justify-center">
          <BrandLogo />
        </div>

        {/* Campaign summary */}
        <section className="rounded-3xl border border-border bg-card p-8 text-mocha shadow-xl shadow-mocha/10">
          <div className="flex flex-wrap items-center gap-2">
            {closed ? (
              <span className="rounded-full bg-mocha/10 px-3 py-1 text-xs font-medium">
                Closed
              </span>
            ) : daysLeft !== null ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-melon/25 px-3 py-1 text-xs font-medium">
                <CalendarClock size={13} />
                {daysLeft === 0
                  ? "Last day"
                  : `${daysLeft} ${daysLeft === 1 ? "day" : "days"} left`}
              </span>
            ) : (
              <span className="rounded-full bg-melon/25 px-3 py-1 text-xs font-medium">
                Open for contributions
              </span>
            )}
          </div>

          <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight">
            {campaign.title}
          </h1>
          {campaign.description && (
            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-mocha/80">
              {campaign.description}
            </p>
          )}

          <div className="mt-8">
            <p className="text-4xl font-bold tracking-tight">
              {formatNaira(totalCollected)}
            </p>
            <p className="mt-1 text-sm text-mocha/70">
              raised of {formatNaira(campaign.target_amount)} goal
            </p>

            <div className="mt-4 h-3.5 w-full overflow-hidden rounded-full bg-mocha/10">
              <div
                className="h-full rounded-full bg-melon transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-mocha/5 p-4">
                <HeartHandshake size={18} className="text-mocha" />
                <p className="mt-2 text-xl font-bold">{percent}%</p>
                <p className="text-xs text-mocha/70">of the goal reached</p>
              </div>
              <div className="rounded-2xl bg-mocha/5 p-4">
                <Users size={18} className="text-mocha" />
                <p className="mt-2 text-xl font-bold">{paymentCount}</p>
                <p className="text-xs text-mocha/70">
                  {paymentCount === 1 ? "contribution" : "contributions"}
                </p>
              </div>
            </div>
          </div>

          {campaign.deadline && (
            <p className="mt-5 text-sm text-mocha/70">
              {closed ? "Closed on " : "Deadline: "}
              {new Date(campaign.deadline).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </section>

        {/* Contribute */}
        <section className="rounded-3xl border border-border bg-card p-8 text-mocha shadow-lg shadow-mocha/5">
          <h2 className="text-xl font-semibold">Contribute</h2>
          {closed ? (
            <p className="mt-2 text-sm text-mocha/70">
              This campaign has closed and is no longer taking contributions.
            </p>
          ) : (
            <>
              <p className="mt-1 text-sm text-mocha/70">
                No account needed. It takes under a minute.
              </p>
              <ContributeForm
                slug={slug}
                fixedAmountKobo={campaign.fixed_amount}
              />
            </>
          )}
        </section>

        {/* Recent contributors */}
        <section className="rounded-3xl border border-border bg-card p-8 text-mocha shadow-lg shadow-mocha/5">
          <h2 className="text-xl font-semibold">Recent contributors</h2>
          {contributors && contributors.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {contributors.map(
                (
                  c: { payer_name: string; amount: number; paid_at: string },
                  i: number
                ) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mocha text-sm font-semibold text-sand">
                      {initials(c.payer_name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {c.payer_name}
                      </p>
                      <p className="text-xs text-mocha/60">
                        {new Date(c.paid_at).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                    <span className="text-sm font-semibold">
                      {formatNaira(c.amount)}
                    </span>
                  </li>
                )
              )}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-mocha/70">
              No contributions yet. Be the first.
            </p>
          )}
        </section>

        <p className="pb-4 text-center text-xs text-mocha/60">
          Collected with Contriq. Contributions without the confusion.
        </p>
      </div>
    </main>
  );
}

export default function CampaignPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={<main className="min-h-screen bg-sand" aria-busy="true" />}
    >
      <CampaignContent params={params} />
    </Suspense>
  );
}