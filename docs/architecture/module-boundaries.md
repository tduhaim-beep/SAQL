# Module Boundaries v2

Modules under `src/modules/*` may depend on shared primitives and their own layers, but must not reach into another module's infrastructure/persistence directly. Cross-domain work is coordinated through application use cases, explicit ports or domain/application events.

## Dependency direction
`presentation -> application -> domain`

Infrastructure implements ports needed by application/domain. Domain must remain framework/provider independent.

## Prohibited shortcuts
- UI or route handler -> Prisma directly for business mutations.
- Module A -> Module B database tables/repository internals.
- Generic status mutation APIs.
- Authorization implemented only in the UI.
- Recalculating historical plan/alignment/scoring from mutable templates.
