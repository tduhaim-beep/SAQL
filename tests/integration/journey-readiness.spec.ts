import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Actor } from "../../src/identity/actor";
import { PrismaAcceptanceCoordinator } from "../../src/infrastructure/acceptance-coordinator";
import type { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaApplicationStore, PrismaPublishedOpportunityReader } from "../../src/infrastructure/application-store";
import { database } from "../../src/infrastructure/database";
import { PrismaJourneyReader } from "../../src/infrastructure/journey-reader";
import { ApplicationService } from "../../src/modules/application/application/service";
import { JourneyService } from "../../src/modules/training-journey/application/read";
import { createSliceFixture, cleanupSliceFixture, type SliceFixture } from "../support/slice01-fixtures";

describe("S2 real PostgreSQL atomic acceptance bridge", () => {
  const client = database();
  const coordinator = new PrismaAcceptanceCoordinator(client);
  const service = new ApplicationService(new PrismaApplicationStore(client), new PrismaPublishedOpportunityReader(client), coordinator);
  const reader = new JourneyService(new PrismaJourneyReader(client));
  let f: SliceFixture; let student: Actor; let other: Actor; let officer: Actor; let foreign: Actor;
  beforeEach(async () => {
    f = await createSliceFixture(); student = { userId: f.studentA, grants: [{ role: "STUDENT_TRAINEE" }] };
    other = { userId: f.studentB, grants: [{ role: "STUDENT_TRAINEE" }] };
    officer = { userId: f.officerA, grants: [{ role: "ORGANIZATION_TRAINING_OFFICER", organizationId: f.orgA }] };
    foreign = { userId: f.officerB, grants: [{ role: "ORGANIZATION_TRAINING_OFFICER", organizationId: f.orgB }] };
  });
  afterEach(async () => { if (f) await cleanupSliceFixture(f); });
  async function reviewing() {
    const a = await service.submit(student, f.publishedA); await service.beginReview(officer, a.id); return a.id;
  }
  async function unchanged(id: string) {
    expect((await client.application.findUniqueOrThrow({ where: { id } })).status).toBe("UNDER_REVIEW");
    expect(await client.trainingJourney.count({ where: { applicationId: id } })).toBe(0);
    expect(await client.auditEvent.count({ where: { entityId: id } })).toBe(2);
  }
  it("AC-S2-01/02/05/08 persists correct links, pending only and correlated audit", async () => {
    const id = await reviewing(); const accepted = await service.accept(officer, id);
    expect(accepted.status).toBe("ACCEPTED"); expect(accepted.journeyId).toBeTruthy();
    const journey = await client.trainingJourney.findUniqueOrThrow({ where: { applicationId: id }, include: { planInstance: true, academicOverlay: true, alignment: true } });
    expect(journey).toMatchObject({ traineeUserId: f.studentA, organizationId: f.orgA, opportunityId: f.publishedA,
      programType: "INDEPENDENT_SUMMER", overlayMode: "NOT_APPLICABLE", status: "PENDING_START",
      actualStartAt: null, actualEndAt: null, expectedStartAt: null, planInstance: null, academicOverlay: null, alignment: null });
    const decision = await client.auditEvent.findFirstOrThrow({ where: { entityId: id, action: "Application.Accepted" } });
    const creation = await client.auditEvent.findFirstOrThrow({ where: { entityId: journey.id, action: "TrainingJourney.CreatedFromAcceptance" } });
    expect(decision.actorUserId).toBe(f.officerA); expect(creation.actorUserId).toBe(f.officerA);
    expect(decision.metadata).toMatchObject({ fromStatus: "UNDER_REVIEW", toStatus: "ACCEPTED", journeyId: journey.id });
    expect(creation.metadata).toMatchObject({ toStatus: "PENDING_START", applicationId: id, executionActor: "System" });
    const d = decision.metadata as Record<string, unknown>; const c = creation.metadata as Record<string, unknown>;
    expect(d.correlationId).toMatch(/^[0-9a-f-]{36}$/); expect(c.correlationId).toBe(d.correlationId);
    expect(decision.createdAt).toBeInstanceOf(Date); expect(creation.createdAt).toBeInstanceOf(Date);
    expect(await client.roleAssignment.count({ where: { organizationId: f.orgA, role: "FIELD_SUPERVISOR" } })).toBe(0);
  });
  it("AC-S2-03/04 + NEG-S2-02/03/04 role and resource scope precede presentation", async () => {
    const id = await reviewing(); const accepted = await service.accept(officer, id);
    if (!accepted.journeyId) throw new Error("Journey expected");
    const own = await reader.own(student, accepted.journeyId); const org = await reader.organization(officer, accepted.journeyId);
    expect(own).toEqual(org); expect(own.status).toBe("PENDING_START");
    expect(Object.keys(own).sort()).toEqual(["id", "studentName", "opportunityTitle", "organizationName", "programType", "status", "createdAt"].sort());
    for (const privateValue of [f.studentA, f.orgA, id, "correlationId", "metadata", "history"]) expect(JSON.stringify(own)).not.toContain(privateValue);
    await expect(reader.own(other, own.id)).rejects.toMatchObject({ httpStatus: 404 });
    await expect(reader.organization(foreign, own.id)).rejects.toMatchObject({ httpStatus: 404 });
    await expect(reader.organization(student, own.id)).rejects.toMatchObject({ httpStatus: 403 });
    await expect(reader.own(officer, own.id)).rejects.toMatchObject({ httpStatus: 403 });
    await expect(reader.own(null, own.id)).rejects.toMatchObject({ httpStatus: 401 });
    await expect(reader.organization({ userId: f.admin, grants: [{ role: "SUPER_ADMIN" }] }, own.id)).rejects.toMatchObject({ httpStatus: 403 });
    await expect(service.accept(foreign, id)).rejects.toMatchObject({ httpStatus: 404 });
    await expect(service.accept(student, id)).rejects.toMatchObject({ httpStatus: 403 });
  });
  it("AC-S2-06 + NEG-S2-08 concurrent accept and sequential retry return one consistent resource", async () => {
    const id = await reviewing(); const results = await Promise.all(Array.from({ length: 8 }, () => service.accept(officer, id)));
    expect(new Set(results.map((x) => x.journeyId)).size).toBe(1);
    expect(results.every((x) => x.status === "ACCEPTED" && x.journeyId)).toBe(true);
    expect(await service.accept(officer, id)).toEqual(results[0]);
    expect(await client.trainingJourney.count({ where: { applicationId: id } })).toBe(1);
    expect(await client.auditEvent.count({ where: { entityId: id, action: "Application.Accepted" } })).toBe(1);
    expect(await client.auditEvent.count({ where: { entityId: results[0]?.journeyId ?? "missing", action: "TrainingJourney.CreatedFromAcceptance" } })).toBe(1);
  });
  it("AC-S2-07 journey persistence failure rolls back an already-issued acceptance write", async () => {
    const id = await reviewing();
    const failing = client.$extends({ query: { trainingJourney: { create: async () => { throw new Error("Synthetic journey persistence failure"); } } } });
    // Prisma 7 query-extension clients preserve the real transaction at runtime,
    // but their generated overloads omit the base client's event API. This
    // test-only bridge injects persistence failure; production uses PrismaClient.
    await expect(new PrismaAcceptanceCoordinator(failing as unknown as PrismaClient).accept({ id, organizationIds: [f.orgA], actorUserId: f.officerA })).rejects.toThrow("Synthetic journey persistence failure");
    await unchanged(id);
    expect((await service.accept(officer, id)).journeyId).toBeTruthy();
  });
  it.each(["Application.Accepted", "TrainingJourney.CreatedFromAcceptance"])("AC-S2-07/08 audit failure at %s rolls back decision and journey", async (action) => {
    const id = await reviewing();
    const failing = client.$extends({ query: { auditEvent: { create: async ({ args, query }) => {
      if (args.data.action === action) throw new Error("Synthetic audit persistence failure");
      return query(args);
    } } } });
    await expect(new PrismaAcceptanceCoordinator(failing as unknown as PrismaClient).accept({ id, organizationIds: [f.orgA], actorUserId: f.officerA })).rejects.toThrow("Synthetic audit persistence failure");
    await unchanged(id);
  });
  it("AC-S2-07 real audit foreign-key failure rolls back decision and journey", async () => {
    const id = await reviewing();
    await expect(coordinator.accept({ id, organizationIds: [f.orgA], actorUserId: "nonexistent-synthetic-actor" })).rejects.toBeDefined();
    await unchanged(id);
  });
  it.each(["REQUIRED", "OPTIONAL"] as const)("NEG-S2-05 configured academic %s rejects acceptance atomically", async (overlayMode) => {
    await client.opportunity.update({ where: { id: f.publishedA }, data: { overlayMode, programType: "COOPERATIVE_ACADEMIC" } });
    const id = await reviewing(); await expect(service.accept(officer, id)).rejects.toMatchObject({ code: "UNSUPPORTED_ACADEMIC_PATH", httpStatus: 409 });
    await unchanged(id);
    expect(await client.academicOverlay.count({ where: { journey: { opportunityId: f.publishedA } } })).toBe(0);
  });
  it("NEG-S2-01/07 invalid commands cannot bypass the acceptance coordinator", async () => {
    const applied = await service.submit(student, f.publishedA);
    await expect(service.accept(officer, applied.id)).rejects.toMatchObject({ code: "INVALID_TRANSITION" });
    const store = new PrismaApplicationStore(client);
    await expect(store.transitionWithAudit({ id: applied.id, scope: { organizationIds: [f.orgA] }, actorUserId: f.officerA,
      command: "begin-review", expectedStatus: "APPLIED", nextStatus: "ACCEPTED" })).rejects.toMatchObject({ code: "INVALID_TRANSITION" });
    expect(await client.trainingJourney.count({ where: { applicationId: applied.id } })).toBe(0);
    expect((await service.myApplication(student, applied.id)).status).toBe("APPLIED");
  });
  it("does not backfill baseline accepted records or silently repair inconsistent links", async () => {
    const id = await reviewing(); await client.application.update({ where: { id }, data: { status: "ACCEPTED" } });
    await expect(service.accept(officer, id)).rejects.toMatchObject({ code: "INCONSISTENT_ACCEPTANCE" });
    expect(await client.trainingJourney.count({ where: { applicationId: id } })).toBe(0);
  });
});
