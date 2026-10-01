# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Dock intake operators working at warehouse receiving bays who need to verify inbound freight quickly and consistently.
- Lead reviewers who adjudicate damaged, mismatched, or visually uncertain arrivals with a binding audit trail.
- Site administrators who manage manifests, catalogue data, access policy, and observation-engine configuration.
- Quality evaluators who audit model performance against held-out receiving cases.

## Product Purpose

DockProof is an autonomous warehouse receiving manager for optical verification of inbound freight. It replaces subjective intake checks with a single-pass multimodal observation, a deterministic commercial decision, and a cryptographically sealed evidence record. Success means fewer missed shortages and transit defects, consistent acceptance criteria across shifts, explicit abstention when evidence is insufficient, and defensible supplier-claim evidence.

## Positioning

DockProof separates perception from commercial judgment: an observation engine records what is visible across eight receiving gates, while a deterministic zero-mask rules engine alone produces PASS, EXCEPTION, or UNCERTAIN. Every completed inspection becomes an immutable `rcv.v1` evidence contract sealed with a SHA-256 content hash.

## Operating Context

The product is used at warehouse intake bays against purchase orders, carton counts, SKU and variant specifications, and bill-of-material definitions. Operators inspect identity, quantity, cartons, units per carton, variant, damage, components, and occlusion in one arrival pass. PASS units move to inbound preparation; EXCEPTION units produce supplier-recovery evidence; UNCERTAIN units enter lead review rather than being guessed through.

## Capabilities and Constraints

- Next.js 14 App Router, TypeScript, SQLite with Drizzle ORM, and Tailwind CSS.
- Multi-tenant organization boundaries and role-based capability enforcement at middleware and query layers.
- Four operational roles: operator, reviewer, administrator, and evaluator.
- Eight deterministic verification gates with explicit confidence and abstention states.
- Verdict precedence is EXCEPTION on any failed gate, otherwise UNCERTAIN on any uncertain gate, otherwise PASS.
- Evidence records conform to `rcv.v1` and include inspection facts, image hashes, decision provenance, overrides, and a content hash.
- Human overrides require a reviewer or administrator and a mandatory audit reason.
- Downstream interoperability targets Pod 02 Inbound Prep for PASS and Pod 05 Inbound Recovery for EXCEPTION.
- Existing data behavior, routes, permissions, API contracts, and deterministic decision logic must remain intact during UI work.

## Brand Commitments

- Product name: DockProof.
- Operational language must be precise, direct, and evidence-led; avoid vague AI claims or consumer-SaaS copy.
- The product must visibly distinguish machine observation, deterministic policy, and human adjudication.
- CUBE Buildathon 2026, Track 01 · Commerce Context · Pod 01 is factual context.

## Evidence on Hand

- Full architecture and engineering specification: `/Users/sama/.codex/attachments/8f818535-69db-4279-88bb-16d0bc5ed8aa/Pasted text.txt`.
- `rcv.v1` contract: `submissions/chapalaumesh209/contract/rcv.v1.json`.
- Evaluation cases and reports under `data/eval/`.
- Receiving sample data under `data/` and `receiving_sample.csv`.
- Existing application routes, components, and seeded SQLite-backed workflows in the repository.
- No customer testimonials, commercial deployment claims, or production benchmark claims should be invented.

## Product Principles

1. Evidence before assertion: every verdict must be traceable to observable facts and policy.
2. Refuse to guess: uncertainty is an explicit safe outcome, not an error to hide.
3. Fast at the bay, deep on demand: primary screens must scan quickly while preserving drill-down detail.
4. Deterministic commercial control: AI observes; rules and authorized humans decide.
5. Auditability across boundaries: every handoff must remain tenant-isolated, tamper-evident, and operationally legible.

## Accessibility & Inclusion

The interface must remain keyboard operable, responsive, and readable in bright warehouse environments. Status cannot rely on color alone; verdicts and gate outcomes require text or icon reinforcement with WCAG AA contrast.
