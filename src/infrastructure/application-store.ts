import { Prisma, type PrismaClient } from "../generated/prisma/client";
import type { ApplicationScope, ApplicationStore, ApplicationView } from "../modules/application/application/ports";
import type { ApplicationStatus } from "../modules/application/domain/lifecycle";
import type { PublishedOpportunityReader } from "../modules/opportunity/application/read";
import { ApplicationError } from "../shared/application-error";

const projection = {
  id: true, studentUserId: true, opportunityId: true, status: true, createdAt: true,
  student: { select: { displayName: true } },
  opportunity: { select: { titleAr: true, organizationId: true, organization: { select: { nameAr: true } } } },
} satisfies Prisma.ApplicationSelect;

function scopeWhere(scope: ApplicationScope): Prisma.ApplicationWhereInput {
  return "studentUserId" in scope ? { studentUserId: scope.studentUserId }
    : { opportunity: { organizationId: { in: scope.organizationIds } } };
}

type Session = PrismaClient | Prisma.TransactionClient;
async function view(session: Session, item: Prisma.ApplicationGetPayload<{ select: typeof projection }>): Promise<ApplicationView> {
  const events = await session.auditEvent.findMany({
    where: { entityType: "Application", entityId: item.id }, orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: { action: true, createdAt: true, metadata: true },
  });
  return {
    id: item.id, studentUserId: item.studentUserId, studentName: item.student.displayName,
    opportunityId: item.opportunityId, opportunityTitle: item.opportunity.titleAr,
    organizationId: item.opportunity.organizationId, organizationName: item.opportunity.organization.nameAr,
    status: item.status, createdAt: item.createdAt.toISOString(),
    history: events.map((event) => {
      const metadata = event.metadata as { fromStatus?: ApplicationStatus; toStatus: ApplicationStatus; rejectionReason?: string };
      return { action: event.action, createdAt: event.createdAt.toISOString(), fromStatus: metadata.fromStatus ?? null,
        toStatus: metadata.toStatus, rejectionReason: metadata.rejectionReason ?? null };
    }),
  };
}

export class PrismaPublishedOpportunityReader implements PublishedOpportunityReader {
  constructor(private readonly client: PrismaClient) {}
  async findPublished(id: string) {
    const item = await this.client.opportunity.findFirst({ where: { id, status: "PUBLISHED" },
      select: { id: true, organizationId: true, titleAr: true, descriptionAr: true, city: true, programType: true,
        startsAt: true, endsAt: true, organization: { select: { nameAr: true } } } });
    return item ? { id: item.id, organizationId: item.organizationId, organizationName: item.organization.nameAr,
      titleAr: item.titleAr, descriptionAr: item.descriptionAr, city: item.city, programType: item.programType,
      startsAt: item.startsAt?.toISOString() ?? null, endsAt: item.endsAt?.toISOString() ?? null } : null;
  }
}

export class PrismaApplicationStore implements ApplicationStore {
  constructor(private readonly client: PrismaClient) {}
  async list(scope: ApplicationScope) {
    const items = await this.client.application.findMany({ where: scopeWhere(scope), select: projection, orderBy: { createdAt: "desc" } });
    return Promise.all(items.map((item) => view(this.client, item)));
  }
  async find(id: string, scope: ApplicationScope) {
    const item = await this.client.application.findFirst({ where: { id, ...scopeWhere(scope) }, select: projection });
    return item ? view(this.client, item) : null;
  }
  async submitWithAudit(studentUserId: string, opportunityId: string) {
    try {
      return await this.client.$transaction(async (tx) => {
        // Hold a shared opportunity row lock through commit, so its PUBLISHED guard
        // cannot change between validation and application creation.
        const available = await tx.$queryRaw<Array<{ id: string }>>(Prisma.sql`
          SELECT "id" FROM "Opportunity" WHERE "id" = ${opportunityId}
          AND "status" = 'PUBLISHED' FOR SHARE`);
        if (!available.length) throw new ApplicationError("NOT_FOUND", 404, "الفرصة غير متاحة.");
        const item = await tx.application.create({ data: { studentUserId, opportunityId, status: "APPLIED" }, select: projection });
        await tx.auditEvent.create({ data: { actorUserId: studentUserId, action: "Application.Submitted", entityType: "Application", entityId: item.id, metadata: { toStatus: "APPLIED" } } });
        return view(tx, item);
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ApplicationError("DUPLICATE_APPLICATION", 409, "لديك طلب سابق لهذه الفرصة.");
      }
      throw error;
    }
  }
  async transitionWithAudit(input: Parameters<ApplicationStore["transitionWithAudit"]>[0]) {
    return this.client.$transaction(async (tx) => {
      const changed = await tx.application.updateMany({
        where: { id: input.id, status: input.expectedStatus, ...scopeWhere(input.scope) }, data: { status: input.nextStatus },
      });
      if (changed.count !== 1) throw new ApplicationError("CONCURRENT_CHANGE", 409, "تغير الطلب؛ حدّث الصفحة قبل المحاولة.");
      const action = { "begin-review": "Application.ReviewStarted", accept: "Application.Accepted", reject: "Application.Rejected", withdraw: "Application.Withdrawn" }[input.command];
      await tx.auditEvent.create({ data: { actorUserId: input.actorUserId, action, entityType: "Application", entityId: input.id,
        metadata: { fromStatus: input.expectedStatus, toStatus: input.nextStatus,
          ...(input.rejectionReason !== undefined ? { rejectionReason: input.rejectionReason } : {}) } } });
      const item = await tx.application.findFirstOrThrow({ where: { id: input.id, ...scopeWhere(input.scope) }, select: projection });
      return view(tx, item);
    });
  }
}
