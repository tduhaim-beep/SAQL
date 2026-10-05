import { expect, test, type Browser, type BrowserContext, type Page, type TestInfo } from "@playwright/test";
import { fixtureHeaders } from "./slice01-fixtures";
import { writeFile } from "node:fs/promises";

const fontRequests = new WeakMap<Page, Array<{ url: string; status: number }>>();

export async function actorPage(browser: Browser, baseURL: string, userId: string, contexts: BrowserContext[]) {
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

export async function saveEvidence(info: TestInfo, name: string, data: unknown) {
  const path = info.outputPath(name); await writeFile(path, JSON.stringify(data, null, 2));
  await info.attach(name, { path, contentType: "application/json" });
}
export function expectPresentation(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Expected Application presentation DTO");
  expect(Object.keys(value).sort()).toEqual(["id", "studentName", "opportunityTitle", "organizationName", "status", "createdAt", "journeyId"].sort());
}
export async function expectNoAuditScreen(page: Page) {
  await expect(page.getByRole("heading", { name: "سجل الطلب" })).toHaveCount(0);
  await expect(page.locator(".application-history")).toHaveCount(0);
  await expect(page.getByText("سبب رفض اصطناعي للاختبار", { exact: true })).toHaveCount(0);
}
export async function brandEvidence(page: Page, info: TestInfo, screen: string) {
  await expectNoAuditScreen(page);
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
