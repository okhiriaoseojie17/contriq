"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  campaignSchema,
  type CampaignFormValues,
} from "@/lib/validations/campaign";

function toKobo(naira: string) {
  return Math.round(parseFloat(naira) * 100);
}

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

export async function deleteCampaign(id: string): Promise<{ error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  // Payments are removed automatically (on delete cascade).
  const { data, error } = await supabase
    .from("campaigns")
    .delete()
    .eq("id", id)
    .eq("organizer_id", user.id)
    .select("id");

  if (error || !data || data.length === 0) {
    return { error: "Could not delete this campaign." };
  }

  redirect("/dashboard");
}

export async function updateCampaign(
  id: string,
  values: CampaignFormValues
): Promise<{ error: string }> {
  const parsed = campaignSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const { data: existing } = await supabase
    .from("campaigns")
    .select("id")
    .eq("id", id)
    .eq("organizer_id", user.id)
    .maybeSingle();
  if (!existing) return { error: "Campaign not found." };

  // The goal cannot go below what has already been raised.
  const { data: progress } = await supabase.rpc("campaign_progress", {
    p_campaign_id: id,
  });
  const raised = Number(progress?.[0]?.total_collected ?? 0);
  const newTarget = toKobo(data.targetAmount);
  if (newTarget < raised) {
    return {
      error: `The goal cannot be lower than what is already raised (${formatNaira(raised)}).`,
    };
  }

  const { error } = await supabase
    .from("campaigns")
    .update({
      title: data.title,
      description: data.description.trim() || null,
      target_amount: newTarget,
      fixed_amount: data.fixedAmount ? toKobo(data.fixedAmount) : null,
      deadline: data.deadline
        ? new Date(`${data.deadline}T23:59:59+01:00`).toISOString()
        : null,
      stop_at_goal: data.stopAtGoal ?? false,
    })
    .eq("id", id)
    .eq("organizer_id", user.id);

  if (error) return { error: error.message };

  redirect(`/dashboard/campaigns/${id}`);
}