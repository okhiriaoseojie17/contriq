"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  campaignSchema,
  type CampaignFormValues,
} from "@/lib/validations/campaign";
import { createCampaign } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CampaignForm() {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      title: "",
      description: "",
      targetAmount: "",
      fixedAmount: "",
      deadline: "",
    },
  });

  async function onSubmit(values: CampaignFormValues) {
    setServerError(null);
    const result = await createCampaign(values);
    // On success the server redirects, so we only get here on error.
    if (result?.error) {
      setServerError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title">Campaign title</Label>
        <Input id="title" placeholder="e.g. 300L Class Dues" {...register("title")} />
        {errors.title && (
          <p className="text-sm text-red-700">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          rows={4}
          placeholder="What is this money for?"
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-red-700">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="targetAmount">Target amount (₦)</Label>
        <Input
          id="targetAmount"
          inputMode="decimal"
          placeholder="50000"
          {...register("targetAmount")}
        />
        {errors.targetAmount && (
          <p className="text-sm text-red-700">{errors.targetAmount.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="fixedAmount">Fixed amount per person (₦, optional)</Label>
        <Input
          id="fixedAmount"
          inputMode="decimal"
          placeholder="Leave blank to let people choose"
          {...register("fixedAmount")}
        />
        {errors.fixedAmount && (
          <p className="text-sm text-red-700">{errors.fixedAmount.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="deadline">Deadline (optional)</Label>
        <Input id="deadline" type="date" {...register("deadline")} />
      </div>

      {serverError && <p className="text-sm text-red-700">{serverError}</p>}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-melon text-mocha hover:bg-melon/90"
      >
        {isSubmitting ? "Creating..." : "Create campaign"}
      </Button>
    </form>
  );
}