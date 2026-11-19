import { createAdminClient } from "@/lib/supabase/admin";
import { getProvider } from "@/lib/payments";
import type { ProviderName } from "@/lib/payments/types";

export type SettleResult =
  | { found: false }
  | { found: true; status: "success" | "pending" | "failed"; slug: string | null };

export async function settlePayment(reference: string): Promise<SettleResult> {
  const admin = createAdminClient();

  const { data: payment } = await admin
    .from("payments")
    .select("id, reference, amount, status, provider, campaigns(slug)")
    .eq("reference", reference)
    .maybeSingle();

  if (!payment) {
    return { found: false };
  }

  const campaigns = payment.campaigns as
    | { slug: string }
    | { slug: string }[]
    | null;
  const slug = Array.isArray(campaigns) ? campaigns[0]?.slug ?? null : campaigns?.slug ?? null;

  // Already settled: do nothing. This is what makes repeats safe.
  if (payment.status === "success") {
    return { found: true, status: "success", slug };
  }

  // Ask the provider for the real status. Never trust the browser or the webhook body alone.
  let verified;
  try {
    const provider = getProvider(payment.provider as ProviderName);
    verified = await provider.verify(reference);
  } catch (err) {
    console.error("Verify failed for", reference, err);
    return { found: true, status: "pending", slug };
  }

  if (verified.status === "success") {
    if (verified.amountKobo !== Number(payment.amount)) {
      console.error(
        "Amount mismatch for",
        reference,
        "expected",
        payment.amount,
        "got",
        verified.amountKobo
      );
      return { found: true, status: "pending", slug };
    }

    // The status filter means only the first call changes the row.
    await admin
      .from("payments")
      .update({ status: "success", paid_at: new Date().toISOString() })
      .eq("reference", reference)
      .in("status", ["pending", "failed"]);

    return { found: true, status: "success", slug };
  }

  if (verified.status === "failed") {
    await admin
      .from("payments")
      .update({ status: "failed" })
      .eq("reference", reference)
      .eq("status", "pending");
    return { found: true, status: "failed", slug };
  }

  return { found: true, status: "pending", slug };
}