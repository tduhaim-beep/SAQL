import fs from 'node:fs';
import path from 'node:path';

const root = 'prisma/migrations';
const migrations = fs.existsSync(root)
  ? fs.readdirSync(root, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(root, entry.name, 'migration.sql'))
      .filter((file) => fs.existsSync(file))
  : [];

if (!migrations.length) {
  console.error('No reviewed baseline migration.sql exists. Generate/review it in the target Node 24 + registry + PostgreSQL R0 environment after data-model gaps are resolved.');
  process.exit(1);
}
console.log(`Reviewed migration baseline present: ${migrations.length}`);
