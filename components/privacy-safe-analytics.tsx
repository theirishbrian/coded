"use client";

import { Analytics } from "@vercel/analytics/next";
import { redactProfilePath } from "@/lib/analytics/redact-profile-path";

export function PrivacySafeAnalytics() {
  return <Analytics beforeSend={redactProfilePath} />;
}
