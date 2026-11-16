import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
    <main className="min-h-screen bg-sand px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link
          href="/dashboard"
          className="text-sm text-mocha underline"
        >
          Back to dashboard
        </Link>

        <div className="rounded-xl border border-mocha/15 bg-white/60 p-8 text-mocha">
          <h1 className="text-2xl font-semibold">{campaign.title}</h1>
          <Link
            href={`/c/${campaign.slug}`}
            className="mt-1 inline-block text-sm underline"
          >
            View public page: /c/{campaign.slug}
          </Link>

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
              {paymentCount}{" "}
              {paymentCount === 1
                ? "successful payment"
                : "successful payments"}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-mocha/15 bg-white/60 p-8 text-mocha">
                    <div className="flex items-center justify-between">
            <h2 className="font-semibold">Payments</h2>
            <a
              href={`/dashboard/campaigns/${campaign.id}/export`}
              className="rounded-md bg-melon px-3 py-1.5 text-sm font-medium text-mocha hover:bg-melon/90"
            >
              Download CSV
            </a>
          </div>

          {payments && payments.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-mocha/15 text-mocha/70">
                    <th className="py-2 pr-4 font-medium">Name</th>
                    <th className="py-2 pr-4 font-medium">Email</th>
                    <th className="py-2 pr-4 font-medium">Amount</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                    <th className="py-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mocha/10">
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2 pr-4">{p.payer_name}</td>
                      <td className="py-2 pr-4">{p.payer_email}</td>
                      <td className="py-2 pr-4 font-medium">
                        {formatNaira(p.amount)}
                      </td>
                      <td className="py-2 pr-4">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            statusStyles[p.status] ?? "bg-mocha/10"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-2 whitespace-nowrap">
                        {formatDateTime(p.paid_at ?? p.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-1 text-sm text-mocha/70">
              No payments yet. Share your public link to get started.
            </p>
          )}
        </div>
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