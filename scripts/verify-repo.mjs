import fs from 'node:fs';
import path from 'node:path';

const required = [
  'AGENTS.md','README.md','package.json','tsconfig.json','prisma/schema.prisma','prisma.config.ts','prisma/seed.ts',
  'src/app/page.tsx','src/app/layout.tsx','src/app/globals.css',
  'public/brand/saql-horizontal-colour.svg','public/brand/saql-app-icon.svg',
  'docs/codex/codex-start-here.md','docs/architecture/domain-map-v2.md',
  'docs/design/brand-and-rtl-baseline.md','docs/design/brand-colors.json','docs/security/authorization-baseline.md',
  'docs/implementation-control/TRACEABILITY_ACCEPTANCE_V2.csv',
  'docs/implementation-control/PERMISSIONS_MATRIX_V2.csv',
  'docs/implementation-control/STATE_MACHINES_V2.csv',
  'docs/reconciliation/pre-r0-reconciliation.md',
  'docs/reconciliation/RG-R0-DATA-001-exceptions-persistence-decision.md',
  '.github/workflows/ci.yml', 'R0_V2_STATUS.md', 'R0_FINAL_RUNBOOK.md',
  'R0_FINAL_EXECUTION_BLOCKER_REPORT.md', 'scripts/check-r0-target-env.mjs'
];
const missing = required.filter((item) => !fs.existsSync(path.resolve(item)));
if (missing.length) { console.error('Missing R0 v2 files:\n' + missing.join('\n')); process.exit(1); }

const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
if (!pkg.engines?.node?.includes('24')) throw new Error('Node 24 LTS engine policy is missing');

const layout = fs.readFileSync('src/app/layout.tsx','utf8');
if (!layout.includes('lang="ar"') || !layout.includes('dir="rtl"')) throw new Error('Arabic RTL root baseline is missing');

const colors = JSON.parse(fs.readFileSync('docs/design/brand-colors.json','utf8'));
const currentTokens = [...Object.values(colors.brand), ...Object.values(colors.supporting_neutrals)].map((x) => x.toUpperCase());
const cssRaw = fs.readFileSync('src/app/globals.css','utf8');
const css = cssRaw.toUpperCase();
for (const token of currentTokens) if (!css.includes(token)) throw new Error(`Missing Brand Identity v1.1 token ${token}`);
for (const old of ['#142B52','#C8954E','#F8F5ED','#6B7A90']) if (css.includes(old)) throw new Error(`Superseded brand token still active in CSS: ${old}`);
if (!/TAJAWAL/i.test(cssRaw)) throw new Error('Tajawal is not the active interface font baseline');
if (/NOTO NASKH ARABIC/i.test(cssRaw)) throw new Error('Superseded Noto Naskh Arabic remains active in CSS');

const page = fs.readFileSync('src/app/page.tsx','utf8');
if (!page.includes('/brand/saql-horizontal-colour.svg')) throw new Error('Approved Brand Identity v1.1 logo asset is not used on the foundation page');
if (page.includes('نصقل التجربة. نبني الجاهزية.')) throw new Error('Superseded tagline remains in the current foundation page');

const oldModules = ['internship-case','student-eligibility','training-activation','milestones','academic-closure'];
for (const name of oldModules) if (fs.existsSync(`src/modules/${name}`)) throw new Error(`Historical v1 module still present: ${name}`);

console.log('Repository Pre-R0 v2 structure and Brand Identity v1.1 baseline: OK');
