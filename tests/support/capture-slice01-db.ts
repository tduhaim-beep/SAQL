import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { database } from "../../src/infrastructure/database";
import { ApplicationService } from "../../src/modules/application/application/service";
import { PrismaApplicationStore, PrismaPublishedOpportunityReader } from "../../src/infrastructure/application-store";
import { createSliceFixture, cleanupSliceFixture } from "./slice01-fixtures";

const client = database();
const service = new ApplicationService(new PrismaApplicationStore(client), new PrismaPublishedOpportunityReader(client));
async function counts() {
  return { users: await client.appUser.count(), roles: await client.roleAssignment.count(), institutions: await client.institution.count(),
    organizations: await client.organization.count(), opportunities: await client.opportunity.count(), applications: await client.application.count(),
    audits: await client.auditEvent.count(), journeys: await client.trainingJourney.count() };
}
const before = await counts();
assert.deepEqual(before, { users: 6, roles: 6, institutions: 1, organizations: 1, opportunities: 0, applications: 0, audits: 0, journeys: 0 });
const f = await createSliceFixture();
const studentA = { userId: f.studentA, grants: [{ role: "STUDENT_TRAINEE" }] };
const studentB = { userId: f.studentB, grants: [{ role: "STUDENT_TRAINEE" }] };
const officerA = { userId: f.officerA, grants: [{ role: "ORGANIZATION_TRAINING_OFFICER", organizationId: f.orgA }] };
const officerB = { userId: f.officerB, grants: [{ role: "ORGANIZATION_TRAINING_OFFICER", organizationId: f.orgB }] };
let evidence: Record<string, unknown>;
try {
  const a = await service.submit(studentA, f.publishedA); await service.beginReview(officerA, a.id); await service.accept(officerA, a.id);
  const b = await service.submit(studentB, f.publishedA); await service.beginReview(officerA, b.id); await service.reject(officerA, b.id, "سبب رفض اصطناعي للتحقق");
  const c = await service.submit(studentA, f.publishedB); await service.withdraw(studentA, c.id);
  const d = await service.submit(studentB, f.publishedB); await service.beginReview(officerB, d.id); await service.withdraw(studentB, d.id);
  // Independent direct SQL assertions, without the application's read-model mapper.
  const rows = await client.$queryRaw<Array<{ id: string; status: string; studentUserId: string; opportunityId: string; organizationId: string; auditCount: number }>>`
    SELECT a."id", a."status"::text AS "status", a."studentUserId", a."opportunityId", o."organizationId",
      (SELECT count(*)::int FROM "AuditEvent" e WHERE e."entityType"='Application' AND e."entityId"=a."id") AS "auditCount"
    FROM "Application" a JOIN "Opportunity" o ON o."id"=a."opportunityId" ORDER BY a."createdAt"`;
  assert.deepEqual(rows.map((x) => x.status), ["ACCEPTED", "REJECTED", "WITHDRAWN", "WITHDRAWN"]);
  assert.deepEqual(rows.map((x) => x.auditCount), [3, 3, 2, 3]);
  assert.deepEqual(rows.map((x) => x.studentUserId), [f.studentA, f.studentB, f.studentA, f.studentB]);
  assert.deepEqual(rows.map((x) => x.organizationId), [f.orgA, f.orgA, f.orgB, f.orgB]);
  assert.equal(await client.trainingJourney.count(), 0);
  const audits = await client.auditEvent.findMany({ orderBy: { createdAt: "asc" }, select: { actorUserId: true, entityId: true, action: true, createdAt: true, metadata: true } });
  assert.equal(audits.length, 11);
  assert.ok(audits.every((x) => x.actorUserId && x.createdAt && x.metadata));
  evidence = { outcome: "PASS", baselineCounts: before, fixtureCounts: await counts(), directSQLApplicationRows: rows, actualBusinessAudits: audits,
    assertions: { student_opportunity_organization_relations: true, accepted_rejected_withdrawn_retained: true, audit_actor_resource_time_reason: true, no_TrainingJourney_created: true, no_canonical_seed_change: true } };
} finally { await cleanupSliceFixture(f); }
const after = await counts(); assert.deepEqual(after, before);
evidence.canonicalSeedCountsAfterCleanup = after;
const output = JSON.stringify(evidence, null, 2);
if (process.argv[2]) await writeFile(process.argv[2], output + "\n");
console.log(output);
await client.$disconnect();
