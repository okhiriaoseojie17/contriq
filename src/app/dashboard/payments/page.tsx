import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatNaira, initials, relationTitle } from "@/lib/format";

const statusStyles: Record<string, string> = {
  success: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
};

async function PaymentsContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Row Level Security limits this to payments on your own campaigns.
  const { data: payments } = await supabase
    .from("payments")
    .select("id, amount, payer_name, payer_email, status, created_at, paid_at, campaigns(title)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <main className="relative overflow-hidden px-4 py-8 lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-melon/20 blur-3xl"
      />
      <div className="relative mx-auto max-w-4xl">
        <h1 className="text-3xl font-semibold tracking-tight text-mocha">Payments</h1>
        <p className="mt-1 text-sm text-mocha/70">
          The latest payments across all your campaigns. Open a campaign to see
          payers grouped and download a CSV.
        </p>

        <section className="mt-6 rounded-3xl border border-border bg-card p-6 text-mocha shadow-lg shadow-mocha/5">
          {payments && payments.length > 0 ? (
            <ul className="divide-y divide-mocha/10">
              {payments.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mocha text-sm font-semibold text-sand">
                    {initials(p.payer_name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.payer_name}</p>
                    <p className="truncate text-xs text-mocha/60">
                      {relationTitle(p.campaigns)} · {p.payer_email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {formatNaira(Number(p.amount))}
                    </p>
                    <p className="mt-0.5 flex items-center justify-end gap-2 text-xs text-mocha/60">
                      {formatDate(p.paid_at ?? p.created_at)}
                      <span
                        className={`rounded-full px-2 py-0.5 font-medium ${
                          statusStyles[p.status] ?? "bg-mocha/10"
                        }`}
                      >
                        {p.status}
                      </span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-2xl border border-dashed border-mocha/25 p-8 text-center">
              <p className="font-semibold">No payments yet</p>
              <p className="mt-1 text-sm text-mocha/70">
                Share a campaign link to get started.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default function PaymentsPage() {
  return (
    <Suspense fallback={<main className="min-h-screen" aria-busy="true" />}>
      <PaymentsContent />
    </Suspense>
  );
}