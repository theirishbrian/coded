import { render, screen, within } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import Home from "@/app/page";
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/",
}));

test("introduces Coded and offers a public username lookup", () => {
  render(<Home />);

  expect(
    within(screen.getByRole("main")).getByRole("heading", {
      level: 1,
      name: /^Your work\.\s*Your progress\.\s*Proven\.$/,
    }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("textbox", { name: "GitHub username" }),
  ).toBeVisible();
  expect(
    screen.getByText("Activity and repository insights are coming later."),
  ).toBeVisible();
});

test("directs visitors to the public project repository", () => {
  render(<Home />);

  expect(
    screen.getByRole("link", { name: "Follow the project on GitHub" }),
  ).toHaveAttribute("href", "https://github.com/theirishbrian/coded");
});

test("provides a skip link to the focusable main content", () => {
  render(<Home />);

  const main = screen.getByRole("main");
  const skipLink = screen.getByRole("link", { name: "Skip to content" });
  expect(main.id).not.toBe("");
  expect(skipLink).toHaveAttribute("href", `#${main.id}`);
  main.focus();
  expect(main).toHaveFocus();
});
