"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CampaignFormValues } from "@/lib/validations/campaign";
import { updateCampaign } from "../actions";

export function EditForm({
  id,
  initial,
}: {
  id: string;
  initial: CampaignFormValues & { stopAtGoal: boolean };
}) {
  const [values, setValues] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function set<K extends keyof typeof values>(key: K, value: (typeof values)[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await updateCampaign(id, values);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title">Campaign name</Label>
        <Input
          id="title"
          value={values.title}
          onChange={(e) => set("title", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          rows={4}
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="target">Goal amount (₦)</Label>
        <Input
          id="target"
          inputMode="decimal"
          value={values.targetAmount}
          onChange={(e) => set("targetAmount", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fixed">Fixed amount per person (₦, optional)</Label>
        <Input
          id="fixed"
          inputMode="decimal"
          value={values.fixedAmount}
          onChange={(e) => set("fixedAmount", e.target.value)}
        />
        <p className="text-xs text-mocha/60">
          Changing this only affects new payments.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="deadline">Deadline (optional)</Label>
        <Input
          id="deadline"
          type="date"
          value={values.deadline}
          onChange={(e) => set("deadline", e.target.value)}
        />
      </div>

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 accent-[#474329]"
          checked={values.stopAtGoal}
          onChange={(e) => set("stopAtGoal", e.target.checked)}
        />
        <span>
          Stop accepting payments once the goal is reached
          <span className="block text-xs text-mocha/60">
            Contributors can't pay more than the amount remaining.
          </span>
        </span>
      </label>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-melon px-5 py-3 text-sm font-semibold text-mocha transition hover:bg-melon/90 disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}