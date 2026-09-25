# Engineering & Repository Rules: Receiving Manager (RCV)

> **CUBE Buildathon · Round 2 · Track 01: Receiving Manager**

---

## 1. Core Engineering Rules

### Rule 1: Single Multimodal Call Per Physical Unit
All 8 required receiving checks (`identity`, `quantity`, `carton_count`, `units_per_carton`, `variant`, `carton_damage`, `unit_damage`, `components`) must be performed within **exactly one single batched multimodal request** per physical receiving unit. Multi-call per unit loops or chaining calls are strictly prohibited to prevent latency spikes and runaway token costs.

### Rule 2: Pure Deterministic Verdict Ownership
The Vision-Language Model (VLM) is strictly an observation extraction tool. It extracts factual visual observations, OCR text, and localized confidence scores. The commercial verdicts (`PASS`, `EXCEPTION`, `UNCERTAIN`) are strictly owned and computed by a deterministic business rules engine. A model must never make binding commercial acceptance decisions directly.

### Rule 3: Zero Masked Failures
Any single failed check unconditionally forces an overall `EXCEPTION` commercial outcome. For example, if SKU identity, quantity, and carton count match 100%, but packaging has a crushed corner or water damage, the unit MUST be flagged as an `EXCEPTION`. Defect masking is strictly prohibited.

### Rule 4: First-Class Uncertainty
`UNCERTAIN` is an intentional, first-class commercial verdict, not a low-confidence PASS. If a back row of cartons is occluded, or barcode glare obscures a serial number, the system MUST abstain with `UNCERTAIN` and route the unit to a human lead reviewer. Guessing or hallucinating occluded stock is prohibited.

### Rule 5: Fail-Open Operational Safety
If an external API call times out (>30 seconds) or network connectivity degrades, the system must fail open: persisting the receipt as `pending_inspection` with `fail_open=true`, alerting human lead reviewers without stalling dock unloading operations.

### Rule 6: Strict Multi-Tenant Isolation
All database queries, image fixtures, audit logs, and inspection states must enforce complete logical and cryptographic separation by tenant organization ID (`org_demo_alpha` vs `org_demo_bravo`). Contamination or cross-tenant leakage constitutes an immediate critical failure.

### Rule 7: Immutable Evidence Contract (`rcv.v1`)
Every completed inspection must produce an immutable, versioned evidence contract containing:
- Complete input manifest and catalogue references
- Exact visual observations and model latency
- Cryptographic SHA-256 tamper-evident integrity hash
- Non-destructive human lead adjudication audit trail

---

## 2. Never Commit Secrets
- Never commit API keys (`GEMINI_API_KEY`, `OPENROUTER_API_KEY`), `.env.local` files, or production credentials to git history.
- Use `.env.example` as a template for public documentation.
- Maintain credentials strictly in untracked local environment files.
