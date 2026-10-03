# Final R0 — SEC-R0-DEP-001 Compatibility Verification

**R0 PASS — Engineering verification only. Slice 1 / Business Coding HOLD.**

UTC: 2026-10-03T23:56:12.249363+00:00. المهمة الوحيدة هي SEC-R0-DEP-001؛ لم تُنشأ Business Feature ولم تتغير State Machines أو Permissions أو Scoring أو Project Sources.

Baseline المعتمد: `8486322fe89f899b22b3fae33e2f34155dab5316`. فرع التوافق: `final-r0/security-deepmerge-compat-20261004`. Commit التغيير التقني المختبر: `d270ccaf5daa6e5169946b0354a88c1a1d39eb04`. Hosted CI على هذا commit: [success](https://github.com/tduhaim-beep/SAQL/actions/runs/37162967163)، job verify 111320045914، جميع خطواته ناجحة بما فيها Production dependency audit وinstaller `--with-deps` وDesktop/Mobile E2E. تقرير التسليم الخارجي يسجل hash التسليم النهائي وتشغيل Hosted التالي عليه؛ هذا الملف يثبت نجاح التغيير التقني السابق لتحديثات التوثيق فقط، ولا يدّعي hash ذاتيًا لملف داخل commit.

## Dependency and compatibility decision

أضيف global transitive override `deepmerge-ts: 8.0.2` مع إبقاء `prisma -> mysql2: 3.23.1`. Prisma CLI/client/adapter بقيت7.10.0؛ كل إصدارات direct dependencies بقيت مطابقة. `npm install --package-lock-only` ثم `npm ci` دون تعديل lock يدويًا. تغيّر entry واحد فقط: `node_modules/deepmerge-ts` من7.1.5 إلى8.0.2 مع integrity المنشورة؛ بقي629 lock entries و529 installed packages. package/lock diff مرفق في evidence.

Resolved path: `@prisma/client@7.10.0 -> optional peer prisma@7.10.0 -> @prisma/config@7.10.0 -> deepmerge-ts@8.0.2 (overridden from7.1.5)`. Prisma معلن devDependency لكن optional peer من production client يجعل المسار موجودًا في production audit؛ لم يُغيّر تصنيف أي dependency لإخفاء finding.

Purpose: إغلاق stack-exhaustion advisory GHSA-ggr8-5vv4-36mx في dependency الخاصة بدمج Prisma config. البديل المدروس انتظار upstream Prisma7 patch؛ النسخة الحالية7.10.0 ما زالت pin7.1.5. الترقية العابرة للـmajor هنا مفوضة صراحةً بهذه المهمة ومقبولة فقط بعد اختبارات التوافق. مراجعة BSD-3-Clause، maintained RebeccaStevens/deepmerge-ts، Node>=16.9.0 متوافق معNode24، ESM/CJS exports وregistry SRI. لا force fix ولا Prisma downgrade ولا direct major change.

Prisma config الحالي استُخدم فعليًا عبر `loadConfigFromFile` قبل وبعد. schema/migrations path/seed/datasource/resolved config path متطابقة؛ deepmerge nested override/array merge/undefined handling وعدم mutation متطابقة؛ config غير صالح يُرفض بنفس ConfigFileSyntaxError. Prisma imports named deepmerge عبر ESM ويمرره إلى c12. هذه evidence لتوافق استخدام config الحالي وR0 كاملًا؛ ليست إثباتًا لكل API محتمل في Prisma/DeepmergeTS.

## Audit and security gaps

Production audit: **3 High -> 0 High; 0 Critical -> 0 Critical**، exit1 -> exit0، وبعد الإصلاح جميع severity counts صفر. الثلاثة السابقة affected package entries لسبب واحد: deepmerge-ts7.1.5 وpropagated @prisma/config7.10.0/prisma7.10.0. MySQL2 كان قد عولج في baseline وبقي3.23.1.

**SEC-R0-DEP-001 CLOSED** بعد Production audit وجميع بوابات local وHosted على commit التغيير نفسه. Full audit:8 High ->5 High،0 Critical، exit1 متوقع ومُسجل؛ لم يُخفَ أو يُعامل PASS. **SEC-R0-DEV-002 OPEN** منفصل: GHSA-vfj7-8cjw-p6xm، braces<=3.0.3؛ registry snapshot الحالي latest3.0.3 ولا patched version منشورة. جميع entries التالية `dev:true` في lock وغائبة تمامًا عن production audit. اقتراح npm هو eslint-config-next14.2.35، downgrade غير متوافق معNext16 ولم يُطبق. السماح بهذه النتائج منفصلة مصدره نص المهمة §3: “Dev-only findings may remain separately documented if no patched compatible version exists”; لا Production Security Risk Acceptance.

| Dev-only affected package | Installed version | Install path |
|---|---|---|
| @next/eslint-plugin-next | 16.3.8 | `node_modules/@next/eslint-plugin-next` |
| braces | 3.0.3 | `node_modules/braces` |
| eslint-config-next | 16.3.8 | `node_modules/eslint-config-next` |
| fast-glob | 3.3.1 | `node_modules/fast-glob` |
| micromatch | 4.0.8 | `node_modules/micromatch` |

Chain: `eslint-config-next16.3.8 -> @next/eslint-plugin-next16.3.8 -> fast-glob3.3.1 -> micromatch4.0.8 -> braces3.0.3`. Counts هي affected entries وليست5 advisories مستقلة. لا claim عن exploit reachability أو production/compliance clearance.

## All R0 gates

| Gate | Result | Evidence |
|---|---|---|
| Clean install / env | PASS | Node24.19.0; npm11.9.0; frozen npm ci |
| Prisma validate / generate | PASS | Prisma7.10.0 fresh generated client |
| Migration assertion / deploy | PASS | fresh PostgreSQL16.15 initially0 public tables; unchanged reviewed Prisma-generated SQL |
| Synthetic seed / actual SELECT / reseed | PASS | Institution1, Organization1, AppUser6, RoleAssignment6;16 other models0; contexts and17 enum sets exact |
| Foundation | PASS |14/14 |
| Strict TypeScript | PASS | exactOptionalPropertyTypes and TS2375 conditional spreads unchanged |
| Lint | PASS | exit0 |
| Vitest | PASS |7/7 in4 files; E2E excluded |
| Production build | PASS | optimized Next16.3.8 build |
| npm run ci local | PASS | entire foundation/type/lint/Vitest/build chain exit0 |
| Local browser-only installer / Chromium launch | PASS | real Chromium153.0.8010.12 |
| Local `--with-deps` | ENV LIMITATION / exit1 | `su: Authentication failure` for non-root; prior explicit user instruction permits this alone when Chromium/E2E and Hosted full installer succeed |
| Desktop/Mobile E2E | PASS |2/2; CI=1 own server |
| Brand v1.1 / RTL | PASS for available foundation | fresh screenshots viewed; actual Tajawal400/500/700 CDP font rendering and6 WOFF2 HTTP200 per viewport; no overflow; health200 |
| Canonical controls / Project Sources | PASS |8 machine-readable controls match canonical reference and SHA256; all23 reference files unchanged |
| Production audit JSON / Hosted audit command | PASS |0 High/Critical and all severity counts0; no suppression |
| Full audit | DOCUMENTED DEV GAP / exit1 |5 High dev-only per task§3,0 Critical |
| Hosted CI candidate | PASS | exact candidateSHA above; all20 steps success including production audit immediately after npm ci |

Existing migration SHA256: `63c247991bff9ab2dd4445bbcac58cc56047a821963ca323e5def7176e1fc9b2`. No new migration; no hand-authored SQL. DB migration checksum/finished flag and actual rows verified independently; reseed preserves users/institution/organization and logical assignments (seed intentionally recreates role-assignment IDs). RG-R0-DATA-001 stays CLOSED; no data model or approved invariant changed. Database was synthetic disposable loopback/tmpfs, never production.

Next automatically rewrote AGENTS/tsconfig/next-env; only those generated changes were restored to baseline byte-for-byte after local checks. Generated snapshots retained outside code; strict flags preserved. No current Brand PASS comes from historical08B. Semantic status business components absent, NOT EXERCISED; Business requirements implemented remain0/225. Canonical OD-21 register has not been edited; any canonical decision recording remains with its owner. Engineering R0 PASS does not authorize Business Slice1 or production release.

## Raw local and Hosted logs

Evidence is freshly captured under `sec-r0-dep-001-compat-20261004/evidence/` outside repository. No previous-run result substituted. All command UTC, exact argv, duration and exit are in commands.jsonl. H04-candidate-hosted-raw.log contains the actual full downloaded GitHub logs; JSON contains headSha/jobs/step conclusions. No inferred Hosted transcript.

| Gate ID | Exact argv | Exit | Raw log |
|---|---|---:|---|
| `A05-lock-update` | `['npm', 'install', '--package-lock-only']` | 0 | `A05-lock-update.log` |
| `A06-clean-install` | `['npm', 'ci']` | 0 | `A06-clean-install.log` |
| `A07-config-after` | `['node', '/workspace/saql-prisma7-final-r0-wbzp4fnf/sec-r0-dep-001-compat-20261004/config_compatibility.cjs', 'after']` | 0 | `A07-config-after.log` |
| `A08-production-audit` | `['npm', 'audit', '--omit=dev', '--json']` | 0 | `A08-production-audit.log` |
| `B03-env-check` | `['npm', 'run', 'r0:env-check']` | 0 | `B03-env-check.log` |
| `B05-validate` | `['npm', 'run', 'db:validate']` | 0 | `B05-validate.log` |
| `B06-generate` | `['npm', 'run', 'db:generate']` | 0 | `B06-generate.log` |
| `B07-assert-migration` | `['npm', 'run', 'db:assert-migration']` | 0 | `B07-assert-migration.log` |
| `B08-deploy` | `['npm', 'run', 'db:deploy']` | 0 | `B08-deploy.log` |
| `B09-seed` | `['npm', 'run', 'db:seed']` | 0 | `B09-seed.log` |
| `B10-db-assertions` | `['python', '/workspace/saql-prisma7-final-r0-wbzp4fnf/sec-r0-dep-001-compat-20261004/verify_db.py', 'seed-first.json']` | 0 | `B10-db-assertions.log` |
| `B11-seed-repeat` | `['npm', 'run', 'db:seed']` | 0 | `B11-seed-repeat.log` |
| `B12-db-repeat` | `['python', '/workspace/saql-prisma7-final-r0-wbzp4fnf/sec-r0-dep-001-compat-20261004/verify_db.py', 'seed-repeat.json']` | 0 | `B12-db-repeat.log` |
| `C01-foundation` | `['npm', 'run', 'foundation:verify']` | 0 | `C01-foundation.log` |
| `C02-typecheck` | `['npm', 'run', 'typecheck']` | 0 | `C02-typecheck.log` |
| `C03-lint` | `['npm', 'run', 'lint']` | 0 | `C03-lint.log` |
| `C04-vitest` | `['npm', 'run', 'test']` | 0 | `C04-vitest.log` |
| `C05-build` | `['npm', 'run', 'build']` | 0 | `C05-build.log` |
| `C06-ci` | `['npm', 'run', 'ci']` | 0 | `C06-ci.log` |
| `C07b-browser-only` | `['npx', 'playwright', 'install', 'chromium']` | 0 | `C07b-browser-only.log` |
| `C08-e2e` | `['npm', 'run', 'test:e2e']` | 0 | `C08-e2e.log` |
| `D01-brand` | `['node', '/workspace/saql-prisma7-final-r0-wbzp4fnf/sec-r0-dep-001-compat-20261004/brand_probe.cjs']` | 0 | `D01-brand.log` |
| `E01-hosted-audit-command` | `['npm', 'audit', '--omit=dev', '--audit-level=high']` | 0 | `E01-hosted-audit-command.log` |
| `H04-candidate-hosted-raw` | `['gh', 'run', 'view', '37162967163', '--repo', 'tduhaim-beep/SAQL', '--log']` | 0 | `H04-candidate-hosted-raw.log` |
| A02-audit-before | npm audit --omit=dev --json |1| A02-audit-before.log |
| A09-full-audit | npm audit --json |1| A09-full-audit.log |
| C07-with-deps | npx playwright install --with-deps chromium |1| C07-with-deps.log |

No rollback condition was triggered by the override. Compatibility accepted on this branch after Green Hosted CI. No main merge, force push, deployment, security waiver or Business Feature.
