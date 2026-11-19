import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate, initials } from "@/lib/format";
import { DeleteAccountForm, ProfileForm } from "./profile-forms";

async function ProfileContent() {
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

  const shownName = profile?.username || profile?.full_name || user.email || "Account";

  return (
    <main className="relative overflow-hidden px-4 py-8 lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-melon/20 blur-3xl"
      />
      <div className="relative mx-auto max-w-2xl space-y-6">
        <section className="flex items-center gap-4 rounded-3xl border border-border bg-card p-6 text-mocha shadow-lg shadow-mocha/5">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-mocha text-xl font-semibold text-sand">
            {initials(shownName)}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-tight">
              {shownName}
            </h1>
            <p className="truncate text-sm text-mocha/70">{user.email}</p>
            <p className="mt-0.5 text-xs text-mocha/60">
              Member since {formatDate(user.created_at)}
            </p>
          </div>
        </section>

        <ProfileForm
          initialFullName={profile?.full_name ?? ""}
          initialUsername={profile?.username ?? ""}
        />
        <DeleteAccountForm />
      </div>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<main className="min-h-screen" aria-busy="true" />}>
      <ProfileContent />
    </Suspense>
  );
}