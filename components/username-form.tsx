"use client";
import { useId, useRef, useState, useTransition, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { normalizeUsername } from "@/lib/github/username";
export function UsernameForm({ initialValue = "" }: { initialValue?: string }) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const username = normalizeUsername(
      new FormData(event.currentTarget).get("username"),
    );
    if (!username) {
      setError(
        "Enter a GitHub username: 1–39 letters or numbers, with single hyphens between them.",
      );
      input.current?.focus();
      return;
    }
    setError("");
    startTransition(() => {
      const destination = `/u/${username}`;
      if (pathname === destination) router.refresh();
      else router.push(destination);
    });
  }
  return (
    <form
      action="/lookup"
      method="get"
      onSubmit={submit}
      noValidate
      className="w-full max-w-xl"
      aria-busy={pending}
    >
      <label htmlFor={id} className="mb-3 block text-sm font-semibold">
        GitHub username
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          ref={input}
          id={id}
          name="username"
          defaultValue={initialValue}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={80}
          aria-invalid={Boolean(error)}
          aria-describedby={`${id}-hint${error ? ` ${id}-error` : ""}`}
          placeholder="e.g. octocat"
          className="min-h-12 min-w-0 flex-1 rounded-sm border border-white/30 bg-white/5 px-4 text-base text-white placeholder:text-[#949b91]"
        />
        <button
          type="submit"
          disabled={pending}
          className="min-h-12 rounded-sm bg-[#d3ef8b] px-6 py-3 text-sm font-bold text-[#111315] hover:bg-[#e2f7b3] disabled:opacity-70"
        >
          {pending ? "Looking up…" : "View profile"}
        </button>
      </div>
      <p id={`${id}-hint`} className="mt-3 text-sm text-[#b9beb6]">
        A public username, not a GitHub URL. No sign-in needed.
      </p>
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-3 text-sm text-[#ffb5a7]"
        >
          {error}
        </p>
      ) : null}
      <p role="status" className="mt-2 text-sm text-[#d3ef8b]">
        {pending ? "Looking up the public profile…" : ""}
      </p>
    </form>
  );
}
