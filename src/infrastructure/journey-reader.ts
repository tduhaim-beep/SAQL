import type { PrismaClient } from "../generated/prisma/client";
import type { JourneyReader, JourneyScope, JourneyView } from "../modules/training-journey/application/read";

export class PrismaJourneyReader implements JourneyReader {
  constructor(private readonly client: PrismaClient) {}
  async find(id: string, scope: JourneyScope): Promise<JourneyView | null> {
    const item = await this.client.trainingJourney.findFirst({
      where: { id, status: "PENDING_START", overlayMode: "NOT_APPLICABLE", application: { status: "ACCEPTED" }, ...("traineeUserId" in scope ? { traineeUserId: scope.traineeUserId }
        : { organizationId: { in: scope.organizationIds } }) },
      select: { id: true, createdAt: true, programType: true,
        trainee: { select: { displayName: true } }, organization: { select: { nameAr: true } },
        opportunity: { select: { titleAr: true } } },
    });
    if (!item?.opportunity) return null;
    return { id: item.id, createdAt: item.createdAt.toISOString(), programType: item.programType,
      status: "PENDING_START", studentName: item.trainee.displayName,
      organizationName: item.organization.nameAr, opportunityTitle: item.opportunity.titleAr };
  }
}
