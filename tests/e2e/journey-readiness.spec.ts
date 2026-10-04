import { expect, test, type BrowserContext } from "@playwright/test";
import { database } from "../../src/infrastructure/database";
import { createSliceFixture, cleanupSliceFixture, type SliceFixture } from "../support/slice01-fixtures";
import { actorPage, brandEvidence, expectPresentation, saveEvidence } from "../support/browser-evidence";

test.describe("S2 acceptance to pending Journey", () => {
  let f: SliceFixture; let contexts: BrowserContext[];
  test.beforeEach(async () => { f = await createSliceFixture(); contexts = []; });
  test.afterEach(async () => { await Promise.all(contexts.map((x) => x.close())); if (f) await cleanupSliceFixture(f); });

  test("AC-S2-01..05/09 accepted application navigates to own pending Journey in both roles", async ({ browser, baseURL }, info) => {
    const base = baseURL ?? "http://127.0.0.1:3000"; const origin = { Origin: base };
    const student = await actorPage(browser, base, f.studentA, contexts);
    const officer = await actorPage(browser, base, f.officerA, contexts);
    const submitted = await student.request.post("/api/applications", { headers: origin, data: { opportunityId: f.publishedA } });
    expect(submitted.status()).toBe(201); const { id } = await submitted.json() as { id: string };
    expect((await officer.request.post(`/api/organization/applicants/${id}/begin-review`, { headers: origin, data: {} })).status()).toBe(200);
    await officer.goto(`/organization/applicants/${id}`); await officer.getByRole("button", { name: "قبول المتقدم" }).click();
    await expect(officer.locator(".application-summary [data-status='ACCEPTED']")).toBeVisible();
    await expect(officer.getByText("أُنشئت رحلة التدريب وهي بانتظار البدء. قبول الطلب لا يعني بدء التدريب.")).toBeVisible();
    await expect(officer.getByRole("button", { name: "قبول المتقدم" })).toHaveCount(0);
    await brandEvidence(officer, info, "ORG-R06-R07-accepted");
    await officer.getByRole("link", { name: "عرض رحلة التدريب" }).click();
    await expect(officer).toHaveURL(/\/organization\/journeys\/[^/]+$/);
    await expect(officer.locator("[data-status='PENDING_START']")).toHaveText("بانتظار بدء التدريب");
    await expect(officer.getByText("تم قبول الطلب وإنشاء الرحلة. التدريب لم يبدأ بعد.")).toBeVisible();
    await expect(officer.locator("main").getByRole("button")).toHaveCount(0); await brandEvidence(officer, info, "ORG-O02");
    await student.goto(`/applications/${id}`); await brandEvidence(student, info, "STU-D08-accepted-bridge");
    await student.getByRole("link", { name: "عرض رحلة التدريب" }).click();
    await expect(student).toHaveURL(/\/journeys\/[^/]+$/); await expect(student.locator("[data-status='PENDING_START']")).toHaveText("بانتظار بدء التدريب");
    await expect(student.getByText("تم قبول الطلب وإنشاء الرحلة. التدريب لم يبدأ بعد.")).toBeVisible();
    await expect(student.locator("main").getByRole("button")).toHaveCount(0); await brandEvidence(student, info, "STU-T01");
    const j = await database().trainingJourney.findUniqueOrThrow({ where: { applicationId: id }, include: { planInstance: true, academicOverlay: true } });
    expect(j).toMatchObject({ status: "PENDING_START", actualStartAt: null, planInstance: null, academicOverlay: null,
      traineeUserId: f.studentA, organizationId: f.orgA, opportunityId: f.publishedA, programType: "INDEPENDENT_SUMMER" });
    await saveEvidence(info, "S2-positive-persisted-journey.json", { applicationId: id, journey: j, acceptButtonRemoved: true, noTrainingStartActions: true });
  });

  test("AC-S2-06/08 + NEG-S2-02/03/04/06/07/08 HTTP retries, scope, minimized DTO and unsupported mutations", async ({ page, browser, baseURL }, info) => {
    const base = baseURL ?? "http://127.0.0.1:3000"; const origin = { Origin: base };
    const student = await actorPage(browser, base, f.studentA, contexts); const other = await actorPage(browser, base, f.studentB, contexts);
    const officer = await actorPage(browser, base, f.officerA, contexts); const foreign = await actorPage(browser, base, f.officerB, contexts);
    const admin = await actorPage(browser, base, f.admin, contexts);
    const submitted = await student.request.post("/api/applications", { headers: origin, data: { opportunityId: f.publishedA } });
    const { id } = await submitted.json() as { id: string };
    expect((await officer.request.post(`/api/organization/applicants/${id}/begin-review`, { headers: origin, data: {} })).status()).toBe(200);
    const accepted = await Promise.all(Array.from({ length: 4 }, () => officer.request.post(`/api/organization/applicants/${id}/accept`, { headers: origin, data: {} })));
    for (const response of accepted) expect(response.status()).toBe(200);
    const results: Array<{ journeyId: string }> = [];
    for (const response of accepted) { const dto: unknown = await response.json(); expectPresentation(dto); results.push(dto as { journeyId: string }); }
    expect(new Set(results.map((x) => x.journeyId)).size).toBe(1); const journeyId = results[0]?.journeyId; if (!journeyId) throw new Error("Journey expected");
    const repeated = await officer.request.post(`/api/organization/applicants/${id}/accept`, { headers: origin, data: {} });
    expect(repeated.status()).toBe(200); expect((await repeated.json() as { journeyId: string }).journeyId).toBe(journeyId);
    const ownPath = `/api/journeys/${journeyId}`; const orgPath = `/api/organization/journeys/${journeyId}`;
    const checks: Record<string, number> = {};
    for (const [key, actor, path, status] of [
      ["ownStudent", student, ownPath, 200], ["ownOrganization", officer, orgPath, 200],
      ["crossStudent", other, ownPath, 404], ["crossOrganization", foreign, orgPath, 404],
      ["studentAsOfficer", student, orgPath, 403], ["officerAsStudent", officer, ownPath, 403],
      ["adminAsOfficer", admin, orgPath, 403], ["anonymous", page, ownPath, 401],
    ] as const) {
      const response = await actor.request.get(path); checks[key] = response.status(); expect(response.status()).toBe(status);
      const text = await response.text();
      for (const privateValue of [f.studentA, f.orgA, id, "correlationId", "metadata", "AuditEvent"]) expect(text).not.toContain(privateValue);
      if (status === 200) expect(Object.keys(JSON.parse(text)).sort()).toEqual(["id", "studentName", "opportunityTitle", "organizationName", "programType", "status", "createdAt"].sort());
    }
    checks.directStudentCreate = (await student.request.post(ownPath, { headers: origin, data: { status: "PENDING_START", applicationId: id } })).status(); expect(checks.directStudentCreate).toBe(405);
    checks.directOfficerCreate = (await officer.request.post(orgPath, { headers: origin, data: {} })).status(); expect(checks.directOfficerCreate).toBe(405);
    checks.genericStatus = (await officer.request.patch(orgPath, { headers: origin, data: { status: "ACTIVE" } })).status(); expect(checks.genericStatus).toBe(405);
    for (const command of ["start", "activate", "confirm-actual-start"]) expect((await officer.request.post(`${orgPath}/${command}`, { headers: origin, data: {} })).status()).toBe(404);
    checks.massAssignment = (await officer.request.post(`/api/organization/applicants/${id}/accept`, { headers: origin, data: { overlayMode: "NOT_APPLICABLE", status: "ACTIVE", organizationId: f.orgB } })).status(); expect(checks.massAssignment).toBe(400);
    checks.crossOrgRetry = (await foreign.request.post(`/api/organization/applicants/${id}/accept`, { headers: origin, data: {} })).status(); expect(checks.crossOrgRetry).toBe(404);
    await other.goto(`/journeys/${journeyId}`); await expect(other.getByText("فرصة تدريب اصطناعية أ", { exact: true })).toHaveCount(0);
    await foreign.goto(`/organization/journeys/${journeyId}`); await expect(foreign.getByText("متقدم اصطناعي أ", { exact: true })).toHaveCount(0);
    expect(await database().trainingJourney.count({ where: { applicationId: id } })).toBe(1);
    expect(await database().auditEvent.count({ where: { entityId: id, action: "Application.Accepted" } })).toBe(1);
    expect(await database().auditEvent.count({ where: { entityId: journeyId, action: "TrainingJourney.CreatedFromAcceptance" } })).toBe(1);
    expect((await database().trainingJourney.findUniqueOrThrow({ where: { id: journeyId } })).actualStartAt).toBeNull();
    await saveEvidence(info, "S2-HTTP-security-concurrency.json", { checks, concurrentAccepts: 4, sequentialRetry: true, distinctJourneyIds: [journeyId], duplicateAudits: false });
  });

  test("NEG-S2-01/05 invalid acceptance and academic Required/Optional fail closed", async ({ browser, baseURL }, info) => {
    const base = baseURL ?? "http://127.0.0.1:3000"; const origin = { Origin: base };
    const student = await actorPage(browser, base, f.studentA, contexts); const officer = await actorPage(browser, base, f.officerA, contexts);
    const checks = [];
    for (const [opportunityId, overlayMode] of [[f.publishedA, "REQUIRED"], [f.draft, "OPTIONAL"]] as const) {
      await database().opportunity.update({ where: { id: opportunityId }, data: { status: "PUBLISHED", overlayMode, programType: "COOPERATIVE_ACADEMIC" } });
      const submitted = await student.request.post("/api/applications", { headers: origin, data: { opportunityId } }); expect(submitted.status()).toBe(201);
      const { id } = await submitted.json() as { id: string };
      expect((await officer.request.post(`/api/organization/applicants/${id}/accept`, { headers: origin, data: {} })).status()).toBe(409);
      expect((await officer.request.post(`/api/organization/applicants/${id}/begin-review`, { headers: origin, data: {} })).status()).toBe(200);
      const denied = await officer.request.post(`/api/organization/applicants/${id}/accept`, { headers: origin, data: {} });
      expect(denied.status()).toBe(409); expect((await denied.json() as { code: string }).code).toBe("UNSUPPORTED_ACADEMIC_PATH");
      expect((await database().application.findUniqueOrThrow({ where: { id } })).status).toBe("UNDER_REVIEW");
      expect(await database().trainingJourney.count({ where: { applicationId: id } })).toBe(0);
      expect(await database().auditEvent.count({ where: { entityId: id } })).toBe(2);
      checks.push({ overlayMode, denied: 409, status: "UNDER_REVIEW", journeyCount: 0 });
    }
    await saveEvidence(info, "S2-academic-path-denials.json", checks);
  });
});
