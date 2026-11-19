"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteAccount, updateProfile } from "../actions";

export function ProfileForm({
  initialFullName,
  initialUsername,
}: {
  initialFullName: string;
  initialUsername: string;
}) {
  const [fullName, setFullName] = useState(initialFullName);
  const [username, setUsername] = useState(initialUsername);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const res = await updateProfile({ fullName, username });
      setMessage(
        res.error ? { ok: false, text: res.error } : { ok: true, text: "Profile saved." }
      );
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-3xl border border-border bg-card p-6 text-mocha shadow-lg shadow-mocha/5"
    >
      <h2 className="text-lg font-semibold">Your details</h2>

      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          className="h-11 bg-white/70"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          className="h-11 bg-white/70"
          placeholder="What should we call you?"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <p className="text-xs text-mocha/60">
          Shown in your greeting and the menu. Leave blank to use your first name.
        </p>
      </div>

      {message && (
        <p
          className={`rounded-md px-3 py-2 text-sm ${
            message.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-melon px-6 py-2.5 text-sm font-semibold text-mocha transition hover:bg-melon/90 disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}

export function DeleteAccountForm() {
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const res = await deleteAccount(typed);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <section className="space-y-4 rounded-3xl border border-red-200 bg-card p-6 text-mocha">
      <h2 className="text-lg font-semibold text-red-700">Delete account</h2>
      <p className="text-sm text-mocha/80">
        This permanently deletes your account, every campaign and all payment
        records. Download your CSVs first. It cannot be undone.
      </p>
      <div className="space-y-2">
        <Label htmlFor="confirm-delete">Type DELETE to confirm</Label>
        <Input
          id="confirm-delete"
          className="h-11 bg-white/70"
          autoComplete="off"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="button"
        disabled={typed !== "DELETE" || pending}
        onClick={handleDelete}
        className="rounded-full bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {pending ? "Deleting..." : "Delete my account"}
      </button>
    </section>
  );
}