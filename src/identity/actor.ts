import { ApplicationError } from "../shared/application-error";

export interface Actor {
  userId: string;
  grants: ReadonlyArray<{ role: string; organizationId?: string }>;
}

export function requireStudent(actor: Actor | null): Actor {
  if (!actor) throw new ApplicationError("UNAUTHENTICATED", 401, "يلزم سياق مستخدم مصرح له.");
  if (!actor.grants.some((grant) => grant.role === "STUDENT_TRAINEE")) {
    throw new ApplicationError("FORBIDDEN", 403, "لا تملك صلاحية الطالب لهذا الإجراء.");
  }
  return actor;
}

export function officerOrganizations(actor: Actor | null): string[] {
  if (!actor) throw new ApplicationError("UNAUTHENTICATED", 401, "يلزم سياق مستخدم مصرح له.");
  const ids = actor.grants.flatMap((grant) =>
    grant.role === "ORGANIZATION_TRAINING_OFFICER" && grant.organizationId ? [grant.organizationId] : [],
  );
  if (!ids.length) throw new ApplicationError("FORBIDDEN", 403, "لا تملك صلاحية مسؤول التدريب في جهة.");
  return [...new Set(ids)];
}
