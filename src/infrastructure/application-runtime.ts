import type { Actor } from "../identity/actor";
import { resolveTestActor } from "../identity/test-actor";
import { ApplicationService } from "../modules/application/application/service";
import { database } from "./database";
import { PrismaApplicationStore, PrismaPublishedOpportunityReader } from "./application-store";

export function applicationService() {
  return new ApplicationService(new PrismaApplicationStore(database()), new PrismaPublishedOpportunityReader(database()));
}

export function actorFromHeaders(headers: Headers): Promise<Actor | null> {
  return resolveTestActor(headers, { nodeEnvironment: process.env.NODE_ENV, appEnvironment: process.env.APP_ENV,
    enabled: process.env.SAQL_ENABLE_TEST_ACTOR_ADAPTER, token: process.env.SAQL_TEST_ACTOR_TOKEN }, async (id) => {
    const user = await database().appUser.findFirst({ where: { id, status: "ACTIVE", externalSubject: { startsWith: "s1-test:" } },
      select: { id: true, email: true, roles: { select: { role: true, organizationId: true } } } });
    if (!user?.email?.endsWith("@example.invalid")) return null;
    return { userId: user.id, grants: user.roles.map((grant) => ({ role: grant.role,
      ...(grant.organizationId !== null ? { organizationId: grant.organizationId } : {}) })) };
  });
}
