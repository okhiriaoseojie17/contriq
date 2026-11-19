import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { RouteFade } from "@/components/route-fade";

export const metadata: Metadata = {
  // Set NEXT_PUBLIC_SITE_URL in Vercel to your live URL so share previews work.
  metadataBase: new URL(
    process.env.SITE_URL ?? "http://localhost:3000"
  ),
  title: {
    default: "Contriq — Contributions without the confusion",
    template: "%s | Contriq",
  },
  description:
    "Organize group contributions, collect payments and keep transparent financial records with Contriq.",
  applicationName: "Contriq",
  openGraph: {
    title: "Contriq — Contributions without the confusion",
    description:
      "Organize group contributions, collect payments and keep transparent financial records.",
    siteName: "Contriq",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contriq — Contributions without the confusion",
    description:
      "Organize group contributions, collect payments and keep transparent financial records.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <RouteFade />
        <div className="flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}