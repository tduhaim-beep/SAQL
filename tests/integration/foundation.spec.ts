import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("R0 verification harness", () => {
  it("requires Node 24, lockfile, PostgreSQL migration/seed and browser verification in CI", () => {
    const ci = readFileSync(".github/workflows/ci.yml", "utf8");
    expect(ci).toContain("node-version: 24");
    expect(ci).toContain("Require lockfile");
    expect(ci).toContain("npm run db:assert-migration");
    expect(ci).toContain("npm run db:deploy");
    expect(ci).toContain("npm run db:seed");
    expect(ci).toContain("npm run test:e2e");
  });

  it("Playwright starts the application under test", () => {
    const config = readFileSync("playwright.config.ts", "utf8");
    expect(config).toContain("webServer");
    expect(config).toContain("npm run dev");
  });
});
