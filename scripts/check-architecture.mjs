import fs from 'node:fs';
import path from 'node:path';

const forbiddenForDomain = [
  /from ["']next\//, /from ["']@prisma\//, /from ["']react["']/, /from ["']react\//,
  /from ["'][^"']*\/infrastructure\//
];
const violations = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(ts|tsx)$/.test(entry.name) && full.includes(`${path.sep}domain${path.sep}`)) {
      const text = fs.readFileSync(full, 'utf8');
      for (const rule of forbiddenForDomain) if (rule.test(text)) violations.push(`${full}: ${rule}`);
    }
  }
}
walk('src/modules');
if (violations.length) { console.error('Architecture boundary violations:\n' + violations.join('\n')); process.exit(1); }
console.log('Architecture import guard: OK');
