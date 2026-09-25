# chapalaumesh209 · Receiving Manager (RCV)

This directory is the canonical Round 2 submission index for **01 · Receiving Manager**, developed by **chapalaumesh209** for the CUBE Buildathon.

---

## Submission Deliverables & Status

| Face | Deliverable | Location | Status |
|:---:|:---|:---|:---:|
| **1** | **Customer Letter, PR/FAQ, One-Pager** | [`01-customer-letter.md`](01-customer-letter.md), [`02-prfaq.md`](02-prfaq.md), [`03-one-pager.md`](03-one-pager.md) | ☑ Complete |
| **2** | **CLAUDE.md (Durable Constraints & Rules)** | [`CLAUDE.md`](CLAUDE.md) | ☑ Complete |
| **3** | **Headless Agent on Fixtures** | [`agent/run_headless.ts`](agent/run_headless.ts) | ☑ Complete |
| **4** | **Held-Out Evaluation Benchmark Report** | [`eval-report.md`](eval-report.md) | ☑ Complete |
| **5** | **Evidence Record Page & Contract** | [`contract/rcv.v1.json`](contract/rcv.v1.json), UI: `/evidence/[id]` | ☑ Complete |
| **6** | **Cross-Pod Interoperability Contract** | [`contract/rcv.v1.json`](contract/rcv.v1.json) | ☑ Complete |

---

## Kill Condition

> **Unforgivable Failure Kill Condition:**  
> *"If the system ever issues a commercial `PASS` verdict for a delivery that contains a crushed packaging defect, an unverified short-shipment, or a cross-tenant data leak, the deployment is immediately halted and revoked."*

---

## Directory Index

```text
submissions/chapalaumesh209/
├── README.md               ← Master index & submission status table
├── 01-customer-letter.md   ← Inbound warehouse operations narrative
├── 02-prfaq.md             ← Press Release & hard operational questions
├── 03-one-pager.md         ← Key metrics, architecture diagram & kill condition
├── CLAUDE.md               ← Hard engineering constraints & forbidden patterns
├── build-brief.md          ← Technical system specification
├── build-log.md            ← Chronological build progression log
├── eval-report.md          ← 50-Unit held-out suite (Cohen's Kappa κ = 0.9293)
├── contract/
│   └── rcv.v1.json         ← Canonical evidence contract schema (SHA-256 sealed)
└── agent/
    └── run_headless.ts     ← Headless CLI test agent on fixtures
```

---

## Quick Verification Commands

```bash
# 1. Run automated unit & isolation tests (17 passed)
npm test

# 2. Run 50-unit held-out benchmark suite (κ = 0.9293, 100% accuracy, 0% FP)
npm run eval

# 3. Run headless agent on test fixtures
npx tsx submissions/chapalaumesh209/agent/run_headless.ts

# 4. Start local production dashboard
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** to experience the full role-tailored receiving workspace.
