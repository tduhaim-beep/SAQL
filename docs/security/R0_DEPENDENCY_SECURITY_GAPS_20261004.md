# Final R0 — Dependency / Security gaps

Status: **OPEN — R0 REWORK; Business Coding HOLD.**

Scope is the existing R0 foundation, synthetic seed and dependency security. No Project Sources, state machines, permissions, scoring rules or business features were changed. These are technical security gaps, not invented product requirements.

## Exact production audit entries

Fresh `npm audit --omit=dev --json` before remediation returned four High **affected package entries**, not four independent vulnerabilities. Installed versions and complete chains were checked using `npm explain --json` and the committed npm lockfile.

| Package | Before → current version | Install path | Dependency path | Current result / available correction |
|---|---|---|---|---|
| mysql2 | 3.15.3 → 3.23.1 | node_modules/mysql2 | @prisma/client@7.10.0 → optional peer prisma@7.10.0 → mysql2 | FIXED: scoped npm override under Prisma, same major3; High GHSA-3f6p-5ww8-9rcr affects <3.22.0 and Moderate GHSA-rgwj-5xj2-c3m3 affects <=3.23.0;3.23.1 clears both in fresh audit |
| deepmerge-ts | 7.1.5 → 7.1.5 | node_modules/deepmerge-ts | @prisma/client@7.10.0 → optional peer prisma@7.10.0 → @prisma/config@7.10.0 → deepmerge-ts | OPEN: GHSA-ggr8-5vv4-36mx affects <8.0.0; fix requires >=8.0.0 (latest8.0.2), an unapproved transitive major change |
| @prisma/config | 7.10.0 → 7.10.0 | node_modules/@prisma/config | @prisma/client@7.10.0 → optional peer prisma@7.10.0 → @prisma/config | OPEN: propagated High from pinned deepmerge-ts7.1.5; needs a compatible upstream Prisma7/config7 release using a fixed dependency, or separately reviewed major8 compatibility change |
| prisma | 7.10.0 → 7.10.0 | node_modules/prisma | @prisma/client@7.10.0 → optional peer prisma@7.10.0; also root devDependency prisma7.x | OPEN: propagated High from @prisma/config; MySQL2 path has been fixed, deepmerge-ts path remains |

Although Prisma is declared as a devDependency, @prisma/client is a production dependency and its optional Prisma peer makes this installed CLI/config chain appear in `--omit=dev` audit. No package was reclassified or removed to hide these findings.

After the compatible MySQL2 correction, production audit returns **3 High,0 Critical, exit1**. All3 entries trace to the single DeepmergeTS advisory. Full-tree audit returns8 High,0 Critical. No reachability to application user input is proven; the application uses PostgreSQL and does not connect to MySQL. This does not constitute a risk acceptance or permit R0 PASS.

## SEC-R0-DEP-001 — incompatible available DeepmergeTS fix

- Affected installed package: deepmerge-ts7.1.5; chain/path above; propagated entries @prisma/config7.10.0 and prisma7.10.0.
- Newest published stable Prisma7 in the current registry snapshot is7.10.0 and pins @prisma/config7.10.0; that config pins deepmerge-ts7.1.5 exactly. No stable compatible Prisma7 update clearing this finding was available.
- Available fix: deepmerge-ts>=8.0.0. Applying it as an override crosses a transitive major and replaces the upstream exact version. Compatibility with Prisma config is not established by version numbers or a single passing smoke test.
- npm's automated suggestions downgrade Prisma to6.19.3 before the MySQL2 correction, and6.12.0 after it. Both violate the approved Prisma7 baseline. Prisma8/pre-release substitution is also outside this task.
- Decision: stop this affected dependency change and record the gap. No major8 override, downgrade, `npm audit fix --force`, audit suppression or waiver was applied. All independently authorized local verification continues.
- Closure: approved compatible upstream Prisma7/config7 patch, or separately reviewed dependency-major compatibility/security change with validation, followed by a clean install and production audit showing no unresolved High; then rerun R0 gates and Hosted CI on that exact commit.

## SEC-R0-DEV-002 — unchanged development-tool audit chain

Full-tree audit additionally reports braces3.0.3 → micromatch → fast-glob → @next/eslint-plugin-next → eslint-config-next (5 propagated affected package entries). GHSA-vfj7-8cjw-p6xm affects braces<=3.0.3; the current registry lists3.0.3 as latest and no patched published braces version. These5 entries are absent from the production-only audit. npm suggests eslint-config-next14.2.35, a downgrade outside the approved Next16 baseline. This chain remains documented; no toolchain downgrade or finding suppression was applied.

## MySQL2 compatibility/security/license review

Purpose: resolve Prisma CLI's transitive authentication downgrade and decompression DoS advisories without adding application MySQL behavior. Alternative considered: compatible Prisma7 upstream update; current stable7.10.0 still pins the vulnerable MySQL2 version. Scoped npm override upgrades only MySQL2 below Prisma, to3.23.1 within major3; direct dependency majors and resolved versions remain unchanged. MIT license, maintained upstream sidorares/node-mysql2, Node>=8 compatible with Node24; registry integrity preserved. The lock review, clean npm ci, Prisma validate/generate/deploy/seed and requested engineering gates are the compatibility evidence. PostgreSQL workflows are verified; this is not a claim of testing every MySQL-specific API.

Raw JSON/log evidence: final-r0-rework-2/evidence/audit-production-before.json, audit-production-after.json, audit-full-after.json, production-high-summary.json, dependency-paths-before.json, lock-review.json and registry metadata command logs. These evidence paths are outside repository code in the delivery package.
