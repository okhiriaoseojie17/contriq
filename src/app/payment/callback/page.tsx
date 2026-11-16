import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import { settlePayment } from "@/lib/payments/settle";
import { BrandLogo } from "@/components/brand-logo";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function CallbackContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const raw = params.reference ?? params.trxref;
  const reference = Array.isArray(raw) ? raw[0] : raw;

  let tone: "success" | "pending" | "failed" = "failed";
  let title = "We couldn't find that payment";
  let body = "If you were charged, please contact the campaign organizer.";
  let slug: string | null = null;

  if (reference) {
    const result = await settlePayment(reference);
    if (result.found) {
      slug = result.slug;
      if (result.status === "success") {
        tone = "success";
        title = "Thank you!";
        body = "Your payment was confirmed.";
      } else if (result.status === "pending") {
        tone = "pending";
        title = "Payment not confirmed yet";
        body =
          "We haven't received confirmation yet. This can take a minute. Refresh this page shortly, and please don't pay again.";
      } else {
        tone = "failed";
        title = "Payment was not completed";
        body = "No money was taken. You can go back and try again.";
      }
    }
  }

  const Icon =
    tone === "success" ? CheckCircle2 : tone === "pending" ? Clock3 : XCircle;
  const iconBg = tone === "success" ? "bg-melon/25" : "bg-mocha/10";

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-sand px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-melon/25 blur-3xl"
      />

      <div className="relative w-full max-w-md text-center text-mocha">
        <div className="flex justify-center">
          <BrandLogo />
        </div>

        <div className="mt-8 rounded-3xl border border-border bg-card p-10 shadow-xl shadow-mocha/10">
          <div className={`mx-auto inline-flex rounded-2xl p-4 ${iconBg}`}>
            <Icon size={30} />
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-mocha/70">{body}</p>
          {slug && (
            <Link
              href={`/c/${slug}`}
              className="mt-6 inline-block rounded-full bg-melon px-6 py-3 text-sm font-semibold text-mocha transition hover:bg-melon/90"
            >
              Back to campaign
            </Link>
          )}
        </div>
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