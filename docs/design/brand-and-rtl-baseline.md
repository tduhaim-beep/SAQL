# SAQL Brand & RTL Baseline — Brand Identity v1.1

Status: current approved visual identity / mandatory implementation baseline.

## Current brand source
- Canonical visual source: `SAQL Brand Identity v1.1` package from Project Sources.
- Product: صقل — SAQL.
- Approved logo system: A / Open Course artwork and approved lockups/assets only.
- Brand Ink: `#142F43`.
- Brand Blue: `#2F5BEA`.
- Brand Canvas: `#F4F7FB`.
- Supporting White: `#FFFFFF`.
- Muted text: `#566575`.
- Divider: `#D9E2EE`.
- Product/interface typography: Tajawal Regular 400 / Medium 500 / Bold 700 for Arabic and English.
- Logo lettering is fixed artwork and must not be recreated with the text typeface.
- No Canonical Tagline is established by Brand Identity v1.1.
- Semantic UI/status colours are separate from the brand palette.

## Repository asset mapping
- Runtime logo assets live under `public/brand/*.svg` and are copied from the approved Brand Identity v1.1 package.
- Exact palette data is mirrored in `docs/design/brand-colors.json`.
- Current visual reference images are under `docs/design/references/current/`.
- Previous visual references are retained under `docs/design/references/historical/` for audit/history only.
- Tajawal font binaries are governed by the canonical Brand Identity package and are intentionally not duplicated in this repository artifact. Final R0 must verify that the target application environment actually provisions/loads Tajawal 400/500/700.

## RTL rules
- Primary operating UI is Arabic and RTL.
- Root document uses `lang="ar" dir="rtl"`.
- Prefer logical CSS properties (`margin-inline`, `padding-inline`, `inset-inline`, etc.).
- Navigation, breadcrumbs, forms, tables, steppers and timelines must be reviewed in RTL.
- Icons/arrows with directional meaning must mirror where appropriate; brand marks do not mirror.
- Mixed English/Arabic content must not force the whole component to LTR.

## Reference-image rule
Historical mockups may be used only to understand previously discussed layout/function where still supported by current requirements. They are not current brand approval and do not create business requirements, permissions, states, workflows, or scope.
