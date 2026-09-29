"use client";

import { useState } from "react";

type ShareStatus =
  | "idle"
  | "profile_shared"
  | "link_copied"
  | "card_shared"
  | "card_downloaded"
  | "unavailable";

function currentProfileUrl(username: string) {
  return new URL(`/u/${encodeURIComponent(username)}`, window.location.origin)
    .href;
}

function currentCardUrl(username: string) {
  return new URL(
    `/u/${encodeURIComponent(username)}/opengraph-image`,
    window.location.origin,
  ).href;
}

function cardFileName(username: string) {
  return `coded-${username}.png`;
}

function downloadFile(file: File) {
  const objectUrl = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = file.name;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

export function ShareProfileButton({
  username,
  displayName,
}: {
  username: string;
  displayName: string;
}) {
  const [status, setStatus] = useState<ShareStatus>("idle");
  const [cardBusy, setCardBusy] = useState(false);

  async function copyProfileLink(url: string) {
    if (!navigator.clipboard?.writeText) {
      setStatus("unavailable");
      return;
    }
    await navigator.clipboard.writeText(url);
    setStatus("link_copied");
  }

  async function getCardFile() {
    const response = await fetch(currentCardUrl(username));
    if (!response.ok) throw new Error("Card request failed");
    return new File([await response.blob()], cardFileName(username), {
      type: "image/png",
    });
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
        setStatus("profile_shared");
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

  async function downloadCard() {
    setCardBusy(true);
    try {
      downloadFile(await getCardFile());
      setStatus("card_downloaded");
    } catch {
      setStatus("unavailable");
    } finally {
      setCardBusy(false);
    }
  }

  async function shareCard() {
    setCardBusy(true);
    try {
      const file = await getCardFile();
      const shareData = {
        files: [file],
        title: `${displayName} on Coded`,
        text: `View @${username}'s public developer profile on Coded: ${currentProfileUrl(username)}`,
      };

      if (navigator.share && navigator.canShare?.(shareData)) {
        try {
          await navigator.share(shareData);
          setStatus("card_shared");
          return;
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError")
            return;
        }
      }

      downloadFile(file);
      setStatus("card_downloaded");
    } catch {
      setStatus("unavailable");
    } finally {
      setCardBusy(false);
    }
  }

  const message = {
    idle: "",
    profile_shared: "Profile shared.",
    link_copied: "Profile link copied.",
    card_shared: "Profile card shared with the profile link.",
    card_downloaded: "Profile card downloaded as a PNG.",
    unavailable:
      "Sharing or download is unavailable. Please try again or use your browser controls.",
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
      <button
        type="button"
        onClick={shareCard}
        disabled={cardBusy}
        className="min-h-11 rounded-sm border border-white/25 px-4 text-sm font-semibold text-[#f3f4f1] hover:border-[#d3ef8b]/60 hover:text-[#d3ef8b] disabled:cursor-wait disabled:opacity-60"
      >
        Share card
      </button>
      <button
        type="button"
        onClick={downloadCard}
        disabled={cardBusy}
        className="min-h-11 rounded-sm border border-white/25 px-4 text-sm font-semibold text-[#f3f4f1] hover:border-[#d3ef8b]/60 hover:text-[#d3ef8b] disabled:cursor-wait disabled:opacity-60"
      >
        Download card
      </button>
      <span className="text-sm text-[#b9beb6]" role="status" aria-live="polite">
        {message}
      </span>
    </div>
  );
}
