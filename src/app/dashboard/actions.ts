"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(80),
  username: z
    .string()
    .trim()
    .max(30, "Username must be 30 characters or fewer")
    .refine((v) => v === "" || v.length >= 2, "Username must be at least 2 characters"),
});

export async function updateProfile(input: {
  fullName: string;
  username: string;
}): Promise<{ error?: string }> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      username: parsed.data.username || null,
    })
    .eq("id", user.id);

  if (error) return { error: "Could not save your profile. Please try again." };

  revalidatePath("/dashboard", "layout");
  return {};
}

export async function deleteAccount(confirm: string): Promise<{ error: string }> {
  if (confirm !== "DELETE") return { error: "Type DELETE to confirm." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  // Deleting the auth user cascades to the profile, campaigns and payments.
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return { error: "Could not delete your account. Please try again." };

  try {
    await supabase.auth.signOut();
  } catch {
    // The session is already invalid once the user is gone.
  }
  redirect("/");
}