import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import assert from "node:assert/strict";

const port = 3021;
const base = `http://127.0.0.1:${port}`;
const token = randomBytes(32).toString("hex");
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], {
  env: { ...process.env, NODE_ENV: "production", APP_ENV: "test", SAQL_ENABLE_TEST_ACTOR_ADAPTER: "1", SAQL_TEST_ACTOR_TOKEN: token },
  stdio: ["ignore", "pipe", "pipe"],
});
let output = "";
server.stdout.on("data", (x) => { output += x; }); server.stderr.on("data", (x) => { output += x; });
const closed = new Promise((resolve) => server.once("exit", resolve));
try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (server.exitCode !== null) throw new Error("Production guard server exited before readiness");
    try { if ((await fetch(`${base}/api/health`)).ok) { ready = true; break; } } catch { /* readiness only */ }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.ok(ready, "production guard server must start");
  const headers = { "x-saql-test-actor": "synthetic-production-probe", "x-saql-test-token": token };
  const response = await fetch(`${base}/api/applications`, { headers });
  assert.equal(response.status, 401); assert.equal((await response.json()).code, "TEST_ACTOR_DISABLED");
  const mutation = await fetch(`${base}/api/applications`, { method: "POST", headers: { ...headers, Origin: base, "Content-Type": "application/json" }, body: JSON.stringify({ opportunityId: "synthetic-opportunity" }) });
  assert.equal(mutation.status, 401); assert.equal((await mutation.json()).code, "TEST_ACTOR_DISABLED");
  const anonymous = await fetch(`${base}/api/applications`);
  assert.equal(anonymous.status, 401);
  for (const path of ["/api/journeys/synthetic-journey", "/api/organization/journeys/synthetic-journey"]) {
    const journey = await fetch(`${base}${path}`, { headers });
    assert.equal(journey.status, 401); assert.equal((await journey.json()).code, "TEST_ACTOR_DISABLED");
    assert.equal((await fetch(`${base}${path}`)).status, 401);
  }
  console.log("NEG-S1-09 PASS: actual production build rejects test identity on GET and POST, even APP_ENV=test + adapter enabled + valid token; anonymous access denied.");
  console.log("NEG-S2-09 PASS: student and organization Journey reads reject the test actor and anonymous access in the actual production build.");
} catch (error) {
  console.error(output.replaceAll(token, "[test-token-redacted]")); throw error;
} finally {
  if (server.exitCode === null) server.kill("SIGTERM");
  await closed;
}
