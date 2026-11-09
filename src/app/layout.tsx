
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Contriq — Contributions without the confusion",
    template: "%s | Contriq",
  },
  description:
    "Organize group contributions, collect payments and keep transparent financial records with Contriq.",
  applicationName: "Contriq",
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
