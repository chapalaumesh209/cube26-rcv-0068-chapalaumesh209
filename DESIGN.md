# DockProof Design System (Impeccable)

Designed in accordance with **Impeccable Design Principles** for high-reliability industrial and logistics software.

---

## 1. Aesthetic Identity & Purpose

- **Application Domain:** Autonomous Warehouse Receiving Bay & Inbound Freight Verification (CUBE Track 01 · Pod 01).
- **Core Aesthetic:** Industrial Utility, High Contrast, Precision Telemetry.
- **Tone:** Technical, robust, dependable, uncluttered. No consumer SaaS fluff, no decorative purple-glow gradients, no nested card bloat.

---

## 2. Color Palette & Functional Semantics

All colors follow strict functional roles with tested contrast ratios ($\ge 4.5:1$ against backgrounds):

| Semantic Role | Token | Light Mode | Dark Mode (Consoles) | Purpose |
|---|---|---|---|---|
| **Primary Base** | `slate-950` / `zinc-950` | `#0f172a` | `#090a0f` | Background canvas |
| **Surface Raised** | `slate-900` / `zinc-900` | `#ffffff` | `#12151f` | Cards & panels |
| **Border Subdued** | `slate-800` / `slate-200` | `#e2e8f0` | `#1e2433` | 1px clean grid lines |
| **Verified (PASS)** | `emerald-500` | `#059669` | `#10b981` | Clean condition established |
| **Exception (FAIL)** | `rose-500` / `red-600` | `#dc2626` | `#f43f5e` | Packaging defect, shortage, or mismatch |
| **Uncertain (REVIEW)** | `amber-500` / `amber-600` | `#d97706` | `#f59e0b` | Visual occlusion / line-of-sight ambiguity |
| **System Brand** | `indigo-600` | `#4f46e5` | `#6366f1` | Brand accent & action focus |

---

## 3. Typography & Spacing System

- **Primary Display & Headings:** Inter with tight optical kerning (`tracking-tight`, weights 700 / 800).
- **Metadata & Kicker Labels:** Uppercase tracking (`text-[10px]` to `text-[11px]`, `tracking-wider`, weight 600).
- **Data & Telemetry:** JetBrains Mono for SKU, ASIN, Unit IDs, PO Numbers, and SHA-256 Hashes.
- **Tabular Figures:** `font-mono tabular-nums` for counts, percentages, and latencies.

---

## 4. Anti-Patterns Eliminated (Impeccable Rules)

- ❌ **No `ai-color-palette` / `dark-glow`**: No fuzzy purple-to-cyan gradient blobs or colored blur halos.
- ❌ **No `hero-eyebrow-chip`**: Replaced with functional industrial breadcrumbs and bay status indicators.
- ❌ **No `cards-in-cards` bloat**: Structural dividers and high-contrast tables replace nested card containers.
- ❌ **No `gray-on-color`**: High-contrast text pairings ensuring crisp legibility under warehouse lighting.
- ❌ **No `theater-slop-phrase`**: Operational vocabulary only (*"Verify Arrival"*, *"Examine Evidence"*, *"Adjudicate Discrepancy"*).
