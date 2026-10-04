import { defineConfig, devices } from "@playwright/test";
import { randomBytes } from "node:crypto";

// This configuration belongs to the external test harness, never the product UI.
process.env.APP_ENV = "test";
process.env.SAQL_TEST_ACTOR_TOKEN ??= randomBytes(32).toString("hex");

export default defineConfig({
  testDir: "./tests/e2e",
  reporter: [["line"], ["json", { outputFile: "test-results/results.json" }]],
  use: { baseURL: process.env.E2E_BASE_URL ?? "http://127.0.0.1:3000" },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: false,
    env: { APP_ENV: "test", SAQL_ENABLE_TEST_ACTOR_ADAPTER: "1", SAQL_TEST_ACTOR_TOKEN: process.env.SAQL_TEST_ACTOR_TOKEN },
    timeout: 120_000,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
