import { randomUUID } from "node:crypto";
import { Prisma, type PrismaClient } from "../generated/prisma/client";
import type { AcceptanceCoordinator } from "../modules/application/application/ports";
import { planApplicationTransition } from "../modules/application/domain/lifecycle";
import { pendingJourney } from "../modules/training-journey/domain/readiness";
import { ApplicationError } from "../shared/application-error";
import { applicationProjection, applicationView } from "./application-store";

export class PrismaAcceptanceCoordinator implements AcceptanceCoordinator {
  constructor(private readonly client: PrismaClient) {}

  async accept(input: Parameters<AcceptanceCoordinator["accept"]>[0]) {
    return this.client.$transaction(async (tx) => {
      // Scope first; denied actors cannot lock or inspect another tenant's row.
      const where = { id: input.id, opportunity: { organizationId: { in: input.organizationIds } } };
      if (!await tx.application.findFirst({ where, select: { id: true } })) {
        throw new ApplicationError("NOT_FOUND", 404, "الطلب غير متاح.");
      }
      // Serialize retries/concurrent decisions, then read the committed state.
      await tx.$queryRaw(Prisma.sql`SELECT "id" FROM "Application" WHERE "id" = ${input.id} FOR UPDATE`);
      const current = await tx.application.findFirstOrThrow({ where, include: { opportunity: true, journey: true } });
      // Keep configured program mode and links stable through the decision.
      await tx.$queryRaw(Prisma.sql`SELECT "id" FROM "Opportunity" WHERE "id" = ${current.opportunityId} FOR SHARE`);
      const opportunity = await tx.opportunity.findUniqueOrThrow({ where: { id: current.opportunityId } });
      if (!input.organizationIds.includes(opportunity.organizationId)) throw new ApplicationError("NOT_FOUND", 404, "الطلب غير متاح.");
      const decision = current.status === "ACCEPTED" ? { status: "ACCEPTED" as const } : planApplicationTransition(current.status, "accept");
      const journeyData = pendingJourney({ applicationId: current.id, traineeUserId: current.studentUserId,
        organizationId: opportunity.organizationId, opportunityId: opportunity.id,
        programType: opportunity.programType, overlayMode: opportunity.overlayMode, applicationStatus: decision.status });
      if (current.status === "ACCEPTED") {
        const j = current.journey;
        if (!j || j.status !== "PENDING_START" || j.actualStartAt !== null || j.overlayMode !== "NOT_APPLICABLE"
          || j.traineeUserId !== current.studentUserId || j.organizationId !== opportunity.organizationId
          || j.opportunityId !== opportunity.id || j.programType !== opportunity.programType) {
          // No implicit backfill or repair of earlier accepted records.
          throw new ApplicationError("INCONSISTENT_ACCEPTANCE", 409, "تعذر إعادة تأكيد القبول؛ يلزم مراجعة حالة الطلب.");
        }
      } else {
        if (current.journey) throw new ApplicationError("INCONSISTENT_ACCEPTANCE", 409, "تعذر تأكيد القبول؛ يلزم مراجعة حالة الطلب.");
        await tx.application.update({ where: { id: current.id }, data: { status: decision.status } });
        const journey = await tx.trainingJourney.create({ data: journeyData });
        const correlationId = randomUUID();
        await tx.auditEvent.create({ data: { actorUserId: input.actorUserId, action: "Application.Accepted",
          entityType: "Application", entityId: current.id,
          metadata: { fromStatus: "UNDER_REVIEW", toStatus: "ACCEPTED", correlationId, journeyId: journey.id } } });
        await tx.auditEvent.create({ data: { actorUserId: input.actorUserId, action: "TrainingJourney.CreatedFromAcceptance",
          entityType: "TrainingJourney", entityId: journey.id,
          metadata: { toStatus: "PENDING_START", correlationId, applicationId: current.id, executionActor: "System" } } });
      }
      return applicationView(await tx.application.findFirstOrThrow({ where, select: applicationProjection }));
    });
  }
}
