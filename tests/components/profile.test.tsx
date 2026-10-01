import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
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
  expect(screen.getByRole("article")).toHaveAttribute("id", "profile-top");
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
  const navigation = screen.getByRole("navigation", {
    name: "Profile sections",
  });
  expect(
    within(navigation).getByRole("link", { name: "Recent activity" }),
  ).toHaveAttribute("href", "#recent-activity");
  expect(
    within(navigation).getByRole("link", { name: "Profile checklist" }),
  ).toHaveAttribute("href", "#profile-checklist");
  expect(
    within(navigation).getByRole("link", { name: "Public repositories" }),
  ).toHaveAttribute("href", "#public-repositories");
  expect(within(navigation).getAllByRole("link")).toHaveLength(3);
});
it("opens the native share sheet with the canonical profile URL", async () => {
  const share = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "share", {
    configurable: true,
    value: share,
  });

  render(
    <ProfileResultView result={{ kind: "success", profile: sampleProfile }} />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Share profile" }));

  await waitFor(() =>
    expect(share).toHaveBeenCalledWith({
      title: "Sample Developer on Coded",
      text: "View @sample-dev's public developer profile on Coded.",
      url: "http://localhost:3000/u/sample-dev",
    }),
  );
  expect(screen.getByRole("status")).toHaveTextContent("Profile shared.");
});
it("copies the canonical profile URL when native sharing is unavailable", async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "share", {
    configurable: true,
    value: undefined,
  });
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });

  render(
    <ProfileResultView result={{ kind: "success", profile: sampleProfile }} />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Share profile" }));

  await waitFor(() =>
    expect(writeText).toHaveBeenCalledWith(
      "http://localhost:3000/u/sample-dev",
    ),
  );
  expect(screen.getByRole("status")).toHaveTextContent("Profile link copied.");
});
it("shares the generated PNG with a caption containing the profile URL", async () => {
  const share = vi.fn().mockResolvedValue(undefined);
  const canShare = vi.fn().mockReturnValue(true);
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    blob: () => Promise.resolve(new Blob(["png"], { type: "image/png" })),
  });
  Object.defineProperty(navigator, "share", {
    configurable: true,
    value: share,
  });
  Object.defineProperty(navigator, "canShare", {
    configurable: true,
    value: canShare,
  });
  vi.stubGlobal("fetch", fetchMock);

  render(
    <ProfileResultView result={{ kind: "success", profile: sampleProfile }} />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Share card" }));

  await waitFor(() => expect(share).toHaveBeenCalledOnce());
  const data = share.mock.calls[0][0];
  expect(data.files).toHaveLength(1);
  expect(data.files[0]).toBeInstanceOf(File);
  expect(data.files[0].name).toBe("coded-sample-dev.png");
  expect(data.text).toContain("http://localhost:3000/u/sample-dev");
  expect(canShare).toHaveBeenCalledWith(data);
  expect(fetchMock).toHaveBeenCalledWith(
    "http://localhost:3000/u/sample-dev/opengraph-image",
  );
  expect(screen.getByRole("status")).toHaveTextContent(
    "Profile card shared with the profile link.",
  );
});
it("downloads the generated PNG when Share card cannot share files", async () => {
  const fileUrl = "blob:profile-card";
  const createObjectURL = vi.fn().mockReturnValue(fileUrl);
  const revokeObjectURL = vi.fn();
  const click = vi
    .spyOn(HTMLAnchorElement.prototype, "click")
    .mockImplementation(() => undefined);
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: createObjectURL,
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: revokeObjectURL,
  });
  Object.defineProperty(navigator, "share", {
    configurable: true,
    value: undefined,
  });
  Object.defineProperty(navigator, "canShare", {
    configurable: true,
    value: undefined,
  });
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(["png"], { type: "image/png" })),
    }),
  );

  render(
    <ProfileResultView result={{ kind: "success", profile: sampleProfile }} />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Share card" }));

  await waitFor(() => expect(click).toHaveBeenCalledOnce());
  const file = createObjectURL.mock.calls[0][0] as File;
  expect(file.name).toBe("coded-sample-dev.png");
  expect(file.type).toBe("image/png");
  expect(revokeObjectURL).toHaveBeenCalledWith(fileUrl);
  expect(screen.getByRole("status")).toHaveTextContent(
    "Profile card downloaded as a PNG.",
  );
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
