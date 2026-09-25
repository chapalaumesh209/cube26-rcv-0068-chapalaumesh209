# DockProof — Dataset Strategy & Licensing Documentation

> **CUBE Buildathon · Round 2 · Track 01: Receiving Manager (RCV)**  
> Comprehensive Documentation of Reference Datasets, Visual Benchmarks, and Licensing

---

## 1. Overview & Dataset Architecture

In logistics and warehouse inbound receiving, no single public dataset covers the complete workflow of purchase order contract reconciliation, multi-item counting, physical defect identification, and uncertainty handling.

DockProof strictly separates:
1. **Operational Schema Reference:** Provided by the CUBE organizers (`data/receiving_sample.csv`).
2. **Visual Development Benchmarks:** Curated subsets from public research datasets (Kaputt, ABO, RPC).
3. **Independent 50-Unit Held-Out Evaluation Benchmark:** Frozen synthetic fixtures with dual blind human annotations (`data/eval/cases.json`).

---

## 2. Inventory of Reviewed & Utilized Datasets

| Dataset | Provider / Source | Primary Role in DockProof | License / Usage Terms |
|---|---|---|---|
| **CUBE Receiving Sample (`receiving_sample.csv`)** | CUBE Buildathon Organizers | Canonical data model reference, schema alignment, and initial database seeding (100 synthetic rows). | Hackathon Participant Terms; internal reference use only. |
| **Kaputt Defect Dataset** | Amazon Science ([Paper / Repository](https://www.amazon.science/blog/novel-kaputt-dataset-sets-new-benchmark-for-large-scale-visual-defect-detection)) | Taxonomy calibration for logistics defects: carton crushing, punctured tape, tears, water deformation, and cosmetic scuffs. | Academic / Non-commercial research license. |
| **Amazon Berkeley Objects (ABO)** | Amazon / UC Berkeley ([Website](https://amazon-berkeley-objects.s3.amazonaws.com/index.html)) | Catalogue master imagery, 3D multi-view product references, and SKU variant hierarchies (colour/size distinctions). | Creative Commons Attribution 4.0 International (CC BY 4.0). |
| **Retail Product Checkout (RPC)** | RPC Benchmark ([Repository](https://rpc-dataset.github.io/)) | Multi-item visual counting calibration under partial occlusion and dense packaging arrangements. | Academic / Research Use. |
| **DockProof 50-Unit Held-Out Suite** | DockProof Engineering | Frozen benchmark dataset with independent dual human ground truth labels (Human A vs Human B) for automated evaluation. | Internal project artifact (MIT). |

---

## 3. Detailed Dataset Profiles

### 3.1 CUBE Organizer Dataset (`receiving_sample.csv`)
- **Size:** 100 rows, 25 columns.
- **Tenants Represented:** `org_demo_alpha` (69 rows), `org_demo_bravo` (31 rows).
- **Suppliers:** Supplier Coastal, Supplier East, Supplier North.
- **SKUs:** 10 unique product families (e.g., `SKU-BOTTLE-750`, `SKU-CABLE-USBC`, `SKU-LAMP-LED`, `SKU-MUG-11`, `SKU-TOWEL-BLU`).
- **Defects Modeled:** Crushing, water staining, tears, wrong colour, missing components.
- **Critical Gap Identified:** The organizer sample CSV contains **zero overage rows** (cases where received quantity exceeds ordered quantity) and uses placeholder strings for `photo_refs`. DockProof preserves the organizer data intact in `data/organizer/receiving_sample.csv` and explicitly adds overage fixtures to the independent evaluation set.

### 3.2 Kaputt Logistics Defect Dataset
- **Volume:** 238,421 photographs spanning 48,376 items (including 29,316 defective instances).
- **Usage:** Used as the visual benchmark for bounding-box grounding and prompt calibration for `carton_damage` and `unit_damage` vectors.
- **Defect Taxonomy Grounding:**
  - *Crushing:* Structural corner compression, collapsed side walls.
  - *Tears:* Punctures through corrugated fibreboard, breached carton seams.
  - *Water Damage:* Liquid tide marks, discolouration, paper softening.

### 3.3 Amazon Berkeley Objects (ABO)
- **Volume:** 147,702 product listings and 398,212 catalogue photographs.
- **Usage:** Provides visual reference embeddings for candidate SKU retrieval and variant matching (distinguishing same-family items like 750ml vs 1L bottles or matte black vs midnight blue finishes).

### 3.4 DockProof 50-Unit Held-Out Benchmark Dataset
- **Path:** `data/eval/cases.json`, `data/eval/labels_human_a.json`, `data/eval/labels_human_b.json`, `data/eval/adjudicated.json`.
- **Composition:**
  - 15 Clean PASS units
  - 10 Visible damage units
  - 8 Identity & variant mismatches
  - 4 Quantity shortage units
  - 3 Quantity overage units (explicitly testing overage handling)
  - 5 Occluded / ambiguous units (testing `UNCERTAIN` calibration)
  - 5 Missing components units
- **Human Annotation:** Dual independent labeling achieved **Cohen's Kappa $\kappa = 0.9293$**.

---

## 4. Ethical & Licensing Discipline

1. **No Unwarranted Production Claims:** DockProof does not claim that third-party public models were trained from scratch on proprietary warehouse data. Multimodal zero-shot and few-shot reasoning are executed through the Gemini GenAI API.
2. **License Compliance:** All third-party citations conform to their respective CC BY 4.0 and academic usage guidelines.
3. **Data Privacy:** All receiving photos are stripped of EXIF geotags and stored under tenant-scoped identifiers (`data/images/`).
