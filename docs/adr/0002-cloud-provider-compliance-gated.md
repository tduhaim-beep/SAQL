# ADR-0002: Production cloud provider remains compliance-gated

## Context
Target customers may include Saudi government entities. Saudi-region presence alone is not sufficient evidence of compliance.

## Decision
Do not select production cloud or identity provider until customer data classification, applicable Saudi controls, provider qualification and data-flow/residency review are complete.

## Consequences
Development proceeds with synthetic data. Government production is a hard gate.
