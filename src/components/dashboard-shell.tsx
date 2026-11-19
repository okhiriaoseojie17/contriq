"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Plus,
  Receipt,
  UserRound,
  X,
} from "lucide-react";
import { signOutAction } from "@/app/dashboard/actions";
import { IdleTimeout } from "@/components/idle-timeout";
import { initials } from "@/lib/format";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/campaigns", label: "Campaigns", icon: Megaphone, exact: false },
  { href: "/dashboard/payments", label: "Payments", icon: Receipt, exact: false },
  { href: "/dashboard/profile", label: "Profile", icon: UserRound, exact: false },
];

function Logo() {
  return (
    <Link href="/dashboard" className="inline-flex items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-nav.svg" alt="Contriq" className="h-8 w-auto" />
    </Link>
  );
}

function SidebarContent({
  pathname,
  displayName,
  email,
  onClose,
}: {
  pathname: string;
  displayName: string;
  email: string;
  onClose: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between">
        <Logo />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="rounded-full p-2 text-mocha/70 hover:bg-mocha/10 lg:hidden"
        >
          <X size={18} />
        </button>
      </div>

      <Link
        href="/dashboard/campaigns/new"
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-melon px-5 py-3 text-sm font-semibold text-mocha transition hover:bg-melon/90"
      >
        <Plus size={16} />
        New campaign
      </Link>

      <nav className="mt-6 space-y-1">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active ? "bg-mocha text-sand" : "text-mocha/80 hover:bg-mocha/10"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3 pt-6">
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-3 rounded-2xl bg-mocha/5 p-3 transition hover:bg-mocha/10"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mocha text-sm font-semibold text-sand">
            {initials(displayName)}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-mocha">
              {displayName}
            </span>
            <span className="block truncate text-xs text-mocha/60">{email}</span>
          </span>
        </Link>
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-mocha transition hover:bg-mocha/10"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}

export function DashboardShell({
  displayName,
  email,
  signedInAt,
  children,
}: {
  displayName: string;
  email: string;
  signedInAt: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  // The drawer is "open for" one path, so it closes itself when you navigate.
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;

  return (
    <div className="flex min-h-screen">
      <IdleTimeout signedInAt={signedInAt} />

      {open && (
        <div
          className="fixed inset-0 z-30 bg-mocha/40 lg:hidden"
          onClick={() => setOpenAt(null)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-border bg-card p-5 shadow-xl transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:translate-x-0 lg:self-start lg:shadow-none ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent
          pathname={pathname}
          displayName={displayName}
          email={email}
          onClose={() => setOpenAt(null)}
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-sand/90 px-4 py-3 backdrop-blur lg:hidden">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setOpenAt(pathname)}
            className="rounded-full p-2 text-mocha hover:bg-mocha/10"
          >
            <Menu size={22} />
          </button>
          <Logo />
          <Link
            href="/dashboard/profile"
            aria-label="Profile"
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-mocha text-xs font-semibold text-sand"
          >
            {initials(displayName)}
          </Link>
        </header>

        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}