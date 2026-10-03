# Secure development baseline

- No production secrets or real government/student data in development or AI prompts.
- Named privileged users; no shared admin credentials by default.
- Backend authorization for protected actions.
- Least privilege and institution/resource context.
- Version-controlled database migrations.
- Dependency and secret scanning in the CI baseline.
- Separate development/staging/production credentials and data.
- Security findings are release-gated by severity.
