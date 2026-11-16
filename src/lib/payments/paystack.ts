import crypto from "crypto";
import type { PaymentProvider } from "./types";

const BASE_URL = "https://api.paystack.co";

function secretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new Error("PAYSTACK_SECRET_KEY is not set");
  }
  return key;
}

export const paystack: PaymentProvider = {
  name: "paystack",

  async initialize(input) {
    const res = await fetch(`${BASE_URL}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: input.email,
        amount: input.amountKobo,
        reference: input.reference,
        callback_url: input.callbackUrl,
        metadata: { payer_name: input.name },
      }),
      cache: "no-store",
    });

    const json = await res.json();
    if (!res.ok || !json.status) {
      throw new Error(json.message ?? "Could not start the payment");
    }
    return { checkoutUrl: json.data.authorization_url as string };
  },

  async verify(reference) {
    const res = await fetch(
      `${BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${secretKey()}` },
        cache: "no-store",
      }
    );

    const json = await res.json();
    if (!res.ok || !json.status) {
      throw new Error(json.message ?? "Could not verify the payment");
    }

    const raw: string = json.data.status;
    const status =
      raw === "success" ? "success" : raw === "failed" ? "failed" : "pending";

    return {
      reference,
      status,
      amountKobo: Number(json.data.amount),
    };
  },

  verifyWebhookSignature(rawBody, signature) {
    if (!signature) return false;
    const expected = crypto
      .createHmac("sha512", secretKey())
      .update(rawBody)
      .digest("hex");
    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  },

  parseWebhook(rawBody) {
    try {
      const event = JSON.parse(rawBody);
      const reference = event?.data?.reference;
      if (typeof reference !== "string") return null;
      return { reference, paid: event.event === "charge.success" };
    } catch {
      return null;
    }
  },
};