"use client";

import { useState } from "react";
import { startPayment } from "./actions";
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
}: {
  slug: string;
  fixedAmountKobo: number | null;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await startPayment({ slug, name, email, amount });

    if ("error" in result) {
      setError(result.error);
      setLoading(false);
      return;
    }

    // Keep the button disabled while the browser leaves for checkout.
    window.location.href = result.checkoutUrl;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="payer-name">Your name</Label>
        <Input
          id="payer-name"
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      {fixedAmountKobo ? (
        <p className="text-sm">
          Amount: <span className="font-medium">{formatNaira(fixedAmountKobo)}</span>
        </p>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="payer-amount">Amount (₦)</Label>
          <Input
            id="payer-amount"
            inputMode="decimal"
            placeholder="5000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
      )}

      {error && <p className="text-sm text-red-700">{error}</p>}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-melon text-mocha hover:bg-melon/90"
      >
        {loading ? "Please wait..." : "Contribute"}
      </Button>
    </form>
  );
}