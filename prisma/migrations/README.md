# Migration status

No Pilot v2 migration is committed yet. This is intentional: the current execution environment cannot install/run the approved Prisma toolchain, so a generated migration cannot be validated here.

R0 PASS requires a Node 24 environment with registry + PostgreSQL access to:
1. validate/generate Prisma client,
2. review the v2 schema,
3. generate the initial migration from this schema,
4. apply it to a disposable database,
5. run the synthetic seed and integration tests,
6. commit the reviewed migration and package lockfile.

Do not reuse or generate from the historical Pilot v1 schema.
