"use server";

import { randomUUID } from "crypto";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveProviderName, getProvider } from "@/lib/payments";

const MIN_KOBO = 10000; // ₦100 minimum

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

const inputSchema = z.object({
  slug: z.string().min(1),
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email")
    .max(200),
  amount: z.string().trim(),
});

type Result = { checkoutUrl: string } | { error: string };

// Used by the contribution form to warn before someone pays again.
export async function checkPriorPayment(input: {
  slug: string;
  email: string;
}): Promise<{ used: boolean }> {
  const parsed = z
    .object({
      slug: z.string().min(1),
      email: z.string().trim().toLowerCase().email(),
    })
    .safeParse(input);
  if (!parsed.success) return { used: false };

  const admin = createAdminClient();
  const { data: campaign } = await admin
    .from("campaigns")
    .select("id")
    .eq("slug", parsed.data.slug)
    .maybeSingle();
  if (!campaign) return { used: false };

  const { count } = await admin
    .from("payments")
    .select("id", { count: "exact", head: true })
    .eq("campaign_id", campaign.id)
    .eq("payer_email", parsed.data.email)
    .eq("status", "success");

  return { used: (count ?? 0) > 0 };
}

export async function startPayment(input: {
  slug: string;
  name: string;
  email: string;
  amount: string;
}): Promise<Result> {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { slug, name, email, amount } = parsed.data;

  const admin = createAdminClient();

  const { data: campaign } = await admin
    .from("campaigns")
    .select("id, fixed_amount, target_amount, stop_at_goal, deadline, is_active")
    .eq("slug", slug)
    .maybeSingle();

  if (!campaign || !campaign.is_active) {
    return { error: "This campaign is not available." };
  }
  if (campaign.deadline && new Date(campaign.deadline).getTime() < Date.now()) {
    return { error: "This campaign has closed." };
  }

  // Decide the amount on the server.
  let amountKobo: number;
  if (campaign.fixed_amount) {
    amountKobo = Number(campaign.fixed_amount);
  } else {
    if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
      return { error: "Enter a valid amount, e.g. 5000" };
    }
    amountKobo = Math.round(parseFloat(amount) * 100);
  }
  if (amountKobo < MIN_KOBO) {
    return { error: "The minimum contribution is ₦100." };
  }

  // Stop at goal: enforced here, so the browser cannot bypass it.
  if (campaign.stop_at_goal) {
    const { data: progress } = await admin.rpc("campaign_progress", {
      p_campaign_id: campaign.id,
    });
    const raised = Number(progress?.[0]?.total_collected ?? 0);
    const remaining = Number(campaign.target_amount) - raised;
    if (remaining <= 0) {
      return { error: "This campaign has reached its goal." };
    }
    if (amountKobo > remaining) {
      return {
        error: `Maximum reached. Only ${formatNaira(remaining)} is left to reach the goal.`,
      };
    }
  }

  const providerName = getActiveProviderName();
  const provider = getProvider(providerName);
  const reference = `CQ-${randomUUID()}`;

  // Record the attempt as PENDING. Only a verified webhook can change this.
  const { error: insertError } = await admin.from("payments").insert({
    campaign_id: campaign.id,
    reference,
    amount: amountKobo,
    payer_name: name,
    payer_email: email,
    status: "pending",
    provider: providerName,
  });

  if (insertError) {
    console.error("Could not save payment", insertError.message);
    return { error: "Something went wrong. Please try again." };
  }

  try {
    const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";
    const { checkoutUrl } = await provider.initialize({
      reference,
      amountKobo,
      email,
      name,
      callbackUrl: `${siteUrl}/payment/callback`,
    });
    return { checkoutUrl };
  } catch (err) {
    console.error("Provider initialize failed", err);
    await admin.from("payments").update({ status: "failed" }).eq("reference", reference);
    return { error: "Could not start the payment. Please try again." };
  }
}