import { describe, expect, it, vi } from "vitest";
import { resolveTestActor, testActorAdapterEnabled, type ActorRuntime } from "../../src/identity/test-actor";

const runtime: ActorRuntime = { nodeEnvironment: "test", appEnvironment: "test", enabled: "1", token: "t".repeat(64) };
const headers = new Headers({ "x-saql-test-actor": "synthetic-student", "x-saql-test-token": runtime.token ?? "" });
describe("NEG-S1-09 test adapter fails closed", () => {
  it.each([
    { nodeEnvironment: "production" }, { appEnvironment: "production" }, { appEnvironment: undefined },
    { enabled: undefined }, { token: undefined }, { token: "short" }, { nodeEnvironment: undefined },
  ])("disabled for %j", async (change) => {
    const load = vi.fn(); const restricted = { ...runtime, ...change };
    expect(testActorAdapterEnabled(restricted)).toBe(false);
    await expect(resolveTestActor(headers, restricted, load)).rejects.toMatchObject({ httpStatus: 401 });
    expect(load).not.toHaveBeenCalled();
  });
  it("no test header means visitor", async () => expect(await resolveTestActor(new Headers(), runtime, vi.fn())).toBeNull());
  it("wrong token never queries identity", async () => {
    const load = vi.fn(); const wrong = new Headers(headers); wrong.set("x-saql-test-token", "x".repeat(64));
    await expect(resolveTestActor(wrong, runtime, load)).rejects.toMatchObject({ httpStatus: 401 }); expect(load).not.toHaveBeenCalled();
  });
  it("unknown synthetic actor denied", async () => await expect(resolveTestActor(headers, runtime, async () => null)).rejects.toMatchObject({ httpStatus: 401 }));
  it("roles come from trusted lookup, never request headers", async () => {
    const spoofed = new Headers(headers); spoofed.set("x-role", "SUPER_ADMIN");
    expect(await resolveTestActor(spoofed, runtime, async () => ({ userId: "synthetic-student", grants: [{ role: "STUDENT_TRAINEE" }] })))
      .toEqual({ userId: "synthetic-student", grants: [{ role: "STUDENT_TRAINEE" }] });
  });
});
