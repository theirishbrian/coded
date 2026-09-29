"use client";

import { useState } from "react";

type ShareStatus = "idle" | "shared" | "copied" | "unavailable";

function currentProfileUrl(username: string) {
  return new URL(`/u/${encodeURIComponent(username)}`, window.location.origin)
    .href;
}

export function ShareProfileButton({
  username,
  displayName,
}: {
  username: string;
  displayName: string;
}) {
  const [status, setStatus] = useState<ShareStatus>("idle");

  async function copyProfileLink(url: string) {
    if (!navigator.clipboard?.writeText) {
      setStatus("unavailable");
      return;
    }
    await navigator.clipboard.writeText(url);
    setStatus("copied");
  }

  async function shareProfile() {
    const url = currentProfileUrl(username);
    const shareData = {
      title: `${displayName} on Coded`,
      text: `View @${username}'s public developer profile on Coded.`,
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setStatus("shared");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
      }
    }

    try {
      await copyProfileLink(url);
    } catch {
      setStatus("unavailable");
    }
  }

  const message = {
    idle: "",
    shared: "Profile shared.",
    copied: "Profile link copied.",
    unavailable: "Copy this page's address from your browser.",
  }[status];

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={shareProfile}
        className="min-h-11 rounded-sm border border-[#d3ef8b]/60 px-4 text-sm font-semibold text-[#d3ef8b] hover:bg-[#d3ef8b]/10"
      >
        Share profile
      </button>
      <span className="text-sm text-[#b9beb6]" role="status" aria-live="polite">
        {message}
      </span>
    </div>
  );
}
