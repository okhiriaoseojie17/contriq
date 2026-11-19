"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

export function ShareButton({
  slug,
  title,
  className = "",
}: {
  slug: string;
  title: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}/c/${slug}`;
    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);

    if (isMobile && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-mocha transition hover:bg-muted ${className}`}
    >
      {copied ? <Check size={15} /> : <Share2 size={15} />}
      {copied ? "Link copied" : "Share link"}
    </button>
  );
}