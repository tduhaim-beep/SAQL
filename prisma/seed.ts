import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  AccountStatus,
  BusinessRole,
  OrganizationType,
  VerificationStatus,
} from "../src/generated/prisma/enums";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required for the synthetic R0 seed");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const university = await prisma.institution.upsert({
    where: { code: "SYNTH-UNI" },
    update: {},
    create: { code: "SYNTH-UNI", nameAr: "جامعة تجريبية - بيانات اصطناعية" },
  });

  const organization = await prisma.organization.upsert({
    where: { code: "SYNTH-HOST" },
    update: {},
    create: {
      code: "SYNTH-HOST",
      publicSlug: "synthetic-host",
      nameAr: "جهة تدريب تجريبية",
      type: OrganizationType.PRIVATE,
      verificationStatus: VerificationStatus.VERIFIED,
    },
  });

  const users = [
    { email: "student.synthetic@example.invalid", displayName: "طالب تجريبي", role: BusinessRole.STUDENT_TRAINEE },
    { email: "org.training.synthetic@example.invalid", displayName: "مسؤول تدريب تجريبي", role: BusinessRole.ORGANIZATION_TRAINING_OFFICER, organizationId: organization.id },
    { email: "field.synthetic@example.invalid", displayName: "مشرف ميداني تجريبي", role: BusinessRole.FIELD_SUPERVISOR, organizationId: organization.id },
    { email: "university.synthetic@example.invalid", displayName: "مسؤول تدريب جامعي تجريبي", role: BusinessRole.UNIVERSITY_TRAINING_OFFICER, institutionId: university.id },
    { email: "academic.synthetic@example.invalid", displayName: "مشرف أكاديمي تجريبي", role: BusinessRole.ACADEMIC_SUPERVISOR, institutionId: university.id },
    { email: "superadmin.synthetic@example.invalid", displayName: "مدير صقل تجريبي", role: BusinessRole.SUPER_ADMIN },
  ];

  for (const item of users) {
    const user = await prisma.appUser.upsert({
      where: { email: item.email },
      update: {},
      create: {
        email: item.email,
        displayName: item.displayName,
        status: AccountStatus.ACTIVE,
      },
    });

    await prisma.roleAssignment.deleteMany({
      where: { userId: user.id, role: item.role },
    });

    await prisma.roleAssignment.create({
      data: {
        userId: user.id,
        role: item.role,
        organizationId: item.organizationId,
        institutionId: item.institutionId,
      },
    });
  }
}

main()
  .then(() => {
    console.log("Synthetic R0 seed completed");
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
