import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <Image
          src="/logo-nav.svg"
          alt="Contriq"
          width={110}
          height={32}
          className="h-8 w-auto"
        />
        <span>Contributions without the confusion.</span>
        <nav className="flex items-center gap-5">
          <a
            href={`mailto:${SITE.contactEmail}`}
            className="transition hover:text-foreground"
          >
            Contact us
          </a>
          <a
            href={SITE.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-foreground"
          >
            GitHub
          </a>
          <Link href="/privacy" className="transition hover:text-foreground">
            Privacy
          </Link>
        </nav>
        <span>© 2026 Contriq.</span>
      </div>
    </footer>
  );
}