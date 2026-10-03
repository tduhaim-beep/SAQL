import fs from 'node:fs';
import path from 'node:path';

const envOnly = process.argv.includes('--environment-only');
const failures = [];
const notes = [];

const nodeMajor = Number(process.versions.node.split('.')[0]);
if (nodeMajor !== 24) failures.push(`Node.js 24 LTS required; current runtime is ${process.version}`);
else notes.push(`Node runtime: ${process.version}`);

const databaseUrl = process.env.DATABASE_URL || '';
if (!databaseUrl) failures.push('DATABASE_URL is required for the Final R0 PostgreSQL verification environment');
else if (!/^postgres(ql)?:\/\//i.test(databaseUrl)) failures.push('DATABASE_URL must use a PostgreSQL URL');
else notes.push('DATABASE_URL: PostgreSQL URL present');

if (!envOnly) {
  if (!fs.existsSync('package-lock.json')) failures.push('package-lock.json is required and must be generated/reviewed in Node 24 with registry access');
  else notes.push('package-lock.json: present');

  const migrationsRoot = 'prisma/migrations';
  const migrationSql = fs.existsSync(migrationsRoot)
    ? fs.readdirSync(migrationsRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => path.join(migrationsRoot, entry.name, 'migration.sql'))
        .filter((file) => fs.existsSync(file))
    : [];
  if (!migrationSql.length) failures.push('A reviewed prisma/migrations/*/migration.sql baseline is required before Final R0 PASS');
  else notes.push(`Reviewed migration baseline(s): ${migrationSql.length}`);
}

for (const note of notes) console.log(`OK: ${note}`);
if (failures.length) {
  for (const failure of failures) console.error(`BLOCKED: ${failure}`);
  process.exit(1);
}
console.log(envOnly ? 'Final R0 target environment prerequisites: OK' : 'Final R0 target gate prerequisites: OK');
