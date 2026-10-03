-- CreateEnum
CREATE TYPE "BusinessRole" AS ENUM ('SUPER_ADMIN', 'OPERATIONS_ADMIN', 'VERIFICATION_ADMIN', 'MODERATION_ADMIN', 'SUPPORT_ADMIN', 'SECURITY_COMPLIANCE_ADMIN', 'STUDENT_TRAINEE', 'ORGANIZATION_ADMIN', 'ORGANIZATION_TRAINING_OFFICER', 'FIELD_SUPERVISOR', 'UNIVERSITY_TRAINING_OFFICER', 'UNIVERSITY_AUTHORIZED_APPROVER', 'ACADEMIC_SUPERVISOR', 'GUEST_UNIVERSITY_REPRESENTATIVE');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('REGISTERED', 'PENDING_VERIFICATION', 'MORE_INFO_REQUIRED', 'VERIFIED', 'SUSPENDED', 'REJECTED');

-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('PRIVATE', 'GOVERNMENT', 'SEMI_GOVERNMENT', 'NON_PROFIT', 'OTHER');

-- CreateEnum
CREATE TYPE "ProgramType" AS ENUM ('COOPERATIVE_ACADEMIC', 'INDEPENDENT_SUMMER', 'GRADUATE_TAMHEER_LIKE');

-- CreateEnum
CREATE TYPE "AcademicOverlayMode" AS ENUM ('REQUIRED', 'OPTIONAL', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "AcademicParticipationMode" AS ENUM ('INSTITUTIONAL', 'GUEST', 'SELF_DOCUMENTED');

-- CreateEnum
CREATE TYPE "OpportunityStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'FILLED', 'EXPIRED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('APPLIED', 'UNDER_REVIEW', 'MORE_INFO_REQUIRED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "TrainingJourneyStatus" AS ENUM ('PENDING_START', 'ACTIVE', 'ON_HOLD', 'COMPLETION_PENDING', 'COMPLETED', 'WITHDRAWN', 'TERMINATED');

-- CreateEnum
CREATE TYPE "AcademicOverlayStatus" AS ENUM ('NOT_STARTED', 'APPROVAL_PENDING', 'MORE_INFO_REQUIRED', 'APPROVED', 'ACADEMIC_ACTIVE', 'COMPLETION_PENDING', 'CLOSED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AcademicTrustState" AS ENUM ('NONE', 'STUDENT_REPORTED', 'EVIDENCE_UPLOADED', 'UNIVERSITY_VERIFIED');

-- CreateEnum
CREATE TYPE "TrainingPlanVersionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PlanInstanceStatus" AS ENUM ('ASSIGNED', 'ACTIVE', 'COMPLETION_PENDING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TrainingTaskStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'REVISION_REQUIRED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AlignmentStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'ADJUSTMENT_REQUESTED', 'APPROVED', 'APPROVED_WITH_SUPPLEMENT', 'REJECTED');

-- CreateEnum
CREATE TYPE "ExceptionStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING_EXTERNAL', 'RESOLVED', 'CLOSED');

-- CreateTable
CREATE TABLE "AppUser" (
    "id" TEXT NOT NULL,
    "externalSubject" TEXT,
    "displayName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "status" "AccountStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleAssignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "BusinessRole" NOT NULL,
    "organizationId" TEXT,
    "institutionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoleAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Institution" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "publicSlug" TEXT,
    "nameAr" TEXT NOT NULL,
    "type" "OrganizationType" NOT NULL,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'REGISTERED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "institutionId" TEXT,
    "universityName" TEXT,
    "major" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Opportunity" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "planTemplateId" TEXT,
    "titleAr" TEXT NOT NULL,
    "descriptionAr" TEXT NOT NULL,
    "city" TEXT,
    "programType" "ProgramType" NOT NULL,
    "overlayMode" "AcademicOverlayMode" NOT NULL DEFAULT 'NOT_APPLICABLE',
    "seats" INTEGER NOT NULL DEFAULT 1,
    "status" "OpportunityStatus" NOT NULL DEFAULT 'DRAFT',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "studentUserId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'APPLIED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingJourney" (
    "id" TEXT NOT NULL,
    "traineeUserId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "opportunityId" TEXT,
    "applicationId" TEXT,
    "programType" "ProgramType" NOT NULL,
    "overlayMode" "AcademicOverlayMode" NOT NULL,
    "status" "TrainingJourneyStatus" NOT NULL DEFAULT 'PENDING_START',
    "expectedStartAt" TIMESTAMP(3),
    "actualStartAt" TIMESTAMP(3),
    "actualEndAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingJourney_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingPlanTemplate" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingPlanTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingPlanVersion" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "status" "TrainingPlanVersionStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingPlanVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingStageTemplate" (
    "id" TEXT NOT NULL,
    "planVersionId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "nameAr" TEXT NOT NULL,
    "weight" DECIMAL(5,2),

    CONSTRAINT "TrainingStageTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingTaskTemplate" (
    "id" TEXT NOT NULL,
    "stageTemplateId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "titleAr" TEXT NOT NULL,
    "mandatory" BOOLEAN NOT NULL DEFAULT true,
    "completionMethod" TEXT NOT NULL,
    "weight" DECIMAL(5,2),

    CONSTRAINT "TrainingTaskTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingPlanInstance" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "sourceVersionId" TEXT NOT NULL,
    "status" "PlanInstanceStatus" NOT NULL DEFAULT 'ASSIGNED',
    "frozenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingPlanInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingTaskInstance" (
    "id" TEXT NOT NULL,
    "planInstanceId" TEXT NOT NULL,
    "taskTemplateId" TEXT NOT NULL,
    "status" "TrainingTaskStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "score100" DECIMAL(6,3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingTaskInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicFramework" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "programType" "ProgramType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicFramework_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicFrameworkVersion" (
    "id" TEXT NOT NULL,
    "frameworkId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AcademicFrameworkVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicOverlay" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "institutionId" TEXT,
    "status" "AcademicOverlayStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "participationMode" "AcademicParticipationMode" NOT NULL,
    "trustState" "AcademicTrustState" NOT NULL DEFAULT 'NONE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicOverlay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alignment" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "frameworkVersionId" TEXT NOT NULL,
    "planVersionId" TEXT NOT NULL,
    "status" "AlignmentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingException" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "academicOverlayId" TEXT,
    "typeCode" TEXT NOT NULL,
    "status" "ExceptionStatus" NOT NULL DEFAULT 'OPEN',
    "ownerUserId" TEXT,
    "severityCode" TEXT,
    "impactSummary" TEXT,
    "blocking" BOOLEAN NOT NULL DEFAULT false,
    "escalated" BOOLEAN NOT NULL DEFAULT false,
    "waitingParty" TEXT,
    "waitingAction" TEXT,
    "resolutionSummary" TEXT,
    "resolutionActorUserId" TEXT,
    "resolutionEvidence" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingException_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AppUser_externalSubject_key" ON "AppUser"("externalSubject");

-- CreateIndex
CREATE UNIQUE INDEX "AppUser_email_key" ON "AppUser"("email");

-- CreateIndex
CREATE INDEX "RoleAssignment_userId_role_idx" ON "RoleAssignment"("userId", "role");

-- CreateIndex
CREATE INDEX "RoleAssignment_organizationId_role_idx" ON "RoleAssignment"("organizationId", "role");

-- CreateIndex
CREATE INDEX "RoleAssignment_institutionId_role_idx" ON "RoleAssignment"("institutionId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "Institution_code_key" ON "Institution"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_code_key" ON "Organization"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_publicSlug_key" ON "Organization"("publicSlug");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

-- CreateIndex
CREATE INDEX "Opportunity_organizationId_status_idx" ON "Opportunity"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Opportunity_programType_status_idx" ON "Opportunity"("programType", "status");

-- CreateIndex
CREATE INDEX "Application_studentUserId_status_idx" ON "Application"("studentUserId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Application_opportunityId_studentUserId_key" ON "Application"("opportunityId", "studentUserId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingJourney_applicationId_key" ON "TrainingJourney"("applicationId");

-- CreateIndex
CREATE INDEX "TrainingJourney_traineeUserId_status_idx" ON "TrainingJourney"("traineeUserId", "status");

-- CreateIndex
CREATE INDEX "TrainingJourney_organizationId_status_idx" ON "TrainingJourney"("organizationId", "status");

-- CreateIndex
CREATE INDEX "TrainingPlanTemplate_organizationId_idx" ON "TrainingPlanTemplate"("organizationId");

-- CreateIndex
CREATE INDEX "TrainingPlanVersion_templateId_status_idx" ON "TrainingPlanVersion"("templateId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingPlanVersion_templateId_versionNumber_key" ON "TrainingPlanVersion"("templateId", "versionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingStageTemplate_planVersionId_sortOrder_key" ON "TrainingStageTemplate"("planVersionId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingTaskTemplate_stageTemplateId_sortOrder_key" ON "TrainingTaskTemplate"("stageTemplateId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingPlanInstance_journeyId_key" ON "TrainingPlanInstance"("journeyId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingTaskInstance_planInstanceId_taskTemplateId_key" ON "TrainingTaskInstance"("planInstanceId", "taskTemplateId");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicFrameworkVersion_frameworkId_versionNumber_key" ON "AcademicFrameworkVersion"("frameworkId", "versionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicOverlay_journeyId_key" ON "AcademicOverlay"("journeyId");

-- CreateIndex
CREATE UNIQUE INDEX "Alignment_journeyId_key" ON "Alignment"("journeyId");

-- CreateIndex
CREATE INDEX "TrainingException_journeyId_status_idx" ON "TrainingException"("journeyId", "status");

-- CreateIndex
CREATE INDEX "TrainingException_journeyId_blocking_status_idx" ON "TrainingException"("journeyId", "blocking", "status");

-- CreateIndex
CREATE INDEX "TrainingException_academicOverlayId_status_idx" ON "TrainingException"("academicOverlayId", "status");

-- CreateIndex
CREATE INDEX "TrainingException_ownerUserId_status_idx" ON "TrainingException"("ownerUserId", "status");

-- CreateIndex
CREATE INDEX "AuditEvent_entityType_entityId_createdAt_idx" ON "AuditEvent"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_actorUserId_createdAt_idx" ON "AuditEvent"("actorUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "RoleAssignment" ADD CONSTRAINT "RoleAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleAssignment" ADD CONSTRAINT "RoleAssignment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleAssignment" ADD CONSTRAINT "RoleAssignment_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_planTemplateId_fkey" FOREIGN KEY ("planTemplateId") REFERENCES "TrainingPlanTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_studentUserId_fkey" FOREIGN KEY ("studentUserId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingJourney" ADD CONSTRAINT "TrainingJourney_traineeUserId_fkey" FOREIGN KEY ("traineeUserId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingJourney" ADD CONSTRAINT "TrainingJourney_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingJourney" ADD CONSTRAINT "TrainingJourney_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingJourney" ADD CONSTRAINT "TrainingJourney_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingPlanTemplate" ADD CONSTRAINT "TrainingPlanTemplate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingPlanVersion" ADD CONSTRAINT "TrainingPlanVersion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "TrainingPlanTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingStageTemplate" ADD CONSTRAINT "TrainingStageTemplate_planVersionId_fkey" FOREIGN KEY ("planVersionId") REFERENCES "TrainingPlanVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingTaskTemplate" ADD CONSTRAINT "TrainingTaskTemplate_stageTemplateId_fkey" FOREIGN KEY ("stageTemplateId") REFERENCES "TrainingStageTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingPlanInstance" ADD CONSTRAINT "TrainingPlanInstance_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "TrainingJourney"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingPlanInstance" ADD CONSTRAINT "TrainingPlanInstance_sourceVersionId_fkey" FOREIGN KEY ("sourceVersionId") REFERENCES "TrainingPlanVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingTaskInstance" ADD CONSTRAINT "TrainingTaskInstance_planInstanceId_fkey" FOREIGN KEY ("planInstanceId") REFERENCES "TrainingPlanInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingTaskInstance" ADD CONSTRAINT "TrainingTaskInstance_taskTemplateId_fkey" FOREIGN KEY ("taskTemplateId") REFERENCES "TrainingTaskTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicFramework" ADD CONSTRAINT "AcademicFramework_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicFrameworkVersion" ADD CONSTRAINT "AcademicFrameworkVersion_frameworkId_fkey" FOREIGN KEY ("frameworkId") REFERENCES "AcademicFramework"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicOverlay" ADD CONSTRAINT "AcademicOverlay_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "TrainingJourney"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicOverlay" ADD CONSTRAINT "AcademicOverlay_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alignment" ADD CONSTRAINT "Alignment_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "TrainingJourney"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alignment" ADD CONSTRAINT "Alignment_frameworkVersionId_fkey" FOREIGN KEY ("frameworkVersionId") REFERENCES "AcademicFrameworkVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alignment" ADD CONSTRAINT "Alignment_planVersionId_fkey" FOREIGN KEY ("planVersionId") REFERENCES "TrainingPlanVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingException" ADD CONSTRAINT "TrainingException_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "TrainingJourney"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingException" ADD CONSTRAINT "TrainingException_academicOverlayId_fkey" FOREIGN KEY ("academicOverlayId") REFERENCES "AcademicOverlay"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingException" ADD CONSTRAINT "TrainingException_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "AppUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingException" ADD CONSTRAINT "TrainingException_resolutionActorUserId_fkey" FOREIGN KEY ("resolutionActorUserId") REFERENCES "AppUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "AppUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
