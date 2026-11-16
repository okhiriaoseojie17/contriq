import { NextResponse } from "next/server";
import { getProvider } from "@/lib/payments";
import { settlePayment } from "@/lib/payments/settle";

export async function POST(request: Request) {
  // Read the RAW body. The signature is calculated over these exact bytes.
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  const provider = getProvider("paystack");

  if (!provider.verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = provider.parseWebhook(rawBody);

  if (event?.paid) {
    // Re-checks with Paystack, then marks the payment successful once.
    await settlePayment(event.reference);
  }

  // Always acknowledge a correctly signed webhook.
  return NextResponse.json({ received: true });
}