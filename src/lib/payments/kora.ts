import { createHmac, timingSafeEqual } from "crypto";
import type { PaymentProvider } from "./types";

// Check these against the current official Kora docs once your keys arrive.
const BASE_URL =
  process.env.KORA_API_BASE_URL ?? "https://api.korapay.com/merchant/api/v1";

function requireEnv(name: "KORA_SECRET_KEY" | "KORA_PUBLIC_KEY") {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

export const kora: PaymentProvider = {
  name: "kora",

  async initialize({ reference, amountKobo, email, name, callbackUrl }) {
    const siteUrl = process.env.SITE_URL ?? "";
    const body: Record<string, unknown> = {
      reference,
      // Kora takes the amount in naira, not kobo.
      amount: amountKobo / 100,
      currency: "NGN",
      redirect_url: callbackUrl,
      customer: { name, email },
    };
    // Webhooks need a public https address.
    if (siteUrl.startsWith("https://")) {
      body.notification_url = `${siteUrl}/api/webhooks/kora`;
    }

    const res = await fetch(`${BASE_URL}/charges/initialize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${requireEnv("KORA_PUBLIC_KEY")}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const json = await res.json().catch(() => null);
    const checkoutUrl: string | undefined = json?.data?.checkout_url;

    if (!res.ok || !json?.status || !checkoutUrl) {
      console.error("Kora initialize failed", res.status, json?.message);
      throw new Error(json?.message ?? "Kora initialize failed");
    }
    return { checkoutUrl };
  },

  async verify(reference) {
    const res = await fetch(
      `${BASE_URL}/charges/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${requireEnv("KORA_SECRET_KEY")}` },
        cache: "no-store",
      }
    );
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.status || !json?.data) {
      throw new Error(json?.message ?? `Kora verify failed (${res.status})`);
    }

    const raw = String(json.data.status);
    const status =
      raw === "success" ? "success" : raw === "failed" ? "failed" : "pending";
    return { status, amountKobo: Math.round(Number(json.data.amount) * 100) };
  },
};

// Kora signs the "data" object of the webhook with your secret key (HMAC SHA-256).
export function verifyKoraSignature(data: unknown, signature: string | null) {
  if (!signature) return false;
  const expected = createHmac("sha256", requireEnv("KORA_SECRET_KEY"))
    .update(JSON.stringify(data))
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}