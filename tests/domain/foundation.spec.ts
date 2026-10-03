import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function enumValues(schema: string, name: string) {
  const match = schema.match(new RegExp(`enum\\s+${name}\\s*\\{([^}]*)\\}`, "m"));
  if (!match) throw new Error(`Missing enum ${name}`);
  const body = match[1];
  if (body === undefined) throw new Error(`Missing enum body ${name}`);
  return body.split(/\s+/).filter(Boolean);
}

describe("state model foundation", () => {
  it("uses current application, journey, plan, task and alignment state names", () => {
    const schema = readFileSync("prisma/schema.prisma", "utf8");
    expect(enumValues(schema, "ApplicationStatus")).toEqual(["APPLIED","UNDER_REVIEW","MORE_INFO_REQUIRED","ACCEPTED","REJECTED","WITHDRAWN"]);
    expect(enumValues(schema, "TrainingJourneyStatus")).toEqual(["PENDING_START","ACTIVE","ON_HOLD","COMPLETION_PENDING","COMPLETED","WITHDRAWN","TERMINATED"]);
    expect(enumValues(schema, "PlanInstanceStatus")).toEqual(["ASSIGNED","ACTIVE","COMPLETION_PENDING","COMPLETED","CANCELLED"]);
    expect(enumValues(schema, "TrainingTaskStatus")).toEqual(["NOT_STARTED","IN_PROGRESS","SUBMITTED","REVISION_REQUIRED","COMPLETED","CANCELLED"]);
    expect(enumValues(schema, "AlignmentStatus")).toEqual(["DRAFT","IN_REVIEW","ADJUSTMENT_REQUESTED","APPROVED","APPROVED_WITH_SUPPLEMENT","REJECTED"]);
  });
});
