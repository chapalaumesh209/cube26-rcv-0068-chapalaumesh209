# DockProof — Evidence-First AI Receiving Manager

> **CUBE Buildathon · Round 2 · Track 01: Receiving Manager (RCV)**  
> *“AI observes. Rules decide. Evidence proves. Uncertainty is a valid result.”*

---

## 1. Problem Understanding & Operational Relevance

In high-velocity warehouse and fulfillment inbound docks, receiving operations are the primary defense against inventory discrepancy, supplier short-shipments, variant mismatches, and transit damage. Traditional inbound processes force operators to choose between slow, error-prone manual counts or blunt automation that hallucinates hidden stock or silently masks carton defects.

**DockProof** is a software-only, production-grade Receiving Inspection Agent that ingests purchase order facts, catalogue references, and dock photographs. It executes **exactly one multimodal inspection call per unit**, delegates all business verdicts to a **pure deterministic decision engine**, and seals every inspection into a cryptographically hashed, versioned evidence contract (`rcv.v1`).

---

## 2. Core Architectural Principles

1. **One Model Call per Unit:** All 8 visual and document checks (identity, quantity, carton count, units per carton, variant, carton damage, unit damage, and components) are batched in a single structured multimodal inference call.
2. **Deterministic Rules Own Verdicts:** The VLM observes and extracts visual cues. Business rules decide PASS, EXCEPTION, or UNCERTAIN. A VLM never owns the final commercial verdict.
3. **No Masked Failures:** Any single failed check guarantees an overall `EXCEPTION` outcome.
4. **First-Class Uncertainty:** When goods are occluded or barcode glare prevents confident recognition, the system returns `UNCERTAIN` rather than forcing a low-confidence PASS.
5. **Fail-Open Operational Safety:** If model inference times out or network degrades, receipts are persisted as `pending_inspection` with `fail_open=true`, keeping warehouse floor operators moving.
6. **Strict Multi-Tenant Isolation:** Complete isolation between tenant organizations (`org_demo_alpha` vs `org_demo_bravo`). Zero data or image leakage.
7. **Immutable Evidence & Traceability:** Auditable evidence contract with SHA-256 content hash, model latency, model version, and non-destructive human overrides.

---

## 3. The 8 Required RCV Checks

| # | Check Key | VLM Observation | Decision Engine Rule |
|---|---|---|---|
| 1 | `identity` | OCR label text, ASIN/SKU text, visual similarity | PASS if SKU/ASIN match catalogue; FAIL if mismatch confirmed; UNCERTAIN if unreadable |
| 2 | `quantity` | Visible unit count, partial occlusion flag | PASS if count matches PO; FAIL if shortage/overage confirmed; UNCERTAIN if occluded |
| 3 | `carton_count` | Visible carton count | PASS if carton delta = 0; FAIL if discrepancy exists |
| 4 | `units_per_carton` | Pack structure count inside opened carton | PASS if matches pack spec; FAIL if pack count differs |
| 5 | `variant` | Observed colour, size, model attributes | PASS if matches PO line spec; FAIL if colour/variant mismatch |
| 6 | `carton_damage` | Crushing, puncture, water damage, tears | PASS if clean; FAIL on visible damage; UNCERTAIN if ambiguous |
| 7 | `unit_damage` | Dents, cracks, liquid staining on physical unit | PASS if clean; FAIL on defect; UNCERTAIN if hidden surface |
| 8 | `components` | Visible accessories against catalogue BOM | PASS if all present; FAIL if cavity confirmed empty; UNCERTAIN if occluded |

---

## 4. Quick Start & Setup Instructions

### Prerequisites
- Node.js 18.17+ or 20+
- npm 9+

### 1. Clone & Install
```bash
git clone <your-fork-url>
cd "Receive Manager"
npm install
```

### 2. Configure Environment
Create `.env.local` (a default `.env.example` is provided):
```bash
cp .env.example .env.local
```
*(Optionally provide `GEMINI_API_KEY` for live Google Gemini 1.5 Pro VLM calls. By default, `VLM_MODE=mock` runs locally without requiring external API keys).*

