import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ContributeForm } from "./contribute-form";

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(kobo / 100);
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

  const closed = campaign.deadline
    ? new Date(campaign.deadline).getTime() < Date.now()
    : false;

  return (
    <main className="min-h-screen bg-sand px-4 py-10">
      <div className="mx-auto max-w-xl space-y-6">
        <div className="rounded-xl border border-mocha/15 bg-white/60 p-8 text-mocha">
          <h1 className="text-2xl font-semibold">{campaign.title}</h1>
          {campaign.description && (
            <p className="mt-2 whitespace-pre-line text-sm text-mocha/80">
              {campaign.description}
            </p>
          )}

          <div className="mt-6">
            <div className="h-3 w-full overflow-hidden rounded-full bg-mocha/10">
              <div
                className="h-full rounded-full bg-melon"
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="font-medium">
                {formatNaira(totalCollected)} raised
              </span>
              <span className="text-mocha/70">
                of {formatNaira(campaign.target_amount)} ({percent}%)
              </span>
            </div>
            <p className="mt-1 text-sm text-mocha/70">
              {paymentCount} {paymentCount === 1 ? "contribution" : "contributions"}
            </p>
          </div>

          {campaign.fixed_amount && (
            <p className="mt-4 text-sm">
              Amount per person:{" "}
              <span className="font-medium">
                {formatNaira(campaign.fixed_amount)}
              </span>
            </p>
          )}
          {campaign.deadline && (
            <p className="mt-1 text-sm text-mocha/70">
              {closed ? "Closed on " : "Deadline: "}
              {new Date(campaign.deadline).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </div>

                <div className="rounded-xl border border-mocha/15 bg-white/60 p-8 text-mocha">
          <h2 className="font-semibold">Contribute</h2>
          {closed ? (
            <p className="mt-1 text-sm text-mocha/70">
              This campaign has closed.
            </p>
          ) : (
            <ContributeForm
              slug={slug}
              fixedAmountKobo={campaign.fixed_amount}
            />
          )}
        </div>

        <div className="rounded-xl border border-mocha/15 bg-white/60 p-8 text-mocha">
          <h2 className="font-semibold">Recent contributors</h2>
          {contributors && contributors.length > 0 ? (
            <ul className="mt-3 divide-y divide-mocha/10">
              {contributors.map(
                (
                  c: { payer_name: string; amount: number; paid_at: string },
                  i: number
                ) => (
                  <li key={i} className="flex justify-between py-2 text-sm">
                    <span>{c.payer_name}</span>
                    <span className="font-medium">{formatNaira(c.amount)}</span>
                  </li>
                )
              )}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-mocha/70">
              No contributions yet. Be the first.
            </p>
          )}
        </div>
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