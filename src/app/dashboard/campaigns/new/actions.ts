"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  campaignSchema,
  type CampaignFormValues,
} from "@/lib/validations/campaign";

function slugify(text: string) {
  const base = text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return base || "campaign";
}

function toKobo(naira: string) {
  return Math.round(parseFloat(naira) * 100);
}

export async function createCampaign(
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

  if (!user) {
    return { error: "You must be logged in." };
  }

  const slug = `${slugify(data.title)}-${Math.random().toString(36).slice(2, 8)}`;

  const { error } = await supabase.from("campaigns").insert({
    organizer_id: user.id,
    title: data.title,
    description: data.description.trim() || null,
    slug,
    target_amount: toKobo(data.targetAmount),
    fixed_amount: data.fixedAmount ? toKobo(data.fixedAmount) : null,
        stop_at_goal: data.stopAtGoal ?? false,
    deadline: data.deadline
      ? new Date(`${data.deadline}T23:59:59+01:00`).toISOString()
      : null,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}