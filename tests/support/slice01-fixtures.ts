import { randomUUID } from "node:crypto";
import { database } from "../../src/infrastructure/database";

export async function createSliceFixture() {
  if (process.env.APP_ENV !== "test") throw new Error("Synthetic fixtures require APP_ENV=test");
  const client = database(); const prefix = `s1-${randomUUID()}`;
  const orgA = `${prefix}-org-a`; const orgB = `${prefix}-org-b`;
  const studentA = `${prefix}-student-a`; const studentB = `${prefix}-student-b`;
  const officerA = `${prefix}-officer-a`; const officerB = `${prefix}-officer-b`; const admin = `${prefix}-admin`;
  const publishedA = `${prefix}-published-a`; const publishedB = `${prefix}-published-b`;
  const draft = `${prefix}-draft`; const suspended = `${prefix}-suspended`;
  await client.$transaction(async (tx) => {
    for (const [id, label] of [[orgA, "أ"], [orgB, "ب"]] as const) {
      await tx.organization.create({ data: { id, code: id, nameAr: `جهة تدريب اصطناعية ${label}`, type: "PRIVATE", verificationStatus: "VERIFIED" } });
    }
    for (const [id, role, organizationId] of [
      [studentA, "STUDENT_TRAINEE", null], [studentB, "STUDENT_TRAINEE", null],
      [officerA, "ORGANIZATION_TRAINING_OFFICER", orgA], [officerB, "ORGANIZATION_TRAINING_OFFICER", orgB], [admin, "SUPER_ADMIN", null],
    ] as const) {
      await tx.appUser.create({ data: { id, externalSubject: `s1-test:${id}`, displayName: role === "STUDENT_TRAINEE" ? `متقدم اصطناعي ${id === studentA ? "أ" : "ب"}` : "مسؤول اصطناعي",
        email: `${id}@example.invalid`, status: "ACTIVE", roles: { create: { role, ...(organizationId !== null ? { organizationId } : {}) } } } });
    }
    for (const [id, organizationId, status] of [[publishedA, orgA, "PUBLISHED"], [publishedB, orgB, "PUBLISHED"], [draft, orgA, "DRAFT"], [suspended, orgA, "SUSPENDED"]] as const) {
      await tx.opportunity.create({ data: { id, organizationId, status, titleAr: `فرصة تدريب اصطناعية ${organizationId === orgA ? "أ" : "ب"}`,
        descriptionAr: "فرصة تدريب اصطناعية مؤهلة مسبقًا لاختبار مسار التقديم والقرار.", city: "الرياض", programType: "INDEPENDENT_SUMMER" } });
    }
  });
  return { prefix, orgA, orgB, studentA, studentB, officerA, officerB, admin, publishedA, publishedB, draft, suspended };
}

export type SliceFixture = Awaited<ReturnType<typeof createSliceFixture>>;
export async function cleanupSliceFixture(f: SliceFixture) {
  const client = database();
  await client.$transaction(async (tx) => {
    const applications = await tx.application.findMany({ where: { opportunityId: { startsWith: f.prefix } }, select: { id: true } });
    await tx.auditEvent.deleteMany({ where: { entityType: "Application", entityId: { in: applications.map((x) => x.id) } } });
    await tx.application.deleteMany({ where: { opportunityId: { startsWith: f.prefix } } });
    await tx.opportunity.deleteMany({ where: { id: { startsWith: f.prefix } } });
    await tx.appUser.deleteMany({ where: { id: { startsWith: f.prefix } } });
    await tx.organization.deleteMany({ where: { id: { in: [f.orgA, f.orgB] } } });
  });
}

export function fixtureHeaders(userId: string): Record<string, string> {
  const token = process.env.SAQL_TEST_ACTOR_TOKEN;
  if (!token) throw new Error("Test harness actor token is required");
  return { "x-saql-test-actor": userId, "x-saql-test-token": token };
}
