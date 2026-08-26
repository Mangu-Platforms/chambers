import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";

// Sandboxed dev environments pre-install Chromium here; CI runs `playwright install` instead.
const PREINSTALLED_CHROMIUM = "/opt/pw-browsers/chromium";

/**
 * E2E smoke tests against a production build in demo mode.
 * Run `pnpm build` first; `pnpm e2e` starts `next start` itself.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3200",
    ...(existsSync(PREINSTALLED_CHROMIUM) && !process.env.CI
      ? { launchOptions: { executablePath: PREINSTALLED_CHROMIUM } }
      : {}),
  },
  webServer: {
    command: "pnpm start -p 3200",
    url: "http://localhost:3200/api/health",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
