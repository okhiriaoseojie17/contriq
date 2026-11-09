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
  Wallet,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Bring everyone together",
    description:
      "Create a contribution group and invite members through a simple shareable link.",
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

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fafbf9] text-[#17251d]">
      {/* Navigation */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2">
         <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#176b45] text-white">
          <Wallet size={19} />
         </div>
         <span className="text-xl font-bold tracking-tight">
           contriq<span className="text-[#299765]">.</span>
         </span>
        </Link>

        <div className="hidden items-center gap-8 text-sm text-gray-600 md:flex">
          <a href="#features" className="hover:text-[#176b45]">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-[#176b45]">
            How it works
          </a>
        </div>

        <a
          href="#get-started"
          className="flex items-center gap-2 rounded-full bg-[#176b45] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#105536]"
        >
          Get started <ArrowUpRight size={16} />
        </a>
      </nav>

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-16 px-6 pb-24 pt-16 md:grid-cols-2 md:pt-24">
        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#dce9df] bg-white px-4 py-2 text-xs font-medium text-[#176b45]">
            <span className="h-2 w-2 rounded-full bg-[#299765]" />
            Group contributions, simplified
          </div>

          <h1 className="max-w-xl text-5xl font-semibold leading-[1.12] tracking-tight md:text-7xl">
            Contributions without the{" "}
            <span className="text-[#258456]">confusion.</span>
          </h1>

          <p className="mt-7 max-w-lg text-lg leading-8 text-gray-600">
            Organize group contributions, collect payments and keep
            everyone on the same page. Less chasing. Better records.
            More accountability.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <a
              href="#get-started"
              className="flex items-center gap-3 rounded-full bg-[#176b45] px-7 py-4 font-semibold text-white transition hover:bg-[#105536]"
            >
              Start a contribution <ArrowRight size={18} />
            </a>
            <a
              href="#how-it-works"
              className="rounded-full border border-gray-300 bg-white px-7 py-4 font-semibold transition hover:bg-gray-50"
            >
              See how it works
            </a>
          </div>

          <div className="mt-10 flex items-center gap-3 text-sm text-gray-500">
            <CheckCircle2 size={17} className="text-[#258456]" />
            Simple setup. Clear records. Shared accountability.
          </div>
        </div>

        {/* Illustrative dashboard preview */}
        <div className="relative">
          <div className="absolute -inset-5 rounded-[40px] bg-[#e9f2e9] blur-2xl" />

          <div className="relative rounded-3xl border border-gray-200 bg-white p-6 shadow-xl shadow-[#173b2510]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Your contributions</p>
                <h2 className="mt-1 text-xl font-semibold">
                  Group overview
                </h2>
              </div>
              <div className="rounded-xl bg-[#eaf4ed] p-3 text-[#176b45]">
                <CircleDollarSign size={23} />
              </div>
            </div>

            <div className="mt-7 rounded-2xl bg-[#f4f8f4] p-5">
              <p className="text-sm text-gray-500">
                Illustrative campaign target
              </p>
              <p className="mt-2 text-3xl font-bold">₦500,000</p>
              <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-[#dce8dd]">
                <div className="h-full w-[68%] rounded-full bg-[#258456]" />
              </div>
              <div className="mt-3 flex justify-between text-xs text-gray-500">
                <span>68% progress</span>
                <span>Illustrative figures</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-gray-100 p-4">
                <Users className="text-[#258456]" size={20} />
                <p className="mt-3 text-2xl font-bold">24</p>
                <p className="text-xs text-gray-500">Group members</p>
              </div>
              <div className="rounded-2xl border border-gray-100 p-4">
                <CheckCircle2 className="text-[#258456]" size={20} />
                <p className="mt-3 text-2xl font-bold">18</p>
                <p className="text-xs text-gray-500">Completed payments</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#f0f5ef] p-2 text-[#176b45]">
                  <Zap size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold">Payment tracking</p>
                  <p className="text-xs text-gray-500">
                    Know where things stand
                  </p>
                </div>
              </div>
              <ArrowUpRight size={18} className="text-gray-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-y border-gray-100 bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#258456]">
              Why Contriq?
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              Group money management should not be complicated.
            </h2>
            <p className="mt-5 leading-7 text-gray-600">
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
                  className="rounded-2xl border border-gray-200 p-6 transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="inline-flex rounded-xl bg-[#edf5ef] p-3 text-[#176b45]">
                    <Icon size={22} />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="mx-auto max-w-7xl px-6 py-24"
      >
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#258456]">
            Getting started
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight">
            Three steps. Better coordination.
          </h2>
        </div>

        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {[
            {
              number: "01",
              title: "Create a campaign",
              description:
                "Set up your group, define its goal and establish a contribution deadline.",
            },
            {
              number: "02",
              title: "Invite your members",
              description:
                "Share an invitation link so everyone can join and understand the plan.",
            },
            {
              number: "03",
              title: "Track contributions",
              description:
                "Monitor payments and outstanding contributions through a central record.",
            },
          ].map((step) => (
            <div key={step.number} className="border-t-2 border-[#258456] pt-6">
              <p className="text-sm font-bold text-[#258456]">
                {step.number}
              </p>
              <h3 className="mt-5 text-xl font-semibold">{step.title}</h3>
              <p className="mt-3 leading-7 text-gray-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="get-started" className="px-6 pb-24">
        <div className="mx-auto max-w-7xl rounded-3xl bg-[#153f2b] px-8 py-16 text-center text-white md:px-16">
          <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Make every contribution count.
          </h2>
          <p className="mx-auto mt-5 max-w-xl leading-7 text-white/70">
            Bring your group together with a clearer, more accountable
            way to manage shared contributions.
          </p>
          <a
            href="#"
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 font-semibold text-[#153f2b] transition hover:bg-[#eaf4ed]"
          >
            Coming soon <ArrowRight size={18} />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
          <span className="font-bold text-[#176b45]">contri q.</span>
          <span>Contributions without the confusion.</span>
          <span>© 2026 Contriq.</span>
        </div>
      </footer>
    </main>
  );
}
