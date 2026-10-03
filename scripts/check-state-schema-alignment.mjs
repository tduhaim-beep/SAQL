import fs from 'node:fs';

function csvRows(path) {
  const lines = fs.readFileSync(path, 'utf8').replace(/^\uFEFF/, '').trim().split(/\r?\n/);
  const headers = lines.shift().split(',');
  const idx = Object.fromEntries(headers.map((h, i) => [h, i]));
  return lines.map((line) => {
    // State CSV values do not contain commas in From/To/Machine ID fields; only those fields are parsed here.
    const cells = line.split(',');
    return {
      machineId: cells[idx['Machine ID']],
      from: cells[idx['From State']],
      to: cells[idx['To State']],
    };
  });
}

function prismaEnum(schema, name) {
  const match = schema.match(new RegExp(`enum\\s+${name}\\s*\\{([^}]*)\\}`, 'm'));
  if (!match) throw new Error(`Missing Prisma enum ${name}`);
  return new Set(match[1].split(/\s+/).map((x) => x.trim()).filter(Boolean));
}

const mapping = {
  'SM-VER': 'VerificationStatus',
  'SM-OPP': 'OpportunityStatus',
  'SM-APL': 'ApplicationStatus',
  'SM-TRN': 'TrainingJourneyStatus',
  'SM-PLANT': 'TrainingPlanVersionStatus',
  'SM-PLANI': 'PlanInstanceStatus',
  'SM-TASK': 'TrainingTaskStatus',
  'SM-ALN': 'AlignmentStatus',
  'SM-ACA': 'AcademicOverlayStatus',
  'SM-EXC': 'ExceptionStatus',
};

const states = new Map();
for (const row of csvRows('docs/implementation-control/STATE_MACHINES_V2.csv')) {
  if (!states.has(row.machineId)) states.set(row.machineId, new Set());
  states.get(row.machineId).add(row.from);
  states.get(row.machineId).add(row.to);
}

const schema = fs.readFileSync('prisma/schema.prisma', 'utf8');
for (const [machine, enumName] of Object.entries(mapping)) {
  const expected = states.get(machine);
  if (!expected) throw new Error(`Missing state machine ${machine}`);
  const actual = prismaEnum(schema, enumName);
  const missing = [...expected].filter((x) => !actual.has(x));
  const extra = [...actual].filter((x) => !expected.has(x));
  if (missing.length || extra.length) {
    throw new Error(`${machine} -> ${enumName} mismatch. Missing: ${missing.join('|') || '-'}; extra: ${extra.join('|') || '-'}`);
  }
}

const trust = prismaEnum(schema, 'AcademicTrustState');
for (const value of ['NONE','STUDENT_REPORTED','EVIDENCE_UPLOADED','UNIVERSITY_VERIFIED']) {
  if (!trust.has(value)) throw new Error(`AcademicTrustState missing ${value}`);
}

console.log('Prisma state enums align with Implementation Control Pack v2.1 state sets: OK');

function prismaModel(schema, name) {
  const match = schema.match(new RegExp(`model\\s+${name}\\s*\\{([\\s\\S]*?)\\n\\}`, 'm'));
  if (!match) throw new Error(`Missing Prisma model ${name}`);
  return match[1];
}

const exceptionModel = prismaModel(schema, 'TrainingException');
for (const fragment of [
  'journeyId             String',
  'academicOverlayId     String?',
  'typeCode              String',
  'status                ExceptionStatus @default(OPEN)',
  'ownerUserId           String?',
  'severityCode          String?',
  'impactSummary         String?',
  'blocking              Boolean         @default(false)',
  'escalated             Boolean         @default(false)',
  'waitingParty          String?',
  'waitingAction         String?',
  'resolutionSummary     String?',
  'resolutionActorUserId String?',
  'resolutionEvidence    Json?',
]) {
  if (!exceptionModel.includes(fragment)) throw new Error(`TrainingException baseline missing: ${fragment}`);
}
if (/enum\s+Exception(Type|Severity)/.test(schema)) throw new Error('R0 must not invent a closed Exception type/severity taxonomy');
if (!exceptionModel.includes('onDelete: Restrict')) throw new Error('TrainingException journey history must be protected with onDelete: Restrict');

console.log('TrainingException persistence baseline RG-R0-DATA-001: OK');

