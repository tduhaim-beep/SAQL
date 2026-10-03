# Final R0 — seed/security correction and local verification

**Engineering outcome: R0 REWORK. Business Coding HOLD.**

UTC 2026-10-03T23:09:42.759841+00:00. This report records the validated candidate before its Hosted CI push. Final Hosted result, exact commit hash and complete final report are in the external delivery evidence; no successful run is assumed here. R0 remains REWORK because of unresolved security findings even if Hosted CI later succeeds. The prior Prisma7Compat report is historical relative to this correction and must not be used for current TS/build status.

## Changes

prisma/seed.ts changes only two assignment lines to conditional object spread. organizationId/institutionId are absent when undefined; no any, assertion, strict disabling, role/context/state/schema change. package.json adds only a scoped Prisma → mysql2 override to3.23.1 within major3; package-lock.json reviewed (4 changed entries), all direct versions and approved majors unchanged. Initial version-scoped override was rejected by npm EOVERRIDE; corrected to the supported nested override without force. No other dependency-major upgrade/downgrade.

.github/workflows/ci.yml adds final-r0/** to the push branch filter so this verification branch executes the existing full workflow, including PostgreSQL16, Node24, database commands, npm run ci, root-capable --with-deps and Desktop/Mobile E2E. No workflow check removed and no production release or privileged product policy changed. Source repository GitHub was empty (read-only ls-remote0 refs; API size0); origin points to the user-selected tduhaim-beep/SAQL. No main overwrite/merge/force push.

Technical dependency/security gap register is docs/security/R0_DEPENDENCY_SECURITY_GAPS_20261004.md. R0 status/evidence and this report are documentation changes only.

## Current versions

Node24.19.0, npm11.9.0, PostgreSQL16.15, Prisma CLI/client/adapter7.10.0, Next16.3.8, React19.3.0, TypeScript5.9.3, Vitest5.0.3, Playwright1.63.0, actual Chromium153.0.8010.12. No approved direct versions changed. Fresh npm ci verifies registry integrity/TLS; no audit-force fix.

## Gates

| Gate | Result | Detail |
|---|---|---|
| Clean npm ci | PASS | 529 installed packages;629 lock entries; all direct versions unchanged |
| Prisma validate/generate | PASS | client7.10.0 freshly generated |
| Existing reviewed migration deploy | PASS | fresh PostgreSQL16.15; initially0 public tables; same reviewed SQL SHA256 |
| Synthetic seed / actual DB assertions / reseed | PASS | Institution1; Organization1; AppUser6; RoleAssignment6; roles/contexts and17 enum sets exact |
| TypeScript strict | PASS | conditional spread removes undefined context keys; TS2375 resolved; exactOptionalPropertyTypes preserved |
| Lint | PASS | exit0 |
| Vitest | PASS | 7/7 in4 files; Playwright excluded |
| Production build | PASS | Next16.3.8 optimized production build completed |
| npm run ci local | PASS | Foundation14/14 +typecheck+lint+Vitest7/7+build, full chain exit0 |
| Playwright Desktop/Mobile | PASS | 2/2, actual Chromium153.0.8010.12, CI=1 own webserver |
| Brand v1.1 / RTL available foundation | PASS | fresh network200/CDP rendering Tajawal400/500/700;6 font requests each viewport; no overflow |
| Implementation controls / Project Sources | PASS | 8 machine-readable controls +README+SHA256 manifest unchanged;23 original reference files unchanged |
| Production dependency audit | FAIL / GAP | 4→3 High;0 Critical; MySQL2 fixed, DeepmergeTS needs unapproved major8 |
| Full-tree dependency audit | FAIL / GAP | 8 High;0 Critical; includes5 unchanged propagated dev-tool entries |
| Hosted GitHub CI | PENDING / NOT GREEN YET | exact commit will be pushed to final-r0/seed-security-20261004; final run result/logs captured outside code in hosted-ci.json |

## Security findings and smallest corrective action

Before:4 production High affected package entries = mysql2@3.15.3, deepmerge-ts@7.1.5, @prisma/config@7.10.0, prisma@7.10.0. The last two are propagated entries. Actual chains include @prisma/client optional peer → prisma; CLI appears in production audit despite its root dev declaration. Exact paths, versions and advisory ranges are in production-high-summary.json and the security gap register.

After: mysql2@3.23.1 clears both the <3.22.0 High and <=3.23.0 Moderate advisory without a major change. MIT/Node>=8/maintained upstream/integrity and PostgreSQL tooling compatibility reviewed. Remaining3 production entries trace to GHSA-ggr8-5vv4-36mx. Newest stable Prisma7.10.0/config7.10.0 pins deepmerge-ts7.1.5; fix requires>=8.0.0. Stop the affected major override; SEC-R0-DEP-001 OPEN pending a compatible upstream Prisma7 patch or separately approved compatibility review. No waiver or claim of proven reachability. npm's suggested Prisma6 downgrade is forbidden. Full audit additionally retains braces3.0.3 development chain (5 propagated entries, latest braces has no patched release); SEC-R0-DEV-002 OPEN, Next16→14 downgrade rejected.

## Database and unchanged approved boundaries

Existing Prisma-generated/reviewed migration prisma/migrations/20261003222856_r0_v2_baseline/migration.sql reused unchanged; SHA256 63c247991bff9ab2dd4445bbcac58cc56047a821963ca323e5def7176e1fc9b2. No new or hand-authored migration. Fresh disposable loopback/tmpfs PostgreSQL16.15 initially had0 tables. Validate/generate/assert/deploy/seed all exit0. Independent SELECT/assertions verified1 institution,1 organization,6 users,6 role assignments, correct synthetic example.invalid/role contexts, all17 enum sets and migration DB checksum. Reseed preserved logical rows without duplicates; assignment IDs are intentionally recreated by the supplied seed. All other16 business-model tables remain empty. RG-R0-DATA-001 stays CLOSED; same-journey overlay invariant remains explicitly deferred to its later Business Slice.

Strict config bytes restored after Next's automatic AGENTS/tsconfig/next-env edits; generated snapshots retained outside code, no strict weakening. No Project Sources changed;23 hash checks pass. implementation-control8 machine-readable hashes plus README unchanged. No state machine, permission or scoring edits. No real production data/credentials. Basic secret scan is not comprehensive security clearance. No material product Requirement Gap was invented; only the technical dependency gaps above.

Brand checks on current available foundation only; screenshots/network/CDP are fresh. Semantic status components are absent, so that behavior remains NOT EXERCISED; no business component was created to complete it. Tests do not establish implementation of all225 business requirements.

## Commands, exact exits and raw logs

| Command | Exit | Raw log |
|---|---:|---|
| `npm audit --omit=dev --json` | 1 | `A01-audit-before.log` |
| `npm view @prisma/config@7.10.0 dependencies --json` | 0 | `A04-config-metadata.log` |
| `npm view mysql2 dist-tags engines dependencies --json` | 0 | `A05-mysql-metadata.log` |
| `npm view deepmerge-ts dist-tags engines --json` | 0 | `A06-deepmerge-metadata.log` |
| `npm explain prisma @prisma/config deepmerge-ts mysql2 --json` | 0 | `A02-dependency-paths.log` |
| `npm view prisma dist-tags versions dependencies peerDependencies --json` | 0 | `A03-prisma-metadata.log` |
| `gh api repos/tduhaim-beep/SAQL --jq {full_name,default_branch,size,permissions,archived,disabled}` | 1 | `H02-github-api.log` |
| `npm view mysql2@3.23.1 version license engines dependencies repository dist.integrity --json` | 0 | `A08-mysql-fixed-review.log` |
| `git ls-remote https://github.com/tduhaim-beep/SAQL.git` | 0 | `H01-git-read.log` |
| `npm view prisma@7.10.0 dependencies engines license --json` | 0 | `A07-prisma7-metadata.log` |
| `npm install --package-lock-only` | 1 | `A09-security-lock-update.log` |
| `npm install --package-lock-only` | 0 | `A09b-security-lock-update.log` |
| `env -u DOCKER_HOST -u DOCKER_CONTEXT -u DOCKER_TLS -u DOCKER_TLS_VERIFY -u DOCKER_CERT_PATH docker --host=unix:///var/run/docker.sock info --format {{.ServerVersion}}` | 0 | `B01-docker-info.log` |
| `npm ci` | 0 | `A10-clean-ci.log` |
| `env -u DOCKER_HOST -u DOCKER_CONTEXT -u DOCKER_TLS -u DOCKER_TLS_VERIFY -u DOCKER_CERT_PATH docker --host=unix:///var/run/docker.sock run -d --name saql-prisma7-r0-wbzp4fnf-postgres --label saql.purpose=prisma7-final-r0-rework-2 --tmpfs /var/lib/postgresql/data:rw,size=512m -e POSTGRES_USER=saql -e POSTGRES_PASSWORD=saql -e POSTGRES_DB=saql_prisma7_r0 -p 127.0.0.1:55434:5432 postgres:16` | 0 | `B02-postgres-start.log` |
| `npm run db:validate` | 0 | `B03-validate.log` |
| `npm audit --omit=dev --json` | 1 | `A11-audit-after.log` |
| `npm audit --json` | 1 | `A12-full-audit-after.log` |
| `npm run db:generate` | 0 | `B04-generate.log` |
| `env -u DOCKER_HOST -u DOCKER_CONTEXT -u DOCKER_TLS -u DOCKER_TLS_VERIFY -u DOCKER_CERT_PATH docker --host=unix:///var/run/docker.sock exec saql-prisma7-r0-wbzp4fnf-postgres psql -X -v ON_ERROR_STOP=1 -U saql -d saql_prisma7_r0 -c SELECT version(); SELECT count(*) AS public_tables FROM information_schema.tables WHERE table_schema='public';` | 0 | `B05-postgres-initial.log` |
| `npm run db:assert-migration` | 0 | `B06-assert-migration.log` |
| `node -e console.log(JSON.stringify({node:process.version,platform:process.platform,arch:process.arch}))` | 0 | `A14-runtime.log` |
| `npm run test` | 0 | `C03-vitest.log` |
| `npm view braces dist-tags versions --json` | 0 | `A13-braces-metadata.log` |
| `npm run db:deploy` | 0 | `B07-deploy.log` |
| `npm run typecheck` | 0 | `C01-typecheck.log` |
| `npm run lint` | 0 | `C02-lint.log` |
| `npm run db:seed` | 0 | `B08-seed.log` |
| `npm run build` | 0 | `C04-build.log` |
| `git push --dry-run origin HEAD:refs/heads/final-r0/seed-security-20261004` | 0 | `H03-push-access.log` |
| `python /workspace/saql-prisma7-final-r0-wbzp4fnf/final-r0-rework-2/verify_db.py seed-first.json` | 0 | `B09-verify-seed.log` |
| `npm run db:seed` | 0 | `B10-seed-repeat.log` |
| `gh api repos/tduhaim-beep/SAQL/actions/workflows/ci.yml --jq {id,name,path,state}` | 1 | `H04-github-api-after-network-save.log` |
| `npm run ci` | 0 | `C05-ci.log` |
| `gh api repos/tduhaim-beep/SAQL --jq {full_name,default_branch,size,permissions,archived,disabled}` | 0 | `H05-repository-access.log` |
| `python /workspace/saql-prisma7-final-r0-wbzp4fnf/final-r0-rework-2/verify_db.py seed-repeat.json` | 0 | `B11-verify-repeat.log` |
| `npm run test:e2e` | 0 | `C06-e2e.log` |
| `gh api repos/tduhaim-beep/SAQL/actions/permissions` | 1 | `H06-actions-permissions.log` |
| `node /workspace/saql-prisma7-final-r0-wbzp4fnf/final-r0-rework-2/brand_probe.cjs` | 0 | `D01-brand-runtime.log` |
| `node scripts/check-secrets.mjs` | 0 | `E01-secret-check.log` |
| `git diff --check` | 0 | `E02-diff-check.log` |
| `npm -v` | 0 | `A15-npm-version.log` |
| `npm run r0:env-check` | 0 | `A16-env-check.log` |

All logs are from this correction run under final-r0-rework-2/evidence; previous results were not substituted. GitHub API initially blocked at CONNECT; adding api.github.com while preserving existing allowed domains resolved network access. Repository API/push dry-run succeeded. Reading Actions permissions returned integration403; this does not establish that actual workflow execution is blocked. Actual push/run result must be checked separately on the candidate commit. Local historical --with-deps root failure is not itself a blocker under the current user instruction; real Chromium and E2E pass locally, Hosted workflow retains the full installer step.

**Slice1 / Business Feature NOT STARTED. Outcome R0 REWORK.**
