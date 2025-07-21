import { test as setup } from "@playwright/test";
import path from "path";

const authFile = path.join(process.cwd(), "playwright/.auth/user.json");

setup("authenticate", async ({ page }) => {
  // Navigate to login page and perform login
  await page.goto("/auth/login");
  // Wait for hydration and scripts to load
  await page.waitForLoadState("networkidle");
  // If already authenticated, skip filling login form
  if (page.url().includes("/dashboard")) {
    return;
  }
  const email = process.env.E2E_USERNAME;
  const password = process.env.E2E_PASSWORD;
  if (!email || !password) {
    throw new Error("E2E_USERNAME and E2E_PASSWORD must be set");
  }
  await page.getByTestId("login-email").fill(email);
  await page.getByTestId("login-password").fill(password);
  // Click login and wait for dashboard navigation
  await Promise.all([page.getByTestId("login-submit").click(), page.waitForURL("**/dashboard")]);

  // Save auth state
  await page.context().storageState({
    path: authFile,
  });
});
