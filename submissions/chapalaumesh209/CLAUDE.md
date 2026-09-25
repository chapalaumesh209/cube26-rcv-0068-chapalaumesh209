# Durable Engineering Constraints & Rules: DockProof (RCV)

> **CUBE Buildathon · Round 2 · Track 01: Receiving Manager**  
> **Participant:** chapalaumesh209

---

## 1. Non-Negotiable System Invariants

1. **Exactly One Multimodal Call Per Physical Unit:**
   Never invoke a model in a loop per unit. Never issue separate API calls for identity, damage, quantity, and packaging. All visual observations across all 8 checks must be batched into a single multimodal invocation.

2. **Deterministic Rules Own All Commercial Verdicts:**
   The AI model is an observer, not an adjudicator. A model response must strictly conform to factual extraction (`observed_quantity`, `label_readable`, `damage_type`). The final commercial verdict (`PASS`, `EXCEPTION`, `UNCERTAIN`) is calculated by pure, unit-tested deterministic TypeScript rules. Never let a model generate the overall commercial verdict directly.

3. **Zero Masked Failures:**
   A failure in *any single check* guarantees an overall `EXCEPTION`. Under no circumstance may a high confidence SKU match or clean barcode scan override a crushed corner, water damage, torn packaging, or quantity discrepancy.

4. **First-Class Uncertainty:**
   `UNCERTAIN` is an intentional, first-class commercial state. If an item is occluded, or a label is unreadable due to glare, the system must return `UNCERTAIN` and route the unit to human lead triage. The system must never force a low-confidence PASS or guess obscured counts.

5. **Fail-Open Operational Safety:**
   Dock doors must never freeze. If model inference times out (>30s) or network degrades, the unit must be logged as `fail_open=true` with status `pending_inspection`, routed to the lead reviewer queue, and allow the dock operator to continue.

6. **Strict Multi-Tenant Row-Level Isolation:**
   All database queries, image fixture storage, and session tokens must enforce tenancy boundaries by `org_id` (`org_demo_alpha` vs `org_demo_bravo`). No cross-tenant reads, writes, or image access is permitted under any condition.

7. **Tamper-Evident SHA-256 Audit Trail:**
   Every completed inspection must produce an immutable evidence record conforming to `rcv.v1`. The SHA-256 hash must cover the canonicalized inspection payload. Human overrides must be recorded as non-destructive audit events requiring an explicit reason code and reviewer identity.

---

## 2. Forbidden Language & Anti-Patterns

### Forbidden in Model Prompts & Output
- **No Probabilistic Verdicts in Model:** Forbidden to ask the model: *"Does this unit pass receiving?"* or *"Should we accept this package?"*
- **No Preambles or Conversational Text:** The model must output raw, valid JSON matching the Zod schema with zero markdown preamble.
- **No Hallucinated Occlusion Counts:** Forbidden to prompt the model to *"estimate hidden boxes behind the front stack"*.

### Forbidden in Codebase
- **No Floating API Keys:** Never hardcode credentials in code. All keys must be sourced from `.env.local` or environment variables.
- **No Destructive Overrides:** Never overwrite the original AI observation or original timestamp when an operator or lead reviewer applies an override.
- **No Mock-Only Shims in Production:** The codebase must seamlessly support live Google Gemini Flash (`@google/generative-ai`), OpenRouter multimodal endpoints, and local deterministic mock engine via a unified client.