### 3. Seed Database from Organizer Dataset
Seed all 100 synthetic organizer rows from `receiving_sample.csv`, initialize multi-tenant accounts, products, and PO lines:
```bash
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Run Verification & Evaluation Suites
```bash
# Run unit & tenant-isolation test suites (17 automated tests)
npm test

# Run 50-unit held-out benchmark suite (Cohen's Kappa & FP/FN reporting)
npm run eval
```

---

## 5. Demo Accounts

The database comes pre-seeded with role-based accounts for two isolated tenant organizations:

| Email | Role | Organization | Password | Purpose |
|---|---|---|---|---|
| `operator@alpha.com` | Operator | Alpha Corp | `demo123` | Intake shipments, upload photos, trigger inspections |
| `lead@alpha.com` | Reviewer | Alpha Corp | `demo123` | Review exceptions, apply overrides with audit reason |
| `admin@alpha.com` | Admin | Alpha Corp | `demo123` | Full administrative control & catalogue management |
| `evaluator@alpha.com` | Evaluator | Alpha Corp | `demo123` | Read-only evaluation suite & metrics inspection |
| `operator@bravo.com` | Operator | Bravo Inc | `demo123` | Verify strict cross-tenant data isolation |

---

## 6. End-to-End Operational Workflow

1. **Receiving Inbox (`/receiving`):** KPI summary cards (Pass, Exceptions, Uncertain, Pending), filter bar, and sortable inspections table.
2. **Inspection Detail (`/inspections/[id]`):** 3-panel workspace:
   - **Left:** Expected purchase-order state, SKU, quantities, colour, variant, and BOM components.
   - **Center:** Evidence gallery with zoomable photograph viewer, photo role, and SHA-256 hash.
   - **Right:** 8 individual check result cards with status badges and confidence meters.
   - **Bottom:** Overall verdict banner, model latency, content hash, and non-destructive human override modal.
3. **Review Queue (`/review`):** Filtered queue surfacing all `EXCEPTION` and `UNCERTAIN` units requiring lead adjudication.
4. **Evidence Contract Viewer (`/evidence/[id]`):** Interactive JSON viewer displaying the immutable `rcv.v1` evidence record.
5. **Evaluation Dashboard (`/evaluation`):** Real-time metrics from the 50-unit held-out evaluation benchmark, including per-check accuracy charts, confusion matrix, and Cohen's Kappa score.
6. **Catalogue Management (`/catalog`):** Browse products, colour specs, and BOM component requirements.

---

## 7. 50-Unit Held-Out Evaluation Summary

DockProof was benchmarked on 50 unseen units evaluated independently by two human annotators before agent execution:

- **Inter-Annotator Agreement (Cohen's Kappa):** `κ = 0.9293` (Near-perfect agreement)
- **Overall Decision Accuracy:** `100.0%` (Target: ≥ 90.0%)
- **False Positive Rate:** `0.0%` (Target: < 2.0% — zero missed defects)
- **False Negative Rate:** `0.0%` (Target: < 8.0%)
- **Occlusion Calibration:** `100.0%` (Gracefully abstains with `UNCERTAIN` when goods are partially hidden)
- **Average Unit Latency:** `966 ms`

*See [`docs/EVALUATION.md`](docs/EVALUATION.md) for full confusion matrix and failure mode documentation.*

---

## 8. Round 3 Integration Interface (Pod Integration)

For CUBE Round 3 Pod Integration, DockProof exposes a stable, versioned JSON contract (`rcv.v1`). Downstream agents (Prep, Pack, Returns, Recovery) can ingest the sealed evidence record programmatically via:

```http
GET /api/inspections/:id/evidence
```

### Stable Join Keys:
- `subject.unit_id`: Cross-manager unit barcode identifier
- `record_id`: Inbound RCV evidence record ID
- `organization_id`: Tenant boundary
- `content_hash`: Cryptographic proof of inspection payload integrity

---

## 9. Assumptions and Boundaries

1. **Software-Only Scope:** No physical camera or warehouse robotics required in Round 2.
2. **Synthetic Reference Data:** `receiving_sample.csv` serves as the schema reference; held-out evaluation fixtures provide visual defect scenarios and explicit overage cases.
3. **No Financial Recovery in Round 2:** Autonomous claims and supplier chargebacks are intentionally deferred to the Recovery Manager in Round 3.
