import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Megaphone, Plus, Receipt, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BrandLogo } from "@/components/brand-logo";
import { LogoutButton } from "@/components/logout-button";

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

async function DashboardContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, title, slug, target_amount, created_at")
    .eq("organizer_id", user.id)
    .order("created_at", { ascending: false });

  // Totals come from verified (success) payments only.
  const campaignsWithProgress = await Promise.all(
    (campaigns ?? []).map(async (c) => {
      const { data } = await supabase.rpc("campaign_progress", {
        p_campaign_id: c.id,
      });
      return {
        ...c,
        raised: Number(data?.[0]?.total_collected ?? 0),
        count: Number(data?.[0]?.payment_count ?? 0),
      };
    })
  );

  const totalRaised = campaignsWithProgress.reduce((sum, c) => sum + c.raised, 0);
  const totalPayments = campaignsWithProgress.reduce((sum, c) => sum + c.count, 0);
  const firstName = (profile?.full_name || "").split(" ")[0];

  return (
    <main className="relative min-h-screen overflow-hidden bg-sand px-4 py-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-melon/20 blur-3xl"
      />

      <div className="relative mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <BrandLogo />
          <LogoutButton />
        </div>

        <div className="mt-10">
          <h1 className="text-3xl font-semibold tracking-tight text-mocha">
            {firstName ? `Welcome back, ${firstName}` : "Dashboard"}
          </h1>
          <p className="mt-1 text-sm text-mocha/70">
            Signed in as {profile?.full_name || user.email}
          </p>
        </div>

        {/* Summary tiles */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5 text-mocha shadow-lg shadow-mocha/5">
            <div className="inline-flex rounded-xl bg-mocha/10 p-2.5">
              <Megaphone size={18} />
            </div>
            <p className="mt-4 text-2xl font-bold">
              {campaignsWithProgress.length}
            </p>
            <p className="text-sm text-mocha/70">Campaigns</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 text-mocha shadow-lg shadow-mocha/5">
            <div className="inline-flex rounded-xl bg-melon/25 p-2.5">
              <Wallet size={18} />
            </div>
            <p className="mt-4 text-2xl font-bold">{formatNaira(totalRaised)}</p>
            <p className="text-sm text-mocha/70">Total raised</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 text-mocha shadow-lg shadow-mocha/5">
            <div className="inline-flex rounded-xl bg-mocha/10 p-2.5">
              <Receipt size={18} />
            </div>
            <p className="mt-4 text-2xl font-bold">{totalPayments}</p>
            <p className="text-sm text-mocha/70">Successful payments</p>
          </div>
        </div>

        {/* Campaigns */}
        <div className="mt-10 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-mocha">Your campaigns</h2>
          <Link
            href="/dashboard/campaigns/new"
            className="inline-flex items-center gap-2 rounded-full bg-melon px-5 py-2.5 text-sm font-semibold text-mocha transition hover:bg-melon/90"
          >
            <Plus size={16} />
            New campaign
          </Link>
        </div>

        {campaignsWithProgress.length > 0 ? (
          <ul className="mt-5 space-y-4">
            {campaignsWithProgress.map((c) => {
              const percent = Math.min(
                100,
                Math.round((c.raised / c.target_amount) * 100)
              );
              return (
                <li
                  key={c.id}
                  className="rounded-2xl border border-border bg-card p-6 text-mocha shadow-lg shadow-mocha/5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-lg font-semibold">{c.title}</p>
                    <span className="rounded-full bg-mocha/10 px-3 py-1 text-xs font-medium">
                      {c.count} {c.count === 1 ? "payment" : "payments"}
                    </span>
                  </div>

                  <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-mocha/10">
                    <div
                      className="h-full rounded-full bg-melon"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-sm">
                    <span className="font-medium">
                      {formatNaira(c.raised)} raised
                    </span>
                    <span className="text-mocha/70">
                      of {formatNaira(c.target_amount)} ({percent}%)
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3 text-sm">
                    <Link
                      href={`/dashboard/campaigns/${c.id}`}
                      className="rounded-full bg-mocha px-4 py-2 font-semibold text-sand transition hover:bg-mocha/90"
                    >
                      View payments
                    </Link>
                    <Link
                      href={`/c/${c.slug}`}
                      className="rounded-full border border-border px-4 py-2 font-medium text-mocha transition hover:bg-muted"
                    >
                      Public page: /c/{c.slug}
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-mocha/25 bg-card p-10 text-center text-mocha">
            <div className="mx-auto inline-flex rounded-xl bg-melon/25 p-3">
              <Megaphone size={22} />
            </div>
            <p className="mt-4 text-lg font-semibold">No campaigns yet</p>
            <p className="mt-1 text-sm text-mocha/70">
              Create your first campaign to get a shareable link.
            </p>
            <Link
              href="/dashboard/campaigns/new"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-melon px-5 py-2.5 text-sm font-semibold text-mocha transition hover:bg-melon/90"
            >
              <Plus size={16} />
              New campaign
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={<main className="min-h-screen bg-sand" aria-busy="true" />}
    >
      <DashboardContent />
    </Suspense>
  );
}