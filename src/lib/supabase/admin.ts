import { createClient } from "@supabase/supabase-js";

// SERVER ONLY. Uses the secret key, which bypasses Row Level Security.
// Never import this file from a component with "use client".
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}