# Technical Build Brief: DockProof (RCV)

> **CUBE Buildathon · Round 2 · Track 01: Receiving Manager**  
> **Participant:** chapalaumesh209

---

## 1. Executive Specification

DockProof is a production-grade AI Receiving Manager designed for high-throughput inbound cross-docks and fulfillment centers. The system addresses three fundamental industry pain points:
1. **Vendor Discrepancy Bleed:** Shortages, variant mismatches, and packaging damage accepted at the dock door.
2. **AI Hallucination & Masked Defects:** Probabilistic models that overlook crushed edges because barcodes scanned cleanly.
3. **Dock Gate Congestion:** Slow multi-second agentic loops that freeze warehouse operations.

---

## 2. Technology Stack & Design Decisions

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Application Framework** | Next.js 14 App Router (TypeScript) | Fullstack architecture supporting server actions, streaming API routes, and optimized client workspaces. |
| **Database & ORM** | better-sqlite3 + Drizzle ORM | Zero-dependency, ultra-fast embedded relational storage supporting strict multi-tenant row-level queries. |
| **Vision Inference** | Google Gemini 3.8 / 2.5 Flash + Qwen 2.5 VL 72B (OpenRouter) | Sub-second multimodal observation extraction with structured JSON schemas and low temperature (0.1). |
| **Decision Engine** | Pure Deterministic TypeScript | 100% deterministic boolean rules engine enforcing zero masked failures and threshold bounds. |
| **Integrity & Security** | Web Crypto SHA-256 + jose JWT | Tamper-evident evidence hashing (`rcv.v1`) and role-based session verification. |
| **Styling & UI** | Tailwind CSS + Radix UI + Lucide | Minimal-text, high-contrast operational aesthetic designed for industrial dock scanners and touchscreens. |

---

## 3. Data Model & Entity Relations

```text
[organizations] 1 ─────── ∞ [users]
       │
       │ 1
       ▼ ∞
[purchase_orders] 1 ───── ∞ [po_lines]
       │                         │
       │ 1                       │ 1
       ▼ ∞                       ▼ ∞
  [shipments] 1 ───────── ∞ [units] 1 ───── 1 [inspections]
                                                    │
                                     ┌──────────────┴──────────────┐
                                     │ 1                           │ 1
                                     ▼ ∞                           ▼ ∞
                             [inspection_photos]           [inspection_checks]
                                                                   │
                                                                   ▼ 1
                                                           [evidence_records]
```

---

## 4. The 8 Required Receiving Checks

1. **`identity`**: Compares observed barcode text, SKU label, and ASIN against expected PO line and catalogue BOM.
2. **`quantity`**: Evaluates total counted units against expected order. Flags explicit overages (+4 units) or shortfalls.
3. **`carton_count`**: Verifies received outer cases against shipping manifest.
4. **`units_per_carton`**: Computes pack ratio (total units / carton count) to verify master-pack structure.
5. **`variant`**: Validates chromatic finish, size, and model attributes against PO spec (e.g. Midnight Black vs Silver).
6. **`carton_damage`**: Detects exterior transit defects (crushing, water damage, punctures, torn tape).
7. **`unit_damage`**: Evaluates physical merchandise integrity when unpacked.
8. **`components`**: Assesses Bill of Materials completeness against catalogue specs. Enforces the strict evidence boundary: empty molded tray = `MISSING`; uninspected cavity = `UNCERTAIN`.
