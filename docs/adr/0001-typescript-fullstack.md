# ADR-0001: TypeScript full-stack pilot baseline

## Context
Founder-supervised AI development, responsive web pilot, modular monolith, small operational surface.

## Decision
Use TypeScript with Node.js 24 LTS, Next.js 16.x, React 19.x, PostgreSQL and Prisma 7.x. Use stable/LTS releases by default.

## Consequences
One language and deployable simplify pilot delivery, but architecture guardrails are required to prevent UI/database coupling.

## Revisit trigger
Mandatory customer stack, regulatory incompatibility, material operational failure, or proven performance constraint.
