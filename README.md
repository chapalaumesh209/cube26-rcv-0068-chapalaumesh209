# DockProof · Receiving Manager

DockProof records the condition of inbound inventory at the point of receipt. It compares a purchase order and product catalogue with observations from receiving photographs, applies fixed commercial rules, and seals the outcome in an `rcv.v1` evidence record.

This is the Round 2 implementation for CUBE Buildathon 2026, Track 01 / Pod 01. The fork is [chapalaumesh209/cube26-rcv-0068-chapalaumesh209](https://github.com/chapalaumesh209/cube26-rcv-0068-chapalaumesh209).

## Problem understanding

Spot checks at the dock can miss shortages, wrong variants, crushed cartons, water damage, and missing parts. When these are found later, the original receipt condition is hard to prove. The receiving decision therefore needs to be made while the freight is present and backed by a record that can be audited or handed to downstream teams. When a label or product surface cannot be seen, `UNCERTAIN` is the correct result.

## Solution overview

DockProof has four cooperating parts:

1. A receiving workspace connects arrivals to PO lines and catalogue specifications.
2. One observation pass collects identity, quantity, carton count, pack ratio, variant, carton damage, unit damage, and component findings. In `mock` mode these are stable offline fixtures; in `live` mode they come from a configured vision model.
3. A deterministic rules engine checks the observations. Any failed check makes the overall result `EXCEPTION`; otherwise any uncertain check makes it `UNCERTAIN`; only all-pass checks make it `PASS`.
4. The app writes a versioned `rcv.v1` JSON evidence record with a SHA-256 content hash. Authorized reviewers can add a reasoned override and audit entry.

The interface provides a live receiving ledger, shipment and manifest views, an inspection workspace, a review queue, an evidence vault, a product catalogue, evaluation metrics, and site settings. Access is role based and records are scoped to an organization.

## Setup

Requirements: Node.js 20 or newer and npm. SQLite runs locally; no database service is needed for the demo.

```bash
git clone https://github.com/chapalaumesh209/cube26-rcv-0068-chapalaumesh209.git
cd cube26-rcv-0068-chapalaumesh209
npm ci
cp .env.example .env.local
npm run seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The seeded role selector signs in with the four Alpha demo accounts below. They all use `demo123` when signing in through the custom credentials form.

| Workspace | Demo email | Starting page |
| --- | --- | --- |
| Intake operator | `operator@alpha.com` | Receiving |
| Lead reviewer | `lead@alpha.com` | Review queue |
| Site administrator | `admin@alpha.com` | Shipments |
| Quality evaluator | `evaluator@alpha.com` | Quality lab |

`npm run seed` **deletes and recreates** all rows in the local demo database at `data/dockproof.db`. Run it only when you want to reset the local data. The application creates the SQLite schema on first access; seeding supplies the example users, orders, units, inspections, and evidence.

The default `.env.example` uses `VLM_MODE=mock`, so the app runs without an API key. To use live image observation, set `VLM_MODE=live`, choose `VLM_PROVIDER=gemini` or `openrouter`, and provide the corresponding API key. Set a unique `AUTH_SECRET` for any nonlocal deployment. API keys and `.env.local` must never be committed.

## Usage and demo path

1. Sign in as the intake operator and open **Receiving**. Filter by `PASS`, `EXCEPTION`, or `UNCERTAIN`; search for a unit, SKU, PO, or supplier.
2. Open an inspection. Compare the PO specification with the eight check results and use the “Why?” controls to inspect the observation and rule detail. A pending unit can be analyzed from this page.
3. Sign in as the lead reviewer and open **Review queue**. Select an exception or uncertain unit, choose the binding outcome, and provide the mandatory audit reason.
4. Open **Evidence vault** to inspect or download the sealed `rcv.v1` contract and its content hash.
5. Sign in as the evaluator to inspect held-out scenario results in **Quality lab**. The displayed values come from `data/eval/report.json`.
6. Sign in as the administrator to import a manifest, inspect catalogue BOM data, and review policy settings.

For a repeatable demo, use the [demo runbook](docs/DEMO.md). The sample CSV is [receiving_sample.csv](receiving_sample.csv); import is available to operator, reviewer, and administrator roles.

## Validation

```bash
npm test          # Rule, evidence schema, and tenant-isolation tests
npm run eval      # Regenerate the held-out evaluation report
npm run build     # Production compilation
```

The evaluation report is a held-out fixture benchmark, not evidence that every live model and camera setup will achieve the same result. See [docs/EVALUATION.md](docs/EVALUATION.md) and [docs/MODEL_CARD.md](docs/MODEL_CARD.md).

## Assumptions and limitations

- The default offline mode is a deterministic fixture demonstration; it does not analyze pixels. The UI and evidence detail identify these observations as fixture output.
- Live mode requires an external provider key and usable receiving photographs. A live model timeout, invalid JSON, or incomplete observation leaves the inspection undecided and marked for follow-up; the app does not substitute a mock verdict.
- SQLite and local file storage are suitable for this local demonstration. Multi-instance production hosting needs a shared transactional database and durable object storage.
- The app stores image metadata and hashes, but this repository does not include a full camera-capture/upload workflow or real warehouse hardware integration.
- Model observations are evidence inputs. Commercial acceptance remains with deterministic policy or a recorded human override.
- The bundled report contains 50 fixture cases. Its performance numbers should not be generalized to unseen suppliers, lighting, packaging, or live model versions.

## Submission status

| Item | Status |
| --- | --- |
| Forked GitHub repository | [Fork URL](https://github.com/chapalaumesh209/cube26-rcv-0068-chapalaumesh209) |
| Final implementation pushed | Yes — published to the fork's `main` branch |
| README | This file |
| Architecture | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Demo video | Recording and accessible link still required; [runbook](docs/DEMO.md) is ready |
| Live deployment | Not configured; local demo is available at `http://localhost:3000` |

Do not submit a local URL as a public deployment URL. Add a video or deployment link here only after verifying it is accessible to judges.
