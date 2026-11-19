import { z } from "zod";

const amountPattern = /^\d+(\.\d{1,2})?$/;

export const campaignSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title must be 120 characters or fewer"),
  description: z.string().max(1000, "Keep the description under 1000 characters"),
  targetAmount: z
    .string()
    .trim()
    .regex(amountPattern, "Enter a valid amount, e.g. 50000")
    .refine((v) => parseFloat(v) > 0, "Target must be greater than zero"),
  fixedAmount: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || (amountPattern.test(v) && parseFloat(v) > 0),
      "Enter a valid amount, or leave blank"
    ),
  deadline: z.string(),
  stopAtGoal: z.boolean().optional(),
});

export type CampaignFormValues = z.infer<typeof campaignSchema>;