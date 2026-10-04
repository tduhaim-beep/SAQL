import { expect, test, type Browser, type BrowserContext, type Page, type TestInfo } from "@playwright/test";
import { createSliceFixture, cleanupSliceFixture, fixtureHeaders, type SliceFixture } from "../support/slice01-fixtures";
import { database } from "../../src/infrastructure/database";
import { writeFile } from "node:fs/promises";

const fontRequests = new WeakMap<Page, Array<{ url: string; status: number }>>();

async function actorPage(browser: Browser, baseURL: string, userId: string, contexts: BrowserContext[]) {
  const device = test.info().project.use;
  const context = await browser.newContext({ baseURL, extraHTTPHeaders: fixtureHeaders(userId),
    ...(device.viewport ? { viewport: device.viewport } : {}),
    ...(device.userAgent ? { userAgent: device.userAgent } : {}),
    ...(typeof device.deviceScaleFactor === "number" ? { deviceScaleFactor: device.deviceScaleFactor } : {}),
    ...(typeof device.isMobile === "boolean" ? { isMobile: device.isMobile } : {}),
    ...(typeof device.hasTouch === "boolean" ? { hasTouch: device.hasTouch } : {}),
  });
  contexts.push(context); const page = await context.newPage();
  const responses: Array<{ url: string; status: number }> = []; fontRequests.set(page, responses);
  page.on("response", (response) => { if (response.url().includes(".woff2")) responses.push({ url: response.url(), status: response.status() }); });
  return page;
}

