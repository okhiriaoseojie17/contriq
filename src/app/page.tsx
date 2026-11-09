import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Share one link",
    description:
      "Create a campaign and share its link. Contributors can pay without creating an account.",
  },
  {
    icon: CreditCard,
    title: "Collect payments easily",
    description:
      "Give members a straightforward way to contribute and track their payments.",
  },
  {
    icon: ShieldCheck,
    title: "Keep records transparent",
    description:
      "See contributions, outstanding balances and payment history in one place.",
  },
  {
    icon: Clock3,
    title: "Stay on schedule",
    description:
      "Set targets and deadlines so everyone knows what is expected.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create a campaign",
    description:
      "Set up your group, define its goal and establish a contribution deadline.",
  },
  {
    number: "02",
    title: "Share your link",
    description:
      "Send the link to your group chat so everyone can contribute in seconds.",
  },
  {
    number: "03",
    title: "Track contributions",
    description:
      "Monitor payments and outstanding contributions through a central record.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" aria-label="Contriq home">
          <Image
            src="/logo-nav.svg"
            alt="Contriq"
            width={140}
            height={41}
            priority
            className="h-10 w-auto"
          />
        </Link>

        <div className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-foreground">
            How it works
          </a>
        </div>

        <a
          href="#get-started"
          className="flex items-center gap-2 rounded-full bg-mocha px-5 py-3 text-sm font-semibold text-sand transition hover:bg-mocha/90"
        >
          Get started <ArrowUpRight size={16} />
        </a>
      </nav>

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-16 px-6 pb-24 pt-16 md:grid-cols-2 md:pt-24">
        <div>

          <h1 className="max-w-xl text-5xl font-semibold leading-[1.12] tracking-tight md:text-7xl">
            Contributions without the confusion.
          </h1>

          <p className="mt-7 max-w-lg text-lg leading-8 text-muted-foreground">
            Organize group contributions, collect payments and keep
            everyone on the same page. Less chasing. Better records.
            More accountability.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <a
              href="#get-started"
              className="flex items-center gap-3 rounded-full bg-melon px-7 py-4 font-semibold text-mocha transition hover:bg-melon/90"
            >
              Start a contribution <ArrowRight size={18} />
            </a>
            <a
              href="#how-it-works"
              className="rounded-full border border-border bg-card px-7 py-4 font-semibold transition hover:bg-muted"
            >
              See how it works
            </a>
          </div>

          <div className="mt-10 flex items-center gap-3 text-sm text-muted-foreground">
            <CheckCircle2 size={17} className="text-mocha" />
            Simple setup. Clear records. Shared accountability.
          </div>
        </div>

        {/* Illustrative dashboard preview */}
        <div className="relative">
          <div className="absolute -inset-5 rounded-[40px] bg-melon/20 blur-2xl" />

          <div className="relative rounded-3xl border border-border bg-card p-6 shadow-xl shadow-mocha/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Your contributions
                </p>
                <h2 className="mt-1 text-xl font-semibold">Group overview</h2>
              </div>
              <div className="rounded-xl bg-mocha/10 p-3 text-mocha">
                <CircleDollarSign size={23} />
              </div>
            </div>

            <div className="mt-7 rounded-2xl bg-muted p-5">
              <p className="text-sm text-muted-foreground">
                Illustrative campaign target
              </p>
              <p className="mt-2 text-3xl font-bold">₦500,000</p>
              <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-mocha/15">
                <div className="h-full w-[68%] rounded-full bg-melon" />
              </div>
              <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                <span>68% progress</span>
                <span>Illustrative figures</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border p-4">
                <Users className="text-mocha" size={20} />
                <p className="mt-3 text-2xl font-bold">24</p>
                <p className="text-xs text-muted-foreground">Group members</p>
              </div>
              <div className="rounded-2xl border border-border p-4">
                <CheckCircle2 className="text-mocha" size={20} />
                <p className="mt-3 text-2xl font-bold">18</p>
                <p className="text-xs text-muted-foreground">
                  Completed payments
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-mocha/10 p-2 text-mocha">
                  <Zap size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold">Payment tracking</p>
                  <p className="text-xs text-muted-foreground">
                    Know where things stand
                  </p>
                </div>
              </div>
              <ArrowUpRight size={18} className="text-muted-foreground" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="border-y border-border bg-card py-24"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-mocha">Why Contriq?</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              Group money management should not be complicated.
            </h2>
            <p className="mt-5 leading-7 text-muted-foreground">
              Whether it is a group project, an event, a community or
              a shared goal, everyone deserves clarity.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="rounded-2xl border border-border bg-background p-6 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-mocha/10"
                >
                  <div className="inline-flex rounded-xl bg-mocha/10 p-3 text-mocha">
                    <Icon size={22} />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center">
          <p className="text-sm font-semibold text-mocha">Getting started</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight">
            Three steps. Better coordination.
          </h2>
        </div>

        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="border-t-2 border-melon pt-6">
              <p className="text-sm font-bold text-mocha">{step.number}</p>
              <h3 className="mt-5 text-xl font-semibold">{step.title}</h3>
              <p className="mt-3 leading-7 text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="get-started" className="px-6 pb-24">
        <div className="mx-auto max-w-7xl rounded-3xl bg-mocha px-8 py-16 text-center text-sand md:px-16">
          <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Make every contribution count.
          </h2>
          <p className="mx-auto mt-5 max-w-xl leading-7 text-sand/75">
            Bring your group together with a clearer, more accountable
            way to manage shared contributions.
          </p>
          <a
            href="#"
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-melon px-7 py-4 font-semibold text-mocha transition hover:bg-melon/90"
          >
            Coming soon <ArrowRight size={18} />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <Image src="/logo-nav.svg" alt="Contriq" width={110} height={32} className="h-8 w-auto" />
          <span>Contributions without the confusion.</span>
          <span>© 2026 Contriq.</span>
        </div>
      </footer>
    </main>
  );
}