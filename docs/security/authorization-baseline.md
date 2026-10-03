# Authorization Baseline v2

The executable permission source is `docs/implementation-control/PERMISSIONS_MATRIX_V2.csv`.

Core rules:
- Deny by default.
- Check role + resource + organization/institution/journey assignment + explicit delegated authority.
- Academic decisions require verified/delegated university authority.
- Field supervisors are restricted to assigned trainees/tasks.
- Guest university access is case-scoped and invitation-scoped.
- Platform administrators cannot impersonate academic or organization decisions.
- Privileged admin operations require named account, MFA in production and audit.
- Cross-tenant negative tests are mandatory.
