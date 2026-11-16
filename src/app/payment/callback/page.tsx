import { Suspense } from "react";
import Link from "next/link";
import { settlePayment } from "@/lib/payments/settle";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function CallbackContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const raw = params.reference ?? params.trxref;
  const reference = Array.isArray(raw) ? raw[0] : raw;

  let title = "We couldn't find that payment";
  let body = "If you were charged, please contact the campaign organizer.";
  let slug: string | null = null;

  if (reference) {
    const result = await settlePayment(reference);
    if (result.found) {
      slug = result.slug;
      if (result.status === "success") {
        title = "Thank you!";
        body = "Your payment was confirmed.";
      } else if (result.status === "pending") {
        title = "Payment not confirmed yet";
        body =
          "We haven't received confirmation yet. This can take a minute. Refresh this page shortly, and please don't pay again.";
      } else {
        title = "Payment was not completed";
        body = "No money was taken. You can go back and try again.";
      }
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-sand px-4">
      <div className="w-full max-w-md rounded-xl border border-mocha/15 bg-white/60 p-8 text-center text-mocha">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-mocha/80">{body}</p>
        {slug && (
          <Link
            href={`/c/${slug}`}
            className="mt-6 inline-block rounded-md bg-melon px-4 py-2 text-sm font-medium text-mocha hover:bg-melon/90"
          >
            Back to campaign
          </Link>
        )}
      </div>
    </main>
  );
}

export default function PaymentCallbackPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense
      fallback={<main className="min-h-screen bg-sand" aria-busy="true" />}
    >
      <CallbackContent searchParams={searchParams} />
    </Suspense>
  );
}