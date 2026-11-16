import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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

  return (
    <main className="min-h-screen bg-sand px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-mocha">Dashboard</h1>
            <p className="text-sm text-mocha/70">
              Signed in as {profile?.full_name || user.email}
            </p>
          </div>
          <LogoutButton />
        </div>

        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-mocha">Your campaigns</h2>
          <Link
            href="/dashboard/campaigns/new"
            className="rounded-md bg-melon px-4 py-2 text-sm font-medium text-mocha hover:bg-melon/90"
          >
            New campaign
          </Link>
        </div>

        {campaigns && campaigns.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {campaigns.map((c) => (
              <li
                key={c.id}
                className="rounded-xl border border-mocha/15 bg-white/60 p-5 text-mocha"
              >
                <p className="font-medium">{c.title}</p>
                <p className="mt-1 text-sm text-mocha/70">
                  Target: {formatNaira(c.target_amount)}
                </p>
                <Link
                  href={`/c/${c.slug}`}
                  className="mt-1 inline-block text-sm text-mocha underline"
                >
                  View public page: /c/{c.slug}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4 rounded-xl border border-mocha/15 bg-white/60 p-8 text-mocha">
            <p className="font-medium">No campaigns yet.</p>
            <p className="mt-1 text-sm text-mocha/70">
              Create your first campaign to get a shareable link.
            </p>
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