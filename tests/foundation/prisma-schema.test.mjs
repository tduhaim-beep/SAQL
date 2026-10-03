import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

function enumValues(name) {
  const m = schema.match(new RegExp(`enum\\s+${name}\\s*\\{([^}]*)\\}`, 'm'));
  assert.ok(m, `enum ${name}`);
  return m[1].split(/\s+/).filter(Boolean);
}

test('Pilot v2 Prisma foundation includes current core entities', () => {
  for (const model of [
    'AppUser','RoleAssignment','Institution','Organization','StudentProfile','Opportunity','Application',
    'TrainingJourney','TrainingPlanTemplate','TrainingPlanVersion','TrainingPlanInstance','TrainingTaskInstance',
    'AcademicFramework','AcademicFrameworkVersion','AcademicOverlay','Alignment','TrainingException','AuditEvent'
  ]) assert.match(schema, new RegExp(`model\\s+${model}\\s+\\{`), model);
});

test('schema separates academic overlay lifecycle from trust state', () => {
  assert.deepEqual(enumValues('AcademicTrustState'), ['NONE','STUDENT_REPORTED','EVIDENCE_UPLOADED','UNIVERSITY_VERIFIED']);
  assert.match(schema, /status\s+AcademicOverlayStatus\s+@default\(NOT_STARTED\)/);
  assert.match(schema, /participationMode\s+AcademicParticipationMode/);
  assert.match(schema, /trustState\s+AcademicTrustState\s+@default\(NONE\)/);
});

test('versioned plan lifecycle lives on TrainingPlanVersion and task status is typed', () => {
  assert.match(schema, /model\s+TrainingPlanVersion\s+\{[\s\S]*?status\s+TrainingPlanVersionStatus\s+@default\(DRAFT\)/);
  assert.match(schema, /model\s+TrainingTaskInstance\s+\{[\s\S]*?status\s+TrainingTaskStatus\s+@default\(NOT_STARTED\)/);
});


test('approved Exceptions persistence baseline is present without invented taxonomies', () => {
  assert.match(schema, /model\s+TrainingException\s+\{[\s\S]*?journeyId\s+String/);
  assert.match(schema, /model\s+TrainingException\s+\{[\s\S]*?academicOverlayId\s+String\?/);
  assert.match(schema, /model\s+TrainingException\s+\{[\s\S]*?typeCode\s+String/);
  assert.match(schema, /model\s+TrainingException\s+\{[\s\S]*?status\s+ExceptionStatus\s+@default\(OPEN\)/);
  assert.match(schema, /model\s+TrainingException\s+\{[\s\S]*?blocking\s+Boolean\s+@default\(false\)/);
  assert.match(schema, /model\s+TrainingException\s+\{[\s\S]*?escalated\s+Boolean\s+@default\(false\)/);
  assert.match(schema, /model\s+TrainingException\s+\{[\s\S]*?resolutionEvidence\s+Json\?/);
  assert.match(schema, /journey\s+TrainingJourney\s+@relation\(fields: \[journeyId\], references: \[id\], onDelete: Restrict\)/);
  assert.doesNotMatch(schema, /enum\s+ExceptionType\s*\{/);
  assert.doesNotMatch(schema, /enum\s+ExceptionSeverity\s*\{/);
});

test('exception academic context invariant is explicit in the approved decision record', () => {
  const decision = fs.readFileSync('docs/reconciliation/RG-R0-DATA-001-exceptions-persistence-decision.md', 'utf8');
  assert.match(decision, /academicOverlayId[\s\S]*same `journeyId`/i);
  assert.match(decision, /negative test/i);
});
