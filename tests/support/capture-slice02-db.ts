import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { database } from "../../src/infrastructure/database";
import { PrismaAcceptanceCoordinator } from "../../src/infrastructure/acceptance-coordinator";
import { PrismaApplicationStore, PrismaPublishedOpportunityReader } from "../../src/infrastructure/application-store";
import { ApplicationService } from "../../src/modules/application/application/service";
import { createSliceFixture, cleanupSliceFixture } from "./slice01-fixtures";

const client = database();
const service = new ApplicationService(new PrismaApplicationStore(client), new PrismaPublishedOpportunityReader(client), new PrismaAcceptanceCoordinator(client));
async function counts() {
  return { users: await client.appUser.count(), roles: await client.roleAssignment.count(), institutions: await client.institution.count(),
    organizations: await client.organization.count(), opportunities: await client.opportunity.count(), applications: await client.application.count(),
    journeys: await client.trainingJourney.count(), audits: await client.auditEvent.count(),
    planInstances: await client.trainingPlanInstance.count(), academicOverlays: await client.academicOverlay.count(), alignments: await client.alignment.count() };
}
const before = await counts();
assert.deepEqual(before, { users: 6, roles: 6, institutions: 1, organizations: 1, opportunities: 0, applications: 0,
  journeys: 0, audits: 0, planInstances: 0, academicOverlays: 0, alignments: 0 });
const f = await createSliceFixture(); let evidence: Record<string, unknown>;
try {
  const student = { userId: f.studentA, grants: [{ role: "STUDENT_TRAINEE" }] };
  const officer = { userId: f.officerA, grants: [{ role: "ORGANIZATION_TRAINING_OFFICER", organizationId: f.orgA }] };
  const a = await service.submit(student, f.publishedA); await service.beginReview(officer, a.id);
  const concurrent = await Promise.all(Array.from({ length: 8 }, () => service.accept(officer, a.id)));
  const retried = await service.accept(officer, a.id);
  assert.ok(retried.journeyId); assert.ok(concurrent.every((x) => x.journeyId === retried.journeyId && x.status === "ACCEPTED"));
  // Direct PostgreSQL assertions independently join persisted records.
  const rows = await client.$queryRaw<Array<{ applicationId: string; applicationStatus: string; journeyId: string; journeyStatus: string;
    studentUserId: string; traineeUserId: string; applicationOpportunityId: string; journeyOpportunityId: string;
    hostOrganizationId: string; journeyOrganizationId: string; opportunityProgramType: string; journeyProgramType: string;
    overlayMode: string; actualStartAt: Date | null; planCount: number; overlayCount: number; alignmentCount: number }>>`
    SELECT a."id" AS "applicationId", a."status"::text AS "applicationStatus", j."id" AS "journeyId", j."status"::text AS "journeyStatus",
      a."studentUserId", j."traineeUserId", a."opportunityId" AS "applicationOpportunityId", j."opportunityId" AS "journeyOpportunityId",
      o."organizationId" AS "hostOrganizationId", j."organizationId" AS "journeyOrganizationId",
      o."programType"::text AS "opportunityProgramType", j."programType"::text AS "journeyProgramType", j."overlayMode"::text AS "overlayMode", j."actualStartAt",
      (SELECT count(*)::int FROM "TrainingPlanInstance" p WHERE p."journeyId"=j."id") AS "planCount",
      (SELECT count(*)::int FROM "AcademicOverlay" p WHERE p."journeyId"=j."id") AS "overlayCount",
      (SELECT count(*)::int FROM "Alignment" p WHERE p."journeyId"=j."id") AS "alignmentCount"
    FROM "Application" a JOIN "Opportunity" o ON o."id"=a."opportunityId" JOIN "TrainingJourney" j ON j."applicationId"=a."id"
    WHERE a."id"=${a.id}`;
  assert.equal(rows.length, 1); const row = rows[0]; assert.ok(row);
  assert.equal(row.applicationStatus, "ACCEPTED"); assert.equal(row.journeyStatus, "PENDING_START");
  assert.equal(row.studentUserId, f.studentA); assert.equal(row.traineeUserId, row.studentUserId);
  assert.equal(row.applicationOpportunityId, f.publishedA); assert.equal(row.journeyOpportunityId, row.applicationOpportunityId);
  assert.equal(row.hostOrganizationId, f.orgA); assert.equal(row.journeyOrganizationId, row.hostOrganizationId);
  assert.equal(row.opportunityProgramType, "INDEPENDENT_SUMMER"); assert.equal(row.journeyProgramType, row.opportunityProgramType);
  assert.equal(row.overlayMode, "NOT_APPLICABLE"); assert.equal(row.actualStartAt, null);
  assert.equal(row.planCount + row.overlayCount + row.alignmentCount, 0);
  const audits = await client.auditEvent.findMany({ where: { OR: [{ entityType: "Application", entityId: a.id }, { entityType: "TrainingJourney", entityId: row.journeyId }] }, orderBy: { createdAt: "asc" } });
  assert.equal(audits.length, 4); const decision = audits.find((x) => x.action === "Application.Accepted");
  const creation = audits.find((x) => x.action === "TrainingJourney.CreatedFromAcceptance"); assert.ok(decision); assert.ok(creation);
  const d = decision.metadata as Record<string, unknown>; const c = creation.metadata as Record<string, unknown>;
  assert.ok(d.correlationId); assert.equal(d.correlationId, c.correlationId);
  assert.equal(decision.actorUserId, f.officerA); assert.equal(creation.actorUserId, f.officerA);
  assert.equal(await client.roleAssignment.count({ where: { organizationId: f.orgA, role: "FIELD_SUPERVISOR" } }), 0);
  evidence = { outcome: "PASS", baselineCounts: before, directSQLRows: rows, correlatedAudits: audits,
    concurrentAccepts: 8, sequentialRetries: 1, distinctJourneyIds: [...new Set(concurrent.map((x) => x.journeyId))],
    assertions: { exactly_one_journey: true, all_links_match: true, pending_not_actual_start: true,
      no_plan_supervisor_academic_alignment: true, actor_resource_time_correlation: true, retry_does_not_duplicate_audit: true } };
} finally { await cleanupSliceFixture(f); }
const after = await counts(); assert.deepEqual(after, before);
evidence.canonicalSeedCountsAfterCleanup = after;
const output = JSON.stringify(evidence, null, 2);
if (process.argv[2]) await writeFile(process.argv[2], output + "\n");
console.log(output); await client.$disconnect();
