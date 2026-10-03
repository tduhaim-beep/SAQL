# Local Bootstrap — R0 v2

Prerequisites: Node.js 24 LTS, npm registry access, PostgreSQL development instance.

1. `node --version` must report v24.x.
2. `npm install` (first reconciliation only), then commit the generated `package-lock.json`; subsequent installs use `npm ci`.
3. Copy `.env.example` to `.env` and use development-only credentials.
4. `npm run db:generate`.
5. Generate/review the initial v2 migration from the approved Prisma schema; do not deploy a migration generated from the historical v1 schema.
6. Apply the migration to a disposable development database.
7. `npm run db:seed` using synthetic data only.
8. `npm run foundation:verify`.
9. `npm run typecheck && npm run lint && npm run test && npm run build`.
10. Install Playwright Chromium in the build environment and run `npm run test:e2e`.
11. Record exact commands/results in R0 evidence before declaring PASS.
