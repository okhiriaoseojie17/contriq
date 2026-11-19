import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Megaphone, Pencil, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ShareButton } from "@/components/share-button";
import { DeleteCampaignButton } from "@/components/delete-campaign-button";
import { formatNaira, isPastDeadline } from "@/lib/format";

async function CampaignsContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, title, description, slug, target_amount, deadline, is_active, stop_at_goal")
    .eq("organizer_id", user.id)
    .order("created_at", { ascending: false });

  const list = await Promise.all(
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

  return (
    <main className="relative overflow-hidden px-4 py-8 lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-melon/20 blur-3xl"
      />
      <div className="relative mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-mocha">
              Campaigns
            </h1>
            <p className="mt-1 text-sm text-mocha/70">
              Share, edit and manage everything you are collecting for.
            </p>
          </div>
          <Link
            href="/dashboard/campaigns/new"
            className="inline-flex items-center gap-2 rounded-full bg-melon px-5 py-2.5 text-sm font-semibold text-mocha transition hover:bg-melon/90"
          >
            <Plus size={16} />
            New campaign
          </Link>
        </div>

        {list.length > 0 ? (
          <ul className="mt-6 space-y-4">
            {list.map((c) => {
              const target = Number(c.target_amount);
              const percent = Math.min(100, Math.round((c.raised / target) * 100));
              const balance = Math.max(0, target - c.raised);
              const goalReached = c.stop_at_goal && c.raised >= target;
              const closed = isPastDeadline(c.deadline);
              const status = goalReached
                ? { label: "Goal reached", style: "bg-green-100 text-green-800" }
                : closed
                  ? { label: "Closed", style: "bg-mocha/10" }
                  : { label: "Active", style: "bg-melon/25" };
              return (
                <li
                  key={c.id}
                  className="rounded-2xl border border-border bg-card p-6 text-mocha shadow-lg shadow-mocha/5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-lg font-semibold">{c.title}</p>
                      {c.description && (
                        <p className="mt-1 line-clamp-2 text-sm font-normal text-mocha/60">
                          {c.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.style}`}>
                        {status.label}
                      </span>
                      <span className="rounded-full bg-mocha/10 px-3 py-1 text-xs font-medium">
                        {c.count} {c.count === 1 ? "payment" : "payments"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-mocha/10">
                    <div
                      className="h-full rounded-full bg-melon"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap justify-between gap-x-4 text-sm">
                    <span className="font-medium">
                      {formatNaira(c.raised)} raised of {formatNaira(target)} ({percent}%)
                    </span>
                    <span className="text-mocha/70">{formatNaira(balance)} left</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3 text-sm">
                    <Link
                      href={`/dashboard/campaigns/${c.id}`}
                      className="rounded-full bg-mocha px-4 py-2 font-semibold text-sand transition hover:bg-mocha/90"
                    >
                      View payments
                    </Link>
                    <ShareButton slug={c.slug} title={c.title} />
                    <Link
                      href={`/dashboard/campaigns/${c.id}/edit`}
                      className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 font-medium text-mocha transition hover:bg-muted"
                    >
                      <Pencil size={15} />
                      Edit
                    </Link>
                    <DeleteCampaignButton id={c.id} title={c.title} />
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-mocha/25 bg-card p-10 text-center text-mocha">
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

export default function CampaignsPage() {
  return (
    <Suspense fallback={<main className="min-h-screen" aria-busy="true" />}>
      <CampaignsContent />
    </Suspense>
  );
}