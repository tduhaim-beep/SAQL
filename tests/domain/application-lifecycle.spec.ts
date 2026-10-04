import { describe, expect, it } from "vitest";
import { planApplicationTransition, type ApplicationStatus, type ApplicationCommand } from "../../src/modules/application/domain/lifecycle";

describe("S1 SM-APL permitted subset", () => {
  const states: ApplicationStatus[] = ["APPLIED", "UNDER_REVIEW", "MORE_INFO_REQUIRED", "ACCEPTED", "REJECTED", "WITHDRAWN"];
  const commands: ApplicationCommand[] = ["begin-review", "accept", "reject", "withdraw"];
  const allowed: Record<string, ApplicationStatus> = { "APPLIED:begin-review": "UNDER_REVIEW", "UNDER_REVIEW:accept": "ACCEPTED", "UNDER_REVIEW:reject": "REJECTED", "APPLIED:withdraw": "WITHDRAWN", "UNDER_REVIEW:withdraw": "WITHDRAWN" };
  for (const state of states) for (const command of commands) {
    it(`${state} / ${command} is ${allowed[`${state}:${command}`] ? "allowed" : "denied"}`, () => {
      const target = allowed[`${state}:${command}`];
      if (target) expect(planApplicationTransition(state, command, "سبب اصطناعي").status).toBe(target);
      else expect(() => planApplicationTransition(state, command, "سبب اصطناعي")).toThrow();
    });
  }
  it("reject requires a nonblank reason", () => {
    expect(() => planApplicationTransition("UNDER_REVIEW", "reject", "  ")).toThrow("سبب");
    expect(() => planApplicationTransition("UNDER_REVIEW", "reject")).toThrow("سبب");
  });
});
