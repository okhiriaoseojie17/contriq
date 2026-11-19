import { NextResponse } from "next/server";
import { verifyKoraSignature } from "@/lib/payments/kora";
import { settlePayment } from "@/lib/payments/settle";

export async function POST(request: Request) {
  let payload: { event?: string; data?: { reference?: string } };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  // Only a correctly signed request is trusted.
  const signature = request.headers.get("x-korapay-signature");
  if (!verifyKoraSignature(payload.data, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // settlePayment asks Kora for the real status again before marking success.
  const reference = payload.data?.reference;
  if (reference) await settlePayment(reference);

  return NextResponse.json({ received: true });
}