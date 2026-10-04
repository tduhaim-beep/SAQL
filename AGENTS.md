# SAQL AI Engineering Guardrails — Pilot v2.0 / Slice 2

This repository is an implementation artifact. Current Project Sources remain the source of truth. Read this file first, then `docs/codex/codex-start-here.md`.

## Source hierarchy
1. `CAN-MI` — latest Approved/Canonical Project Master Index & Decision Register.
2. `CAN-AER` — latest Current Assumptions / Evidence / Risks / Open Decisions Register.
3. Approved current Stage Masters and the Pilot v2.0 implementation-control files.
4. `docs/implementation-control/*` for state, authorization, scoring and acceptance behavior.
5. Repository architecture/security/design rules that do not conflict with a newer canonical source.
6. Historical/Superseded material is context only and must never revive an old rule.

## Architecture
- Modular monolith; one deployable for the Validation Pilot.
- Presentation -> Application -> Domain dependency direction.
- Domain code must not import Next.js, React, Prisma, cloud SDKs, email providers, or UI code.
- Cross-domain workflows are coordinated through application use cases/events, never direct cross-module persistence writes.
- Pilot v2.0 includes public opportunity discovery/applications and post-acceptance training operations.
- Runtime AI, payments, native mobile apps, full ATS/LMS, deep integrations and generic workflow builders remain outside current Pilot scope unless a documented scope change approves them.

## Current business boundaries
- Training Journey Core is independent from Academic Overlay.
- Training Completion is not Academic Closure.
- Organization Training Score is not Academic Grade.
- Training Plan, scoring and academic alignment are versioned; active/historical journeys are not silently recalculated from later template changes.
- A student may use the platform without an institutional university account. University claims must preserve their evidence/trust state.

## Requirements and ambiguity
- Every material feature must reference current `BR-*` IDs, owning domain, relevant state machine, permission rule and acceptance criterion.
- Never invent a business rule, transition, permission, score formula, retention rule, or missing data-model relation. Open a Requirement Gap using `docs/codex/requirement-gap-template.md`.
- Use explicit business commands; generic status mutation endpoints are prohibited.

## Security
- Backend authorization is mandatory. UI hiding is not authorization.
- Enforce least privilege, resource scope and tenant/institution/organization context.
- Platform admins do not impersonate academic or organization business decisions.
- No real customer/government/student production data in local development, fixtures or AI prompts.
- No secrets in source, docs, prompts or logs.
- External inputs require runtime validation before application/domain use.
- Government production remains compliance-gated.

## UX / Brand / RTL
- User-facing UI is Arabic-first and RTL by default: `<html lang="ar" dir="rtl">`.
- Use **SAQL Brand Identity v1.1 only** for current visual implementation.
- Approved brand palette: Ink `#142F43`; Blue `#2F5BEA`; Canvas `#F4F7FB`; White `#FFFFFF`; Muted `#566575`; Divider `#D9E2EE`.
- Approved interface typeface: Tajawal Regular 400 / Medium 500 / Bold 700 for Arabic and English.
- Use approved logo SVG/lockups from Brand Identity v1.1. Do not recreate SAQL/صقل logo lettering with Tajawal or another text font.
- No Canonical Tagline is established by Brand Identity v1.1.
- Brand colors are not semantic status colors by default.
- Use CSS logical properties; do not hard-code layouts assuming LTR.
- English may appear as secondary labels, proper names or technical abbreviations, not as the primary operating UI.
- Previous logo/token/site visuals are Historical/Superseded and must not drive current implementation.

## Testing
- State transitions, invariants, calculations and negative authorization paths require automated tests.
- Every protected flow must include at least one unauthorized/cross-resource denial test.
- Brand/RTL PASS requires checks after the repository is reconciled to Brand Identity v1.1; historical R0 evidence does not establish current Brand/RTL PASS.
- High-risk changes: authn/authz, migrations, external invitations, file access, scoring, academic decisions, data deletion/export, integrations and production configuration.

## Dependencies and migrations
- No dependency without purpose, alternative considered, maintenance/security/license review.
- One package manager and one committed lockfile are required for R0 PASS.
- Schema changes require reviewed version-controlled migrations.
- Never hand-edit production schema.
- Do not generate the baseline migration while a material data-model Requirement Gap is unresolved.

## Release
- AI agents cannot deploy production or approve security/compliance readiness.
- Human approval is required for production release and all privileged policy changes.
