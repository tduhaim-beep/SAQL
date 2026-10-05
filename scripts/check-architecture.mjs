import fs from 'node:fs';
import path from 'node:path';

const forbiddenForDomain = [
  /from ["']next\//, /from ["']@prisma\//, /from ["']react["']/, /from ["']react\//,
  /from ["'][^"']*\/infrastructure\//, /from ["'][^"']*generated\/prisma/
];
const violations = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(ts|tsx)$/.test(entry.name)) {
      const text = fs.readFileSync(full, 'utf8');
      if (full.includes(`${path.sep}domain${path.sep}`)) {
        for (const rule of forbiddenForDomain) if (rule.test(text)) violations.push(`${full}: ${rule}`);
      }
      if (full.startsWith(`src${path.sep}app${path.sep}`) &&
          (/from ["'][^"']*(?:generated\/prisma|infrastructure\/(?:database|application-store|acceptance-coordinator|journey-reader))/.test(text)
          || /\.(?:application|trainingJourney)\.(?:create|update|delete|upsert)/.test(text))) {
        violations.push(`${full}: presentation must use authorized application services`);
      }
      if (full.includes(`${path.sep}modules${path.sep}`) && /from ["'][^"']*\/infrastructure\//.test(text)) {
        violations.push(`${full}: business modules must use explicit ports`);
      }
    }
  }
}
walk('src/modules');
walk('src/app');
if (violations.length) { console.error('Architecture boundary violations:\n' + violations.join('\n')); process.exit(1); }
console.log('Architecture import guard: OK');
