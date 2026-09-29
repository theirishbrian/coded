import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PrivacySafeAnalytics } from "@/components/privacy-safe-analytics";
import "./globals.css";

function metadataBase() {
  if (process.env.CODED_SITE_URL) return new URL(process.env.CODED_SITE_URL);
  const deploymentHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  return new URL(
    deploymentHost ? `https://${deploymentHost}` : "http://localhost:3000",
  );
}

export const metadata: Metadata = {
  metadataBase: metadataBase(),
  title: "Coded — Your work. Your progress. Proven.",
  description:
    "Turn public GitHub profiles and repositories into a clear, shareable developer snapshot.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <PrivacySafeAnalytics />
      </body>
    </html>
  );
}
