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
  await expect(
    page.getByRole("link", { name: "Share product feedback" }),
  ).toHaveAttribute(
    "href",
    "https://github.com/theirishbrian/coded/issues/new?template=product_feedback.yml",
  );
  await expect(page.getByText(/Retrieved/).first()).toBeVisible();
  await expect(
    page.getByRole("link", { name: "repo-01", exact: true }),
  ).toBeVisible();
  const highlights = page.getByRole("region", {
    name: "Project proof highlights",
  });
  await expect(highlights).toBeVisible();
  await expect(highlights).toContainText(
    "Stars indicate public interest and push dates indicate repository updates",
  );
  await expect(
    highlights.getByRole("link", { name: "repo-02", exact: true }),
  ).toBeVisible();
  await expect(
    highlights.getByRole("link", { name: "repo-04", exact: true }),
  ).toBeVisible();
  await expect(
    highlights.getByRole("link", { name: "repo-05", exact: true }),
  ).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Sample Developer", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("profile metadata publishes a social card and copyable canonical URL", async ({
  context,
  page,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined,
    });
  });
  await page.goto("/u/sample-dev");

  await expect(page).toHaveTitle("Sample Developer (@sample-dev) | Coded");
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "http://127.0.0.1:3100/u/sample-dev",
  );

  const imageUrl = await page
    .locator('meta[property="og:image"]')
    .getAttribute("content");
  expect(imageUrl).toBeTruthy();
  const image = await page.request.get(imageUrl!);
  expect(image.ok()).toBe(true);
  expect(image.headers()["content-type"]).toBe("image/png");

  await page.getByRole("button", { name: "Share profile" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Profile link copied." }),
  ).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "http://127.0.0.1:3100/u/sample-dev",
  );
});

test("downloads the generated profile card with a useful filename", async ({
  page,
}) => {
  await page.goto("/u/sample-dev");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download card" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("coded-sample-dev.png");
  await expect(
    page.getByRole("status").filter({
      hasText: "Profile card downloaded as a PNG.",
    }),
  ).toBeVisible();
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
  await expect(
    page.getByRole("link", { name: "repo-12", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await expect(
    page.getByRole("button", { name: "View profile" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Share profile" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Share card" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Download card" }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Project proof highlights" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Share product feedback" }),
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
  await expect(
    page.getByRole("link", {
      name: "view repositories on GitHub",
      exact: true,
    }),
  ).toHaveAttribute("href", "https://github.com/sample-dev?tab=repositories");
  await context.close();
});

test("repository disclosure works by keyboard without another request", async ({
  page,
}) => {
  await page.goto("/u/sample-dev");
  await expect(
    page.getByRole("link", { name: "repo-01", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "repo-13", exact: true }),
  ).not.toBeVisible();
  const summary = page.locator("summary");
  await summary.focus();
  await expect(summary).toBeFocused();
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await summary.press("Enter");
  await expect(
    page.getByRole("link", { name: "repo-14", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "repo-14", exact: true }),
  ).toHaveAttribute("href", "https://github.com/sample-dev/repo-14");
  expect(requests).toEqual([]);
});

test("repository explorer filters retrieved data without another request", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/u/sample-dev");
  await page.waitForLoadState("networkidle");

  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));

  const search = page.getByRole("searchbox", { name: "Search repositories" });
  await search.fill("JavaScript");
  await expect(
    page.getByText(/Showing 2 of 14 retrieved repositories/),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "repo-13", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "repo-01", exact: true }),
  ).not.toBeVisible();

  await search.fill("");
  await page.getByRole("checkbox", { name: "Include forks" }).uncheck();
  await page.getByRole("checkbox", { name: "Include archived" }).uncheck();
  await expect(
    page.getByText(/Showing 13 of 14 retrieved repositories/),
  ).toBeVisible();
  await page.getByRole("combobox", { name: "Sort by" }).selectOption("stars");
  await expect(page.getByText(/popularity is not proficiency/)).toBeVisible();

  expect(requests).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("account remains usable while repositories load and after they fail", async ({
  page,
}) => {
  await page.goto("/u/repo-failure", { waitUntil: "commit" });
  await expect(
    page.getByRole("heading", { name: "Sample Developer", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("status").filter({ hasText: "Loading public repositories" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Repository data unavailable" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "View on GitHub" }),
  ).toHaveAttribute("href", "https://github.com/repo-failure");
  await expect(page.getByRole("textbox")).toBeEnabled();
});

test("empty and interrupted repository views are distinct", async ({
  page,
}) => {
  await page.goto("/u/empty-dev");
  await expect(
    page.getByText("No owned public repositories were returned by GitHub."),
  ).toBeVisible();
  await page.goto("/u/partial-dev");
  await expect(page.getByText(/Incomplete results:/)).toBeVisible();
  await expect(
    page.getByRole("link", { name: "repo-01", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(/This incomplete result is not cached/),
  ).toBeVisible();
});

test("language summary covers all fetched repositories before disclosure", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/u/sample-dev");
  const summary = page.getByRole("region", { name: "Repository languages" });
  await expect(summary).toContainText("Based on all 14 retrieved repositories");
  await expect(summary).toContainText("11 of 14 repositories (79%)");
  await expect(summary).toContainText("JavaScript");
  await expect(summary).toContainText("2 of 14 repositories (14%)");
  await expect(summary).toContainText("Primary language not reported: 1 of 14");
  await expect(
    page.getByRole("link", { name: "repo-14", exact: true }),
  ).not.toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