async function saveEvidence(info: TestInfo, name: string, data: unknown) {
  const path = info.outputPath(name); await writeFile(path, JSON.stringify(data, null, 2));
  await info.attach(name, { path, contentType: "application/json" });
}
async function brandEvidence(page: Page, info: TestInfo, screen: string) {
  const screenId = screen.startsWith("PUB-") ? "PUB-08 / STU-D03"
    : screen.startsWith("ORG-R06") ? "ORG-R06 / ORG-R07"
    : screen.startsWith("STU-D08") ? "STU-D08" : screen;
  await expect(page.locator("main")).toHaveAttribute("data-screen-id", screenId);
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByAltText("صقل SAQL")).toBeVisible();
  const metrics = await page.evaluate(async () => {
    const rendered = [];
    for (const weight of [400, 500, 700]) {
      const faces = await document.fonts.load(`${weight} 16px Tajawal`, "صقل SAQL");
      rendered.push({ weight, loaded: faces.length > 0 && faces.every((f) => f.status === "loaded") });
    }
    return { dir: getComputedStyle(document.body).direction, fontFamily: getComputedStyle(document.body).fontFamily,
      rendered, overflow: document.documentElement.scrollWidth > window.innerWidth,
      ink: getComputedStyle(document.documentElement).getPropertyValue("--saql-ink").trim().toLowerCase(),
      blue: getComputedStyle(document.documentElement).getPropertyValue("--saql-blue").trim().toLowerCase(),
      viewport: { width: window.innerWidth, height: window.innerHeight } };
  });
  expect(metrics.dir).toBe("rtl"); expect(metrics.fontFamily).toContain("Tajawal");
  expect(metrics.rendered.every((f) => f.loaded)).toBe(true); expect(metrics.overflow).toBe(false);
  expect(metrics.ink).toBe("#142f43"); expect(metrics.blue).toBe("#2f5bea");
  await page.evaluate(async () => {
    for (const weight of [400, 500, 700]) {
      const node = document.createElement("span"); node.id = `font-probe-${weight}`; node.textContent = "صقل تدريب";
      node.style.cssText = `font-family:Tajawal;font-weight:${weight};position:fixed;inset-inline-start:-1000px;`;
      document.body.appendChild(node);
      node.getBoundingClientRect();
    }
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("DOM.enable"); await cdp.send("CSS.enable");
  const { root } = await cdp.send("DOM.getDocument");
  const fonts = [];
  for (const weight of [400, 500, 700]) {
    const { nodeId } = await cdp.send("DOM.querySelector", { nodeId: root.nodeId, selector: `#font-probe-${weight}` });
    let result = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
    await expect.poll(async () => {
      result = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
      return result.fonts.some((font) => font.isCustomFont && font.familyName.includes("Tajawal") && font.glyphCount > 0);
    }, { timeout: 5000, message: `Actual Tajawal rendering for weight ${weight} after layout` }).toBe(true);
    fonts.push({ weight, fonts: result.fonts });
  }
  await cdp.detach();
  await page.evaluate(() => document.querySelectorAll("[id^='font-probe-']").forEach((node) => node.remove()));
  const responses = fontRequests.get(page) ?? []; expect(responses.filter((x) => x.status === 200).length).toBeGreaterThanOrEqual(6);
  await saveEvidence(info, `${screen}-brand.json`, { ...metrics, actualRenderedFonts: fonts, fontResponses: responses });
  await page.screenshot({ path: info.outputPath(`${screen}.png`), fullPage: true });
}

test.describe("S1 Application Core", () => {
  let f: SliceFixture; let contexts: BrowserContext[];
  test.beforeEach(async () => { f = await createSliceFixture(); contexts = []; });
  test.afterEach(async () => { await Promise.all(contexts.map((c) => c.close())); if (f) await cleanupSliceFixture(f); });

  test("AC01-06/09 published read, student apply/status, own-org review and accept", async ({ page, browser, baseURL }, info) => {
    const base = baseURL ?? "http://127.0.0.1:3000";
    await page.goto(`/opportunities/${f.publishedA}`); await expect(page.getByRole("heading", { name: "تفاصيل الفرصة" })).toBeVisible();
    await expect(page.getByRole("link", { name: "التقديم على الفرصة", exact: true })).toHaveCount(0);
    for (const id of [f.draft, f.suspended]) expect((await page.request.get(`/api/opportunities/${id}`)).status()).toBe(404);
    const student = await actorPage(browser, base, f.studentA, contexts);
    // Inherit each project's viewport/device from its provided page, including Mobile.
    await student.setViewportSize(page.viewportSize() ?? { width: 1280, height: 720 });
    await student.goto(`/opportunities/${f.publishedA}`); await brandEvidence(student, info, "PUB-08-STU-D03");
    await student.getByRole("link", { name: "التقديم على الفرصة", exact: true }).click(); await brandEvidence(student, info, "STU-D04");
    await student.getByRole("button", { name: "تأكيد التقديم" }).click(); await expect(student).toHaveURL(/\/applications\/[^/]+$/);
    const id = new URL(student.url()).pathname.split("/").at(-1); if (!id) throw new Error("Application id missing");
    await expect(student.locator(".application-summary [data-status='APPLIED']")).toBeVisible(); await brandEvidence(student, info, "STU-D08-applied");
    await student.goto("/applications"); await expect(student.getByRole("link", { name: "فرصة تدريب اصطناعية أ" })).toBeVisible(); await brandEvidence(student, info, "STU-D07");
    const officer = await actorPage(browser, base, f.officerA, contexts); await officer.setViewportSize(page.viewportSize() ?? { width: 1280, height: 720 });
    await officer.goto("/organization/applicants"); await expect(officer.getByText("متقدم اصطناعي أ", { exact: true })).toBeVisible(); await brandEvidence(officer, info, "ORG-R05");
    await officer.getByRole("link", { name: "فرصة تدريب اصطناعية أ" }).click(); await officer.getByRole("button", { name: "بدء المراجعة" }).click();
    await expect(officer.locator(".application-summary [data-status='UNDER_REVIEW']")).toBeVisible(); await brandEvidence(officer, info, "ORG-R06-R07-review");
    await officer.getByRole("button", { name: "قبول المتقدم" }).click(); await expect(officer.locator(".application-summary [data-status='ACCEPTED']")).toBeVisible();
    await student.goto(`/applications/${id}`); await expect(student.locator(".application-summary [data-status='ACCEPTED']")).toBeVisible();
    await expect(student.getByRole("button", { name: "سحب الطلب" })).toHaveCount(0); await brandEvidence(student, info, "STU-D08-accepted");
    const db = database(); expect(await db.trainingJourney.count({ where: { applicationId: id } })).toBe(0);
    const audits = await db.auditEvent.findMany({ where: { entityId: id }, orderBy: { createdAt: "asc" } });
    expect(audits.map((x) => x.action)).toEqual(["Application.Submitted", "Application.ReviewStarted", "Application.Accepted"]);
    expect(audits.map((x) => x.actorUserId)).toEqual([f.studentA, f.officerA, f.officerA]);
    await saveEvidence(info, "DB-accept-audit.json", { applicationId: id, statuses: audits.map((x) => x.metadata), journeyCount: 0 });
  });

  test("AC07 rejection reason/history shown, no information-request action", async ({ page, browser, baseURL }, info) => {
    const base = baseURL ?? "http://127.0.0.1:3000"; const student = await actorPage(browser, base, f.studentA, contexts);
    const submitted = await student.request.post("/api/applications", { headers: { Origin: base }, data: { opportunityId: f.publishedA } }); expect(submitted.status()).toBe(201);
    const { id } = await submitted.json() as { id: string }; const officer = await actorPage(browser, base, f.officerA, contexts);
    await officer.setViewportSize(page.viewportSize() ?? { width: 1280, height: 720 });
    await officer.goto(`/organization/applicants/${id}`); await officer.getByRole("button", { name: "بدء المراجعة" }).click();
    await expect(officer.getByLabel("سبب الرفض")).toBeVisible(); await officer.getByLabel("سبب الرفض").fill("سبب رفض اصطناعي للاختبار");
    await officer.getByRole("button", { name: "رفض الطلب" }).click(); await expect(officer.locator(".application-summary [data-status='REJECTED']")).toBeVisible();
    await expect(officer.getByText("سبب الرفض: سبب رفض اصطناعي للاختبار")).toBeVisible();
    await expect(officer.getByRole("button", { name: /طلب معلومات/ })).toHaveCount(0); await brandEvidence(officer, info, "ORG-R06-R07-rejected");
    await student.goto(`/applications/${id}`); await expect(student.getByText("سبب الرفض: سبب رفض اصطناعي للاختبار")).toBeVisible();
    expect(await database().application.count({ where: { id, status: "REJECTED" } })).toBe(1);
    expect(await database().auditEvent.count({ where: { entityId: id } })).toBe(3);
  });

  test("AC08 withdraw from applied and under review retains history", async ({ page, browser, baseURL }, info) => {
    const base = baseURL ?? "http://127.0.0.1:3000"; const student = await actorPage(browser, base, f.studentA, contexts); const officer = await actorPage(browser, base, f.officerA, contexts);
    await student.setViewportSize(page.viewportSize() ?? { width: 1280, height: 720 });
    const first = await student.request.post("/api/applications", { headers: { Origin: base }, data: { opportunityId: f.publishedA } }); expect(first.status()).toBe(201);
    const { id } = await first.json() as { id: string };
    await student.goto(`/applications/${id}`); await student.getByRole("button", { name: "سحب الطلب" }).click();
    await expect(student.locator(".application-summary [data-status='WITHDRAWN']")).toBeVisible(); await brandEvidence(student, info, "STU-D08-withdrawn");
    const second = await student.request.post("/api/applications", { headers: { Origin: base }, data: { opportunityId: f.publishedB } }); expect(second.status()).toBe(201);
    const secondId = (await second.json() as { id: string }).id;
    const officerB = await actorPage(browser, base, f.officerB, contexts);
    expect((await officerB.request.post(`/api/organization/applicants/${secondId}/begin-review`, { headers: { Origin: base }, data: {} })).status()).toBe(200);
    await student.goto(`/applications/${secondId}`); await student.getByRole("button", { name: "سحب الطلب" }).click();
    await expect(student.locator(".application-summary [data-status='WITHDRAWN']")).toBeVisible();
    expect(await database().application.count({ where: { id: { in: [id, secondId] }, status: "WITHDRAWN" } })).toBe(2);
    expect(await database().auditEvent.count({ where: { entityId: { in: [id, secondId] } } })).toBe(5);
    await officer.close();
  });

  test("NEG01-08 HTTP role/resource isolation, state guards, duplicate, CSRF and mass assignment", async ({ page, browser, baseURL }, info) => {
    const base = baseURL ?? "http://127.0.0.1:3000"; const origin = { Origin: base };
    const student = await actorPage(browser, base, f.studentA, contexts); const studentB = await actorPage(browser, base, f.studentB, contexts);
    const officer = await actorPage(browser, base, f.officerA, contexts); const foreign = await actorPage(browser, base, f.officerB, contexts); const admin = await actorPage(browser, base, f.admin, contexts);
    const checks: Record<string, number> = {};
    checks.visitor = (await page.request.post("/api/applications", { headers: origin, data: { opportunityId: f.publishedA } })).status(); expect(checks.visitor).toBe(401);
    const submit = await student.request.post("/api/applications", { headers: origin, data: { opportunityId: f.publishedA } }); expect(submit.status()).toBe(201);
    const { id } = await submit.json() as { id: string };
    for (const path of [`/api/applications/${id}`, `/api/organization/applicants/${id}`]) {
      const actor = path.includes("organization") ? foreign : studentB; const result = await actor.request.get(path);
      checks[path] = result.status(); expect(result.status()).toBe(404); expect(await result.text()).not.toContain(f.studentA);
    }
    expect((await studentB.request.post(`/api/applications/${id}/withdraw`, { headers: origin, data: {} })).status()).toBe(404);
    for (const command of ["begin-review", "accept", "reject"]) {
      const data = command === "reject" ? { reason: "سبب اصطناعي" } : {};
      checks[`student-${command}`] = (await student.request.post(`/api/organization/applicants/${id}/${command}`, { headers: origin, data })).status(); expect(checks[`student-${command}`]).toBe(403);
      checks[`cross-org-${command}`] = (await foreign.request.post(`/api/organization/applicants/${id}/${command}`, { headers: origin, data })).status(); expect(checks[`cross-org-${command}`]).toBe(404);
    }
    expect((await admin.request.get("/api/organization/applicants")).status()).toBe(403);
    for (const command of ["accept", "reject"]) expect((await officer.request.post(`/api/organization/applicants/${id}/${command}`, { headers: origin, data: command === "reject" ? { reason: "سبب" } : {} })).status()).toBe(409);
    checks.duplicate = (await student.request.post("/api/applications", { headers: origin, data: { opportunityId: f.publishedA } })).status(); expect(checks.duplicate).toBe(409);
    checks.csrf = (await student.request.post(`/api/applications/${id}/withdraw`, { headers: { Origin: "https://other.example.invalid" }, data: {} })).status(); expect(checks.csrf).toBe(403);
    checks.massAssignment = (await student.request.post("/api/applications", { headers: origin, data: { opportunityId: f.publishedB, studentUserId: f.studentB, status: "ACCEPTED" } })).status(); expect(checks.massAssignment).toBe(400);
    expect((await officer.request.patch(`/api/organization/applicants/${id}`, { headers: origin, data: { status: "ACCEPTED" } })).status()).toBe(405);
    expect((await officer.request.post(`/api/organization/applicants/${id}/request-information`, { headers: origin, data: {} })).status()).toBe(404);
    expect(await database().auditEvent.count({ where: { entityId: id } })).toBe(1);
    expect((await officer.request.post(`/api/organization/applicants/${id}/begin-review`, { headers: origin, data: {} })).status()).toBe(200);
    expect((await officer.request.post(`/api/organization/applicants/${id}/accept`, { headers: origin, data: {} })).status()).toBe(200);
    checks.withdrawAfterAccepted = (await student.request.post(`/api/applications/${id}/withdraw`, { headers: origin, data: {} })).status(); expect(checks.withdrawAfterAccepted).toBe(409);
    expect(await database().application.count({ where: { opportunityId: f.publishedA, studentUserId: f.studentA } })).toBe(1);
    expect(await database().trainingJourney.count({ where: { applicationId: id } })).toBe(0);
    await saveEvidence(info, "HTTP-security-negative-evidence.json", checks);
  });
});
