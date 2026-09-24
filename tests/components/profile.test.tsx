import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { UsernameForm } from "@/components/username-form";
import { ProfileResultView } from "@/components/profile-result";
import { sampleProfile } from "../fixtures/profile";
const navigation = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => navigation,
  usePathname: () => "/",
}));
beforeEach(() => vi.clearAllMocks());

it("announces invalid input and returns focus without navigation", () => {
  render(<UsernameForm />);
  const input = screen.getByRole("textbox", { name: "GitHub username" });
  fireEvent.change(input, { target: { value: "https://github.com/test" } });
  fireEvent.click(screen.getByRole("button", { name: "View profile" }));
  expect(screen.getByRole("alert")).toHaveTextContent(
    "Enter a GitHub username",
  );
  expect(input).toHaveFocus();
  expect(input).toHaveAttribute("aria-invalid", "true");
  expect(navigation.push).not.toHaveBeenCalled();
});
it("navigates to a normalized shareable URL", () => {
  render(<UsernameForm />);
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: " Sample-DEV " },
  });
  fireEvent.click(screen.getByRole("button", { name: "View profile" }));
  expect(navigation.push).toHaveBeenCalledExactlyOnceWith("/u/sample-dev");
  expect(navigation.refresh).not.toHaveBeenCalled();
});
it("shows reported zero, unavailable values, attribution and freshness distinctly", () => {
  render(
    <ProfileResultView result={{ kind: "success", profile: sampleProfile }} />,
  );
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
    "Sample Developer",
  );
  expect(screen.getByText("No public biography provided.")).toBeVisible();
  const followers = screen.getByText("Followers").parentElement!;
  expect(within(followers).getByRole("definition")).toHaveTextContent("0");
  expect(screen.getByText("Unavailable")).toBeVisible();
  expect(screen.getByText(/Private profiles may report zero/)).toBeVisible();
  expect(
    screen.getByText(/Results may be reused for up to five minutes/),
  ).toBeVisible();
  expect(
    screen.getByRole("link", { name: "View source data on GitHub" }),
  ).toHaveAttribute("href", sampleProfile.source.url);
});
it.each([
  ["not_found", "Profile unavailable"],
  ["unsupported_account", "Personal accounts only, for now"],
  ["timeout", "GitHub took too long"],
  ["upstream_error", "GitHub is temporarily unavailable"],
  ["invalid_input", "Check that username"],
  ["access_denied", "GitHub access unavailable"],
  ["network_error", "Could not reach GitHub"],
  ["malformed_response", "Profile data unavailable"],
] as const)("renders %s as an explicit state", (kind, title) => {
  render(<ProfileResultView result={{ kind }} />);
  expect(screen.getByRole("heading", { name: title })).toBeVisible();
  expect(screen.queryByRole("definition")).not.toBeInTheDocument();
});
it("shows a cooldown without automatic retries", () => {
  render(
    <ProfileResultView
      result={{ kind: "rate_limited", retryAfterSeconds: 90, resetAt: null }}
    />,
  );
  expect(screen.getByText(/at least 2 minute/)).toBeVisible();
  expect(screen.getByText(/Nothing retries automatically/)).toBeVisible();
});
