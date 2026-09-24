import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // The browser also stays local: replace the decorative remote avatar.
  await page.route("https://avatars.githubusercontent.com/**", (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="#d3ef8b"/></svg>',
    }),
  );
});

test("keyboard submit leads to a shareable attributed profile", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
  await page
    .getByRole("textbox", { name: "GitHub username" })
    .fill(" SAMPLE-DEV ");
  await page.getByRole("textbox").press("Enter");
  await expect(page).toHaveURL(/\/u\/sample-dev$/);
  await expect(
    page.getByRole("heading", { name: "Sample Developer", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "View on GitHub" }),
  ).toHaveAttribute("href", "https://github.com/sample-dev");
  await expect(page.getByText(/Retrieved/)).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Sample Developer", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("invalid form and direct URL inputs show validation", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("textbox").fill("not/a/username");
  await page.getByRole("button", { name: "View profile" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "Enter a GitHub username",
  );
  await expect(page.getByRole("textbox")).toBeFocused();
  await expect(page).toHaveURL("http://127.0.0.1:3100/");
  await page.goto("/u/invalid!");
  await expect(
    page.getByRole("heading", { name: "Check that username" }),
  ).toBeVisible();
});

test("missing accounts and upstream failures never show fabricated profiles", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("textbox").fill("missing-user");
  await page.getByRole("button", { name: "View profile" }).click();
  await expect(
    page.getByRole("heading", { name: "Profile unavailable" }),
  ).toBeVisible();
  await expect(page.getByText(/may not be publicly accessible/)).toBeVisible();
  await page.getByRole("textbox").fill("broken-user");
  await page.getByRole("button", { name: "View profile" }).click();
  await expect(
    page.getByRole("heading", { name: "GitHub is temporarily unavailable" }),
  ).toBeVisible();
  await expect(page.getByRole("definition")).toHaveCount(0);
});

test("mobile profile stays within the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/u/sample-dev");
  await expect(
    page.getByRole("heading", { name: "Sample Developer", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await expect(
    page.getByRole("button", { name: "View profile" }),
  ).toBeVisible();
});

test("native form works without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.route("https://avatars.githubusercontent.com/**", (route) =>
    route.abort(),
  );
  await page.goto("http://127.0.0.1:3100/");
  await page.getByRole("textbox").fill("sample-dev");
  await page.getByRole("button", { name: "View profile" }).click();
  await expect(page).toHaveURL(/\/u\/sample-dev$/);
  await expect(
    page.getByRole("heading", { name: "Sample Developer", exact: true }),
  ).toBeVisible();
  await context.close();
});
