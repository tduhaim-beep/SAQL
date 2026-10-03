import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("current source hierarchy", () => {
  it("points Codex to latest canonical IDs and current Stage/Brand baselines", () => {
    const text = readFileSync("docs/requirements/current-baselines.md", "utf8");
    expect(text).toContain("CAN-MI");
    expect(text).toContain("CAN-AER");
    expect(text).toContain("UX/UI Functional Consolidation v2.1");
    expect(text).toContain("Engineering Foundation & Codex Readiness v2.1");
    expect(text).toContain("Implementation Control Pack v2.1");
    expect(text).toContain("SAQL Brand Identity v1.1");
    expect(text).toContain("Business feature coding remains HOLD");
  });
});
