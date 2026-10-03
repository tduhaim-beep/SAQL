# Final R0 — Dependency / Security gaps (current closure)

**SEC-R0-DEP-001 CLOSED. Engineering R0 PASS. Business Coding HOLD.**

Current compatibility task supersedes the former unapproved-major stop. It explicitly authorizes testing DeepmergeTS8.0.2 while retaining Prisma7.10.0/MySQL2 3.23.1. No Project Sources, schema, State Machines, Permissions, Scoring or Business Feature changed.

## Production findings and reviewed closure

Current task baseline `8486322fe89f899b22b3fae33e2f34155dab5316` had3 High affected entries (one advisory),0 Critical; MySQL2 had already been fixed. Original pre-baseline audit had4 High including MySQL2; it is historical, not this run's before-count.

| Affected package | Baseline -> current | Install path | Closure |
|---|---|---|---|
| deepmerge-ts |7.1.5 ->8.0.2|node_modules/deepmerge-ts|GHSA-ggr8-5vv4-36mx affects<8.0.0; authorized global transitive override, verified|
| @prisma/config |7.10.0 ->7.10.0|node_modules/@prisma/config|propagated finding removed by resolved8.0.2; config/API behavior before/after identical|
| prisma |7.10.0 ->7.10.0|node_modules/prisma|propagated finding removed; validate/generate/deploy/seed and all R0 gates pass|
| mysql2 |3.23.1 ->3.23.1|node_modules/mysql2|previous within-major3 fix retained, no new change|

Path: `@prisma/client@7.10.0 -> optional peer prisma@7.10.0 -> @prisma/config@7.10.0 -> deepmerge-ts@8.0.2 (overridden)`. The root CLI dev declaration does not remove the production peer chain. No dependency was reclassified to hide risk.

Fresh Production audit all severity counts0, exit0. Full audit5 High dev-only,0 Critical, exit1. Closure evidence: fresh npm ci, single changed lock entry, all direct versions unchanged, real Prisma configuration baseline comparison, malformed-config rejection, new disposable PostgreSQL16.15 migration/seed/reseed assertions, strict TypeScript/lint/Vitest/build/local CI/Desktop+Mobile/Brand+RTL and GREEN Hosted CI on candidate `d270ccaf5daa6e5169946b0354a88c1a1d39eb04`: https://github.com/tduhaim-beep/SAQL/actions/runs/37162967163. Required production audit is now a CI step immediately after npm ci. The external final report verifies the subsequent documentation-only delivery commit's Hosted result as well.

BSD-3-Clause/Node>=16.9.0/ESM+CJS/upstream maintenance/registry integrity reviewed. Alternative: wait for Prisma7 parent patch; current parent pins7.1.5. The task explicitly allows this reviewed transitive major8 change; no direct major change, Prisma downgrade, forcefix, audit suppression or waiver. Tested current config/runtime use; no universal API or exploit-reachability claim.

## SEC-R0-DEV-002 — OPEN, development-only

GHSA-vfj7-8cjw-p6xm affects braces<=3.0.3; current registry latest3.0.3, no patched published version. All five affected entries have `dev:true` and are absent from production audit:

| Package | Installed version | Install path |
|---|---|---|
| @next/eslint-plugin-next | 16.3.8 | `node_modules/@next/eslint-plugin-next` |
| braces | 3.0.3 | `node_modules/braces` |
| eslint-config-next | 16.3.8 | `node_modules/eslint-config-next` |
| fast-glob | 3.3.1 | `node_modules/fast-glob` |
| micromatch | 4.0.8 | `node_modules/micromatch` |

Chain `eslint-config-next16.3.8 -> @next/eslint-plugin-next16.3.8 -> fast-glob3.3.1 -> micromatch4.0.8 -> braces3.0.3`. npm recommends eslint-config-next14.2.35, a baseline-breaking Next16 downgrade, rejected. Full audit remains exit1; no false all-tree clean claim. Task§3 explicitly permits separately documented dev-only findings when no compatible patch exists. This is not production risk acceptance; production findings are zero.

## Evidence and scope

Current raw evidence outside code: production-audit-before.json, production-audit-after.json, full-audit-after.json, dev-only-findings.json, lock-review.json, config-compat-before/after.json, seed-first/repeat.json, commands.jsonl, H03-candidate-hosted-metadata.log and H04-candidate-hosted-raw.log under sec-r0-dep-001-compat-20261004/evidence. Full prior gap details remain in Git at baseline and historical report R0_REWORK2_LOCAL_VERIFICATION_20261004.md.

No main merge, production/compliance approval or Slice1 authorization is implied. Canonical Project Sources/OD-21 remain untouched. Engineering result R0 PASS with this separately recorded dev-tool gap under the supplied task.
