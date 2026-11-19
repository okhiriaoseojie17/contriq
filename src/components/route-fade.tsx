"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

function Inner() {
  const pathname = usePathname();
  const router = useRouter();

  // A new page has arrived: stop fading out.
  useEffect(() => {
    document.documentElement.classList.remove("page-leaving");
  }, [pathname]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const a = (e.target as Element | null)?.closest("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;

      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      )
        return;
      // File downloads and API routes must not go through the router.
      if (url.pathname.endsWith("/export") || url.pathname.startsWith("/api/"))
        return;

      e.preventDefault();
      e.stopPropagation();
      const root = document.documentElement;
      root.classList.add("page-leaving");
      window.setTimeout(
        () => router.push(url.pathname + url.search + url.hash),
        180
      );
      // Safety net: never leave the page invisible.
      window.setTimeout(() => root.classList.remove("page-leaving"), 3000);
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  return null;
}

export function RouteFade() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}