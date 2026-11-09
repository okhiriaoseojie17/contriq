import type { Metadata } from "next";
import "./globals.css";

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
      <body className="antialiased">{children}</body>
    </html>
  );
}