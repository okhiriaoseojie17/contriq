import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EditForm } from "./edit-form";

async function EditContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: c } = await supabase
    .from("campaigns")
    .select("id, title, description, target_amount, fixed_amount, deadline, stop_at_goal")
    .eq("id", id)
    .eq("organizer_id", user.id)
    .maybeSingle();
  if (!c) notFound();

  const toNaira = (kobo: number) => String(kobo / 100);

  return (
    <main className="relative overflow-hidden px-4 py-8 lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-melon/20 blur-3xl"
      />
      <div className="relative mx-auto max-w-xl space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href={`/dashboard/campaigns/${c.id}`}
            className="inline-flex items-center gap-1.5 text-sm text-mocha/70 transition hover:text-mocha"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
        </div>

        <section className="rounded-3xl border border-border bg-card p-8 text-mocha shadow-xl shadow-mocha/10">
          <div className="h-1 w-10 rounded-full bg-melon" />
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">
            Edit campaign
          </h1>
          <EditForm
            id={c.id}
            initial={{
              title: c.title,
              description: c.description ?? "",
              targetAmount: toNaira(Number(c.target_amount)),
              fixedAmount: c.fixed_amount ? toNaira(Number(c.fixed_amount)) : "",
              deadline: c.deadline
                ? new Date(c.deadline).toLocaleDateString("en-CA", {
                    timeZone: "Africa/Lagos",
                  })
                : "",
              stopAtGoal: c.stop_at_goal,
            }}
          />
        </section>
      </div>
    </main>
  );
}

export default function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={<main className="min-h-screen bg-sand" aria-busy="true" />}
    >
      <EditContent params={params} />
    </Suspense>
  );
}