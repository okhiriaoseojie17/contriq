"use client";

import { useState } from "react";
import { Lock, TriangleAlert } from "lucide-react";
import { checkPriorPayment, startPayment } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

export function ContributeForm({
  slug,
  fixedAmountKobo,
  remainingKobo,
}: {
  slug: string;
  fixedAmountKobo: number | null;
  remainingKobo: number | null;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [warn, setWarn] = useState(false);

  async function pay() {
    setError(null);
    setLoading(true);

    const result = await startPayment({ slug, name, email, amount });

    if ("error" in result) {
      setError(result.error);
      setLoading(false);
      setWarn(false);
      return;
    }

    // Keep the button disabled while the browser leaves for checkout.
    window.location.href = result.checkoutUrl;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    setLoading(true);
    const { used } = await checkPriorPayment({ slug, email });
    if (used) {
      setLoading(false);
      setWarn(true);
      return;
    }
    await pay();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="payer-name">Your name</Label>
        <Input
          id="payer-name"
          autoComplete="name"
          className="h-11 bg-white/70"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="payer-email">Email</Label>
        <Input
          id="payer-email"
          type="email"
          autoComplete="email"
          className="h-11 bg-white/70"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setWarn(false);
          }}
          required
        />
      </div>

      {fixedAmountKobo ? (
        <div className="flex items-center justify-between rounded-2xl bg-mocha/5 px-4 py-3">
          <span className="text-sm text-mocha/70">Amount per person</span>
          <span className="text-lg font-bold">
            {formatNaira(fixedAmountKobo)}
          </span>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="payer-amount">Amount (₦)</Label>
          <Input
            id="payer-amount"
            inputMode="decimal"
            placeholder="5000"
            className="h-11 bg-white/70"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          {remainingKobo !== null && (
            <p className="text-xs text-mocha/60">
              {formatNaira(remainingKobo)} left to reach the goal.
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {warn ? (
        <div className="space-y-3 rounded-2xl border border-melon/60 bg-melon/15 p-4">
          <p className="flex items-start gap-2 text-sm">
            <TriangleAlert size={16} className="mt-0.5 shrink-0" />
            <span>
              This email has already been used for this campaign. Do you want to
              pay again?
            </span>
          </p>
          <div className="flex gap-3">
            <Button
              type="button"
              disabled={loading}
              onClick={pay}
              className="h-11 flex-1 rounded-full bg-melon font-semibold text-mocha hover:bg-melon/90"
            >
              {loading ? "Taking you to checkout..." : "Proceed"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => setWarn(false)}
              className="h-11 flex-1 rounded-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-full bg-melon text-base font-semibold text-mocha hover:bg-melon/90"
        >
          {loading ? "Please wait..." : "Contribute"}
        </Button>
      )}

      <p className="flex items-center justify-center gap-1.5 text-xs text-mocha/60">
        <Lock size={12} />
        Secure checkout. Your card details never touch Contriq.
      </p>
    </form>
  );
}