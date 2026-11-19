import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { BrandLogo } from "@/components/brand-logo";

async function ResolvedLogo({ className }: { className?: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return <BrandLogo href={user ? "/dashboard" : "/"} className={className} />;
}

export function HomeLogo({ className }: { className?: string }) {
  return (
    <Suspense fallback={<BrandLogo className={className} />}>
      <ResolvedLogo className={className} />
    </Suspense>
  );
}