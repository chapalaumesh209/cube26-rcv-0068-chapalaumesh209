# GitHub & Repository Workflow Guide

This repository is the official submission workspace for **01 · Receiving Manager (Track 01: RCV)** by participant **chapalaumesh209**.

Round 2 is an **individual build**, and each participant works in their **own GitHub fork**.

```text
Official Repository
        ↓
      Fork
        ↓
 Your GitHub Fork (chapalaumesh209)
        ↓
 Build + Test
        ↓
 Commit + Push
        ↓
 Final Submission
```

---

## 1. Quick Setup & Local Execution

Clone your fork and install dependencies:

```bash
git clone https://github.com/chapalaumesh209/cube-01-receiving-manager.git
cd cube-01-receiving-manager
npm install
```

Configure `.env.local`:
```bash
cp .env.example .env.local
```

Seed database and run test suites:
```bash
npm run seed
npm test
npm run eval
npm run dev
```

---

## 2. Expected Submission Layout

The canonical submission index for participant `chapalaumesh209` is located at:
`submissions/chapalaumesh209/`

```text
submissions/chapalaumesh209/
├── README.md            ← Master submission index & deliverable checklist
├── 01-customer-letter.md ← Customer narrative from warehouse operations lead
├── 02-prfaq.md          ← Press Release & tough operational FAQ
├── 03-one-pager.md      ← Executive one-pager, metrics & kill conditions
├── CLAUDE.md            ← Durable architectural constraints & forbidden language
├── build-brief.md       ← Technical architecture specification
├── build-log.md         ← Chronological build progression
├── eval-report.md       ← 50-Unit held-out evaluation & Cohen's Kappa report
├── contract/            ← Canonical rcv.v1 evidence-record shape
│   └── rcv.v1.json
└── agent/               ← Headless fixture evaluation runner
    └── run_headless.ts
```

---

## 3. Important Deadlines

- **Build begins:** 25 September 2026 · 9:00 AM IST
- **Submissions open:** 27 September 2026
- **Final submission deadline:** 1 October 2026 · 6:00 PM IST
