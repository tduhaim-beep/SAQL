import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Actor } from "../../src/identity/actor";
import { ApplicationService } from "../../src/modules/application/application/service";
import { PrismaApplicationStore, PrismaPublishedOpportunityReader } from "../../src/infrastructure/application-store";
import { database } from "../../src/infrastructure/database";
import { createSliceFixture, cleanupSliceFixture, type SliceFixture } from "../support/slice01-fixtures";

describe("Application Core real PostgreSQL isolation and audit", () => {
  let f: SliceFixture; let student: Actor; let other: Actor; let officer: Actor; let foreignOfficer: Actor;
  const client = database(); const service = new ApplicationService(new PrismaApplicationStore(client), new PrismaPublishedOpportunityReader(client));
  beforeEach(async () => {
    f = await createSliceFixture(); student = { userId: f.studentA, grants: [{ role: "STUDENT_TRAINEE" }] };
    other = { userId: f.studentB, grants: [{ role: "STUDENT_TRAINEE" }] };
    officer = { userId: f.officerA, grants: [{ role: "ORGANIZATION_TRAINING_OFFICER", organizationId: f.orgA }] };
    foreignOfficer = { userId: f.officerB, grants: [{ role: "ORGANIZATION_TRAINING_OFFICER", organizationId: f.orgB }] };
  });
  afterEach(async () => { if (f) await cleanupSliceFixture(f); });
  it("AC01/02 published-only, correct relations and atomic submit audit", async () => {
    expect((await service.publishedOpportunity(f.publishedA)).organizationId).toBe(f.orgA);
    for (const id of [f.draft, f.suspended]) await expect(service.publishedOpportunity(id)).rejects.toMatchObject({ httpStatus: 404 });
    await expect(service.submit(student, f.draft)).rejects.toMatchObject({ httpStatus: 404 });
    const a = await service.submit(student, f.publishedA);
    expect(a).toMatchObject({ studentUserId: f.studentA, opportunityId: f.publishedA, organizationId: f.orgA, status: "APPLIED" });
    expect(a.history).toHaveLength(1);
    expect(await client.auditEvent.findFirst({ where: { entityId: a.id } })).toMatchObject({ actorUserId: f.studentA, action: "Application.Submitted", metadata: { toStatus: "APPLIED" } });
  });
  it("AC03/04 + NEG01/02/03/04 scoping and roles", async () => {
    const a = await service.submit(student, f.publishedA); const b = await service.submit(other, f.publishedB);
    expect((await service.myApplications(student)).map((x) => x.id)).toEqual([a.id]);
    expect((await service.applicants(officer)).map((x) => x.id)).toEqual([a.id]);
    await expect(service.submit(null, f.publishedA)).rejects.toMatchObject({ httpStatus: 401 });
    await expect(service.myApplication(other, a.id)).rejects.toMatchObject({ httpStatus: 404 });
    await expect(service.withdraw(other, a.id)).rejects.toMatchObject({ httpStatus: 404 });
    for (const action of [() => service.beginReview(student, a.id), () => service.accept(student, a.id), () => service.reject(student, a.id, "سبب")]) await expect(action()).rejects.toMatchObject({ httpStatus: 403 });
    for (const action of [() => service.applicant(officer, b.id), () => service.beginReview(foreignOfficer, a.id), () => service.accept(foreignOfficer, a.id), () => service.reject(foreignOfficer, a.id, "سبب")]) await expect(action()).rejects.toMatchObject({ httpStatus: 404 });
    await expect(service.applicants({ userId: f.admin, grants: [{ role: "SUPER_ADMIN" }] })).rejects.toMatchObject({ httpStatus: 403 });
    expect(await client.auditEvent.count({ where: { entityId: a.id } })).toBe(1);
  });
  it("AC05/06 + NEG05/06/07 review/accept never creates journey", async () => {
    const a = await service.submit(student, f.publishedA);
    await expect(service.accept(officer, a.id)).rejects.toMatchObject({ code: "INVALID_TRANSITION" });
    await expect(service.reject(officer, a.id, "سبب")).rejects.toMatchObject({ code: "INVALID_TRANSITION" });
    expect((await service.beginReview(officer, a.id)).status).toBe("UNDER_REVIEW");
    const accepted = await service.accept(officer, a.id); expect(accepted.status).toBe("ACCEPTED");
    expect(accepted.history.map((x) => x.toStatus)).toEqual(["APPLIED", "UNDER_REVIEW", "ACCEPTED"]);
    await expect(service.withdraw(student, a.id)).rejects.toMatchObject({ code: "INVALID_TRANSITION" });
    expect(await client.trainingJourney.count({ where: { applicationId: a.id } })).toBe(0);
    expect(await client.auditEvent.findFirst({ where: { entityId: a.id, action: "Application.Accepted" } })).toMatchObject({ actorUserId: f.officerA, metadata: { fromStatus: "UNDER_REVIEW", toStatus: "ACCEPTED" } });
  });
  it("AC07 reason required, reject history retained and no extra audit on denial", async () => {
    const a = await service.submit(student, f.publishedA); await service.beginReview(officer, a.id);
    await expect(service.reject(officer, a.id, " ")).rejects.toMatchObject({ code: "REASON_REQUIRED" });
    const rejected = await service.reject(officer, a.id, "سبب رفض اصطناعي");
    expect(rejected.status).toBe("REJECTED"); expect(rejected.history.at(-1)?.rejectionReason).toBe("سبب رفض اصطناعي");
    await expect(service.withdraw(student, a.id)).rejects.toMatchObject({ code: "INVALID_TRANSITION" });
    expect(await client.application.count({ where: { id: a.id } })).toBe(1); expect(rejected.history).toHaveLength(3);
  });
  it.each([false, true])("AC08 withdraw from applied/under-review (%s) preserves record", async (review) => {
    const a = await service.submit(student, f.publishedA); if (review) await service.beginReview(officer, a.id);
    const withdrawn = await service.withdraw(student, a.id); expect(withdrawn.status).toBe("WITHDRAWN");
    expect(withdrawn.history.at(-1)?.toStatus).toBe("WITHDRAWN"); expect(await client.application.count({ where: { id: a.id } })).toBe(1);
  });
  it("NEG08 concurrent duplicate submission creates one application and one audit", async () => {
    const results = await Promise.allSettled([service.submit(student, f.publishedA), service.submit(student, f.publishedA)]);
    expect(results.filter((x) => x.status === "fulfilled")).toHaveLength(1);
    const rows = await client.application.findMany({ where: { studentUserId: f.studentA } }); expect(rows).toHaveLength(1);
    const created = rows[0]; if (!created) throw new Error("Expected one synthetic application");
    expect(await client.auditEvent.count({ where: { entityId: created.id } })).toBe(1);
    await expect(service.submit(student, f.publishedA)).rejects.toMatchObject({ code: "DUPLICATE_APPLICATION" });
  });
  it("concurrent accept/reject produces one decision with consistent audit", async () => {
    const a = await service.submit(student, f.publishedA); await service.beginReview(officer, a.id);
    const result = await Promise.allSettled([service.accept(officer, a.id), service.reject(officer, a.id, "سبب اصطناعي")]);
    expect(result.filter((x) => x.status === "fulfilled")).toHaveLength(1);
    const record = await service.myApplication(student, a.id); expect(record.history).toHaveLength(3);
    expect(record.history.at(-1)?.toStatus).toBe(record.status);
  });
  it("audit failure rolls back status in the same transaction", async () => {
    const a = await service.submit(student, f.publishedA); const store = new PrismaApplicationStore(client);
    await expect(store.transitionWithAudit({ id: a.id, scope: { organizationIds: [f.orgA] }, actorUserId: "nonexistent-synthetic-actor", command: "begin-review", expectedStatus: "APPLIED", nextStatus: "UNDER_REVIEW" })).rejects.toBeDefined();
    expect((await service.myApplication(student, a.id)).status).toBe("APPLIED"); expect(await client.auditEvent.count({ where: { entityId: a.id } })).toBe(1);
  });
});
