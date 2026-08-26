import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Automated accessibility gate: no serious or critical axe violations on any
 * core surface, plus a keyboard walk of the primary flow.
 */

async function expectNoSeriousViolations(page: import("@playwright/test").Page) {
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(
    serious.map((v) => `${v.id}: ${v.help} (${v.nodes.length} nodes)`),
  ).toEqual([]);
}

test("marketing has no serious a11y violations", async ({ page }) => {
  await page.goto("/");
  await expectNoSeriousViolations(page);
});

test("login (demo) has no serious a11y violations", async ({ page }) => {
  await page.goto("/login");
  await expectNoSeriousViolations(page);
});

test("dashboard empty state has no serious a11y violations", async ({ page }) => {
  await page.goto("/app");
  await page.getByRole("heading", { name: "A calm blank page" }).waitFor();
  await expectNoSeriousViolations(page);
});

test("editor with sample has no serious a11y violations", async ({ page }) => {
  await page.goto("/app");
  await page.getByRole("button", { name: "Load sample" }).click();
  await page.waitForURL(/\/app\/.+/);
  await page.locator(".sheet-name").waitFor();
  await expectNoSeriousViolations(page);
});

test("export page has no serious a11y violations", async ({ page }) => {
  await page.goto("/app");
  await page.getByRole("button", { name: "Load sample" }).click();
  await page.waitForURL(/\/app\/.+/);
  await page.getByRole("link", { name: "Export" }).click();
  await page.getByRole("button", { name: "Print / Save PDF" }).waitFor();
  await expectNoSeriousViolations(page);
});

test("primary flow is fully keyboard-operable", async ({ page }) => {
  await page.goto("/");
  // Tab to the primary CTA and enter the studio.
  const openStudio = page.getByRole("link", { name: "Open the studio" });
  for (let i = 0; i < 8; i++) {
    if (await openStudio.evaluate((el) => el === document.activeElement)) break;
    await page.keyboard.press("Tab");
  }
  await expect(openStudio).toBeFocused();
  await page.keyboard.press("Enter");
  await page.waitForURL(/\/app$/);

  // Reach "Start a resume" with the keyboard only.
  const start = page.getByRole("button", { name: "Start a resume" });
  for (let i = 0; i < 12; i++) {
    if (await start.evaluate((el) => el === document.activeElement)) break;
    await page.keyboard.press("Tab");
  }
  await expect(start).toBeFocused();
  await page.keyboard.press("Enter");
  await page.waitForURL(/\/app\/[a-z0-9-]+$/i);

  // Type into the first field via keyboard and see it hit the sheet.
  await page.getByLabel("Full name").focus();
  await page.keyboard.type("Keyboard User");
  await expect(page.locator(".sheet-name")).toHaveText("Keyboard User");
});
