import { timingSafeEqual } from "node:crypto";
import { ApplicationError } from "../shared/application-error";
import type { Actor } from "./actor";

export interface ActorRuntime {
  nodeEnvironment: string | undefined;
  appEnvironment: string | undefined;
  enabled: string | undefined;
  token: string | undefined;
}

// No authentication provider is implemented by this slice. This adapter is for
// the synthetic test harness only; even APP_ENV=test cannot enable it in a production build.
export function testActorAdapterEnabled(runtime: ActorRuntime): boolean {
  return (runtime.nodeEnvironment === "test" || runtime.nodeEnvironment === "development") &&
    runtime.appEnvironment === "test" && runtime.enabled === "1" &&
    typeof runtime.token === "string" && runtime.token.length >= 32;
}

export async function resolveTestActor(
  headers: Headers,
  runtime: ActorRuntime,
  loadSyntheticActor: (id: string) => Promise<Actor | null>,
): Promise<Actor | null> {
  const id = headers.get("x-saql-test-actor");
  const supplied = headers.get("x-saql-test-token");
  if (id === null && supplied === null) return null;
  if (!testActorAdapterEnabled(runtime) || id === null || supplied === null) {
    throw new ApplicationError("TEST_ACTOR_DISABLED", 401, "سياق المستخدم غير متاح.");
  }
  const expected = Buffer.from(runtime.token ?? "");
  const actual = Buffer.from(supplied);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected) || !/^[a-zA-Z0-9_-]{1,128}$/.test(id)) {
    throw new ApplicationError("UNAUTHENTICATED", 401, "سياق المستخدم غير متاح.");
  }
  const actor = await loadSyntheticActor(id);
  if (!actor) throw new ApplicationError("UNAUTHENTICATED", 401, "سياق المستخدم غير متاح.");
  return actor;
}
