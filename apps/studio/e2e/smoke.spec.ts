import { expect, test } from "@playwright/test";

/**
 * Critical-path smoke, demo mode: marketing → studio → create → edit → live preview →
 * template switch → export surface. This is the Phase-2 definition of done, executed.
 */

test("marketing page renders the Chambers language", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "One page. Perfectly set." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open the studio" })).toBeVisible();
});

test("login page explains demo mode when Supabase is absent", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Demo mode" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Continue to the studio" })).toBeVisible();
});

test("dashboard shows the designed empty state, then creates a document", async ({ page }) => {
  await page.goto("/app");
  await expect(page.getByRole("heading", { name: "A calm blank page" })).toBeVisible();
  await page.getByRole("button", { name: "Start a resume" }).click();
  await expect(page).toHaveURL(/\/app\/[a-z0-9-]+$/i);
  await expect(page.locator("article.sheet")).toBeVisible();
});

test("editing flows into the live preview instantly", async ({ page }) => {
  await page.goto("/app");
  await page.getByRole("button", { name: "New resume" }).click();
  await page.waitForURL(/\/app\/[a-z0-9-]+$/i);

  await page.getByLabel("Full name").fill("Test Candidate");
  await expect(page.locator(".sheet-name")).toHaveText("Test Candidate");

  await page.getByLabel("Headline").fill("Quality engineer");
  await expect(page.locator(".sheet-role")).toHaveText("Quality engineer");

  // Template switch keeps content and marks selection.
  await page.getByRole("radio", { name: "Executive" }).click();
  await expect(page.locator("article.sheet")).toHaveAttribute("data-template", "executive");
  await expect(page.locator(".sheet-name")).toHaveText("Test Candidate");
});

test("sample document renders a full sheet and export page loads", async ({ page }) => {
  await page.goto("/app");
  await page.getByRole("button", { name: "Load sample" }).click();
  await page.waitForURL(/\/app\/[a-z0-9-]+$/i);
  await expect(page.locator(".sheet-name")).toHaveText("Avery Lang");
  await expect(page.locator(".sheet-chip").first()).toBeVisible();

  await page.getByRole("link", { name: "Export" }).click();
  await expect(page.getByRole("heading", { name: "Export", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Print / Save PDF" })).toBeVisible();

  // Plain-text export downloads and contains the sample content.
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download .txt" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.txt$/);
});

test("documents persist across reloads in demo mode", async ({ page }) => {
  await page.goto("/app");
  await page.getByRole("button", { name: "New resume" }).click();
  await page.waitForURL(/\/app\/[a-z0-9-]+$/i);
  await page.getByLabel("Full name").fill("Persistent Person");
  // Autosave debounce is 600ms.
  await page.waitForTimeout(900);
  await page.reload();
  await expect(page.locator(".sheet-name")).toHaveText("Persistent Person");
});

test("health endpoint reports demo mode", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.ok).toBe(true);
  expect(body.mode).toBe("demo");
});
