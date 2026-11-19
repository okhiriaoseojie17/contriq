import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy" };

const sections = [
  {
    title: "What we collect",
    body: "Organizers: your name, username and email. Contributors: the name and email you enter, the amount, and the payment status and reference. Contributors never create an account.",
  },
  {
    title: "Card details",
    body: "Payments happen on our payment provider's secure checkout. Your card details are entered there and never reach Contriq.",
  },
  {
    title: "Who can see what",
    body: "A campaign's public page shows the campaign, its progress, and contributors' names and amounts. Emails are only visible to the organizer of that campaign.",
  },
  {
    title: "Cookies",
    body: "We use a sign-in session cookie for organizers. We do not use advertising cookies.",
  },
  {
    title: "Deleting your data",
    body: "Organizers can delete a campaign, which removes its payment records, or delete their whole account from the Profile page. Contributors can contact us to ask for their details to be removed.",
  },
  {
    title: "We do not sell your data",
    body: "Your information is used only to run the campaigns you take part in.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-2xl text-mocha">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-mocha/70 hover:text-mocha"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">Privacy</h1>
        <p className="mt-2 text-sm text-mocha/60">Last updated 19 November 2026</p>

        <div className="mt-8 space-y-6">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-lg font-semibold">{s.title}</h2>
              <p className="mt-1 text-sm leading-6 text-mocha/80">{s.body}</p>
            </section>
          ))}
        </div>

        <p className="mt-10 text-sm text-mocha/80">
          Questions? Email{" "}
          <a className="underline" href={`mailto:${SITE.contactEmail}`}>
            {SITE.contactEmail}
          </a>
          .
        </p>
      </div>
    </main>
  );
}