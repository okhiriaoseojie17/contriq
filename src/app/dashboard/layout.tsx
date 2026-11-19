import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard-shell";

async function ShellData({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, username")
    .eq("id", user.id)
    .single();

  return (
    <DashboardShell
      displayName={profile?.username || profile?.full_name || user.email || "Account"}
      email={user.email ?? ""}
      signedInAt={user.last_sign_in_at ?? ""}
    >
      {children}
    </DashboardShell>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-sand" aria-busy="true" />}
    >
      <ShellData>{children}</ShellData>
    </Suspense>
  );
}