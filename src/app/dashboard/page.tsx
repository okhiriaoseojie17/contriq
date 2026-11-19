import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity, ArrowRight, Clock, Megaphone, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  formatNaira,
  initials,
  isPastDeadline,
  relationTitle,
  timeAgo,
} from "@/lib/format";

async function OverviewContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, username")
    .eq("id", user.id)
    .single();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, title, target_amount, deadline, is_active")
    .eq("organizer_id", user.id)
    .order("created_at", { ascending: false });

  // Totals come from verified (success) payments only.
  const withProgress = await Promise.all(
    (campaigns ?? []).map(async (c) => {
      const { data } = await supabase.rpc("campaign_progress", {
        p_campaign_id: c.id,
      });
      return { ...c, raised: Number(data?.[0]?.total_collected ?? 0) };
    })
  );

  const { data: recent } = await supabase
    .from("payments")
    .select("id, amount, payer_name, paid_at, campaigns(title)")
    .eq("status", "success")
    .not("paid_at", "is", null)
    .order("paid_at", { ascending: false })
    .limit(5);

  const latest = recent?.[0] ?? null;
  const activeCount = withProgress.filter(
    (c) => c.is_active && !isPastDeadline(c.deadline)
  ).length;
  const name = profile?.username || (profile?.full_name || "").split(" ")[0];

  return (
    <main className="relative overflow-hidden px-4 py-8 lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-melon/20 blur-3xl"
      />
      <div className="relative mx-auto max-w-4xl">
        <h1 className="text-3xl font-semibold tracking-tight text-mocha">
          {name ? `Welcome back, ${name}` : "Welcome back"}
        </h1>
        <p className="mt-1 text-sm text-mocha/70">
          Here is how your campaigns are doing.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5 text-mocha shadow-lg shadow-mocha/5">
            <div className="inline-flex rounded-xl bg-mocha/10 p-2.5">
              <Megaphone size={18} />
            </div>
            <p className="mt-4 text-2xl font-bold">{withProgress.length}</p>
            <p className="text-sm text-mocha/70">Campaigns</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 text-mocha shadow-lg shadow-mocha/5">
            <div className="inline-flex rounded-xl bg-melon/25 p-2.5">
              <Activity size={18} />
            </div>
            <p className="mt-4 text-2xl font-bold">{activeCount}</p>
            <p className="text-sm text-mocha/70">Active campaigns</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 text-mocha shadow-lg shadow-mocha/5">
            <div className="inline-flex rounded-xl bg-mocha/10 p-2.5">
              <Clock size={18} />
            </div>
            {latest ? (
              <>
                <p className="mt-4 text-2xl font-bold">
                  {formatNaira(Number(latest.amount))}
                </p>
                <p className="text-sm text-mocha/70">
                  Latest payment, {timeAgo(latest.paid_at as string)}
                </p>
              </>
            ) : (
              <>
                <p className="mt-4 text-2xl font-bold">None yet</p>
                <p className="text-sm text-mocha/70">Latest payment</p>
              </>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Recent payments */}
          <section className="rounded-3xl border border-border bg-card p-6 text-mocha shadow-lg shadow-mocha/5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent payments</h2>
              <Link
                href="/dashboard/payments"
                className="inline-flex items-center gap-1 text-sm text-mocha/70 hover:text-mocha"
              >
                See all <ArrowRight size={14} />
              </Link>
            </div>
            {recent && recent.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {recent.map((p) => (
                  <li key={p.id} className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mocha text-sm font-semibold text-sand">
                      {initials(p.payer_name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.payer_name}</p>
                      <p className="truncate text-xs text-mocha/60">
                        {relationTitle(p.campaigns)} · {timeAgo(p.paid_at as string)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold">
                      {formatNaira(Number(p.amount))}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-mocha/70">
                No payments yet. Share a campaign link to get started.
              </p>
            )}
          </section>

          {/* Campaign progress */}
          <section className="rounded-3xl border border-border bg-card p-6 text-mocha shadow-lg shadow-mocha/5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Campaign progress</h2>
              <Link
                href="/dashboard/campaigns"
                className="inline-flex items-center gap-1 text-sm text-mocha/70 hover:text-mocha"
              >
                Manage <ArrowRight size={14} />
              </Link>
            </div>
            {withProgress.length > 0 ? (
              <ul className="mt-4 space-y-4">
                {withProgress.slice(0, 4).map((c) => {
                  const target = Number(c.target_amount);
                  const percent = Math.min(
                    100,
                    Math.round((c.raised / target) * 100)
                  );
                  return (
                    <li key={c.id}>
                      <Link href={`/dashboard/campaigns/${c.id}`} className="block">
                        <div className="flex justify-between gap-3 text-sm">
                          <span className="truncate font-medium">{c.title}</span>
                          <span className="shrink-0 text-mocha/70">{percent}%</span>
                        </div>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-mocha/10">
                          <div
                            className="h-full rounded-full bg-melon"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <p className="mt-1 text-xs text-mocha/60">
                          {formatNaira(c.raised)} of {formatNaira(target)}
                        </p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="mt-4 text-center">
                <p className="text-sm text-mocha/70">No campaigns yet.</p>
                <Link
                  href="/dashboard/campaigns/new"
                  className="mt-3 inline-flex items-center gap-2 rounded-full bg-melon px-5 py-2.5 text-sm font-semibold text-mocha transition hover:bg-melon/90"
                >
                  <Plus size={16} />
                  New campaign
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<main className="min-h-screen" aria-busy="true" />}>
      <OverviewContent />
    </Suspense>
  );
}