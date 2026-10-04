import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("S2 command and architecture boundaries", () => {
  it("E2E evidence wrapper preserves a real runner failure exit status", () => {
    const failed = spawnSync(process.execPath, ["scripts/run-e2e.mjs", "--unsupported-saql-option"], { encoding: "utf8" });
    expect(failed.status).toBe(1); expect(failed.stderr).toContain("unknown option");
  });
  it("NEG-S2-07 verifies presentation/domain import guards", () => {
    expect(execFileSync(process.execPath, ["scripts/check-architecture.mjs"], { encoding: "utf8" })).toContain("Architecture import guard: OK");
  });
  it("NEG-S2-02/06 Journey exposes only scoped reads and no generic/start command", () => {
    for (const file of ["src/app/api/journeys/[id]/route.ts", "src/app/api/organization/journeys/[id]/route.ts"]) {
      const text = readFileSync(file, "utf8"); expect(text).toContain("export function GET");
      expect(text).not.toMatch(/export (?:async )?function (?:POST|PUT|PATCH|DELETE)/);
    }
    const commands = readFileSync("src/modules/training-journey/application/read.ts", "utf8");
    expect(commands).not.toMatch(/(?:updateStatus|confirmStart|activate|actualStartAt)/);
  });
});
