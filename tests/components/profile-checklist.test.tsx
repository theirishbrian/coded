import { render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { ProfileChecklist } from "@/components/profile-checklist";
import type { RepositoriesResult } from "@/lib/profile/get-repositories";
import { sampleProfile } from "../fixtures/profile";

const unavailable = {
  kind: "failure",
  failure: {
    kind: "rate_limited",
    retryAfterSeconds: null,
    resetAt: null,
  },
} satisfies RepositoriesResult;

it("renders accessible account guidance and an explicit unavailable state", () => {
  render(
    <ProfileChecklist profile={sampleProfile} repositories={unavailable} />,
  );

  const section = screen.getByRole("region", {
    name: "Public profile checklist",
  });
  expect(section).toHaveAttribute("id", "profile-checklist");
  expect(within(section).getByText("Actionable, not scored")).toBeVisible();
  expect(within(section).getByText("Add a public biography")).toBeVisible();
  expect(
    within(section).getByText(/Repository checks are unavailable/),
  ).toBeVisible();
  expect(within(section).getByText(/not a developer score/)).toBeVisible();
  expect(
    within(section).getByRole("link", { name: "Back to profile" }),
  ).toHaveAttribute("href", "#profile-top");
});
