"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { deleteCampaign } from "@/app/dashboard/campaigns/[id]/actions";

export function DeleteCampaignButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const matches = typed.trim() === title.trim();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const res = await deleteCampaign(id);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setTyped("");
          setError(null);
          setOpen(true);
        }}
        className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
      >
        <Trash2 size={15} />
        Delete
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this campaign?</DialogTitle>
            <DialogDescription>
              This permanently deletes the campaign and all of its payment
              records. It cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <p className="text-sm text-mocha/80">
            Want a copy first?{" "}
            <a
              href={`/dashboard/campaigns/${id}/export`}
              className="font-medium underline"
            >
              Download the CSV
            </a>
            .
          </p>

          <div className="space-y-2">
            <p className="text-sm">
              Type <span className="font-semibold">{title}</span> to confirm:
            </p>
            <Input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="Campaign title"
              autoComplete="off"
            />
          </div>

          {error && <p className="text-sm text-red-700">{error}</p>}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-border px-4 py-2 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!matches || pending}
              onClick={handleDelete}
              className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {pending ? "Deleting..." : "Delete campaign"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}