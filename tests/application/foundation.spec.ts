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
    expect(text).toContain("Master Index v3.0");
    expect(text).toContain("AER v2.9");
    expect(text).toContain("S2-TRN-READY-001 v0.1 Task Packet");
    expect(text).toContain("authorize G3 Builder for Slice02 Acceptance → PENDING_START only");
    expect(text).toContain("Business Coding outside the approved Slice02 remains HOLD");
  });
  it("keeps Pre-R0 reconciliation out of the current phase and mandatory read order", () => {
    const agents = readFileSync("AGENTS.md", "utf8");
    const start = readFileSync("docs/codex/codex-start-here.md", "utf8");
    const baselines = readFileSync("docs/requirements/current-baselines.md", "utf8");
    expect(agents.split("\n")[0]).toContain("Pilot v2.0 / Slice 2");
    expect(agents.split("\n")[0]).not.toContain("Pre-R0");
    expect(start.split("\n")[0]).not.toContain("Pre-R0");
    expect(baselines.split("\n")[0]).toContain("Pilot v2.0 / Slice02");
    expect(baselines.split("\n")[0]).not.toContain("Pre-R0");
    const mandatory = start.split("## Mandatory read order")[1]?.split("\n## ")[0];
    expect(mandatory).toBeDefined();
    expect(mandatory).not.toContain("pre-r0-reconciliation.md");
    expect(start.split("## Historical / Supporting context only")[1]).toContain("pre-r0-reconciliation.md");
    const current = baselines.split("Current source-of-truth references:")[1]?.split("Historical / Supporting references only:")[0];
    expect(current).toContain("Stage 08B v0.2");
    expect(current).toContain("Approved / Current R0 Evidence");
    expect(current).not.toContain("Stage 08B v0.1");
    expect(baselines.split("Historical / Supporting references only:")[1]).toContain("Stage 08B v0.1 — Historical");
  });
});
