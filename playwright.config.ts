import dotenv from "dotenv";
import path from "node:path";
import { defineConfig, devices } from "@playwright/test";
import fs from "node:fs";

dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

// Determine if a saved storage state exists
const storageStatePath = path.resolve(process.cwd(), "playwright/.auth/user.json");
const storageStateExists = fs.existsSync(storageStatePath);
if (!storageStateExists) {
  fs.mkdirSync(path.dirname(storageStatePath), { recursive: true });
  fs.writeFileSync(storageStatePath, JSON.stringify({}), { flag: "w" });
}

const webServer = process.env.CI
  ? {
      command: "pnpm build --mode test && pnpm preview --mode test",
      url: "http://localhost:4321",
      timeout: 180 * 1000, // Longer timeout for build + preview
    }
  : {
      command: "pnpm dev:e2e",
      url: "http://localhost:4321",
      reuseExistingServer: true,
    };

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 1,
  reporter: [["list"], ["github"]],
  webServer,
  use: {
    baseURL: "http://localhost:4321",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    storageState: storageStatePath,
  },
  projects: [
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], storageState: storageStatePath },
      dependencies: ["setup"],
    },
  ],
});
