import Image from "next/image";
import Link from "next/link";

export function BrandLogo({
  className = "h-9",
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={href === "/" ? "Contriq home" : "Contriq dashboard"}
      className="inline-block"
    >
      <Image
        src="/logo-nav.svg"
        alt="Contriq"
        width={140}
        height={41}
        priority
        className={`${className} w-auto`}
      />
    </Link>
  );
}