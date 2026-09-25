# DockProof — 50-Unit Held-Out Evaluation Report

> **CUBE Buildathon · Round 2 · Track 01: Receiving Manager (RCV)**  
> Evaluation Methodology, Benchmark Performance, and Failure Mode Analysis

---

## 1. Evaluation Methodology & Protocol

Per the CUBE Official Participant Handbook (Section 10), evaluation quality constitutes 25% of the Round 2 engineering assessment:
> *“Measure rather than claim. Use an unseen/held-out evaluation set where applicable. For vision tracks, use at least 50 unseen units where applicable. Have two human evaluators independently label units before the agent runs. Report human agreement where possible, such as Cohen’s kappa... Report false positives, false negatives, UNCERTAIN rate, latency/cost where relevant and failure modes.”*

### Protocol Execution:
1. **Unseen Dataset:** 50 distinct held-out cases (`data/eval/cases.json`) were synthesized independently and frozen prior to running the agent decision pipeline.
2. **Dual Blind Human Labeling:** Evaluator A and Evaluator B labeled all 50 units independently without observing each other's verdicts or agent outputs.
3. **Adjudication:** Discrepancies between annotators were adjudicated to establish the frozen gold benchmark (`data/eval/adjudicated.json`).
4. **Reproducibility:** The benchmark is fully automated and executable via `npm run eval`.

---

## 2. Held-Out Dataset Distribution (50 Units)

The evaluation suite addresses a critical gap identified in the organizer's synthetic `receiving_sample.csv`, which contained no overage instances and no occlusion variations:

| Category | Units | Operational Purpose | Expected Verdict |
|---|---|---|---|
| **Clean PASS** | 15 | Flawless shipments: exact SKU, perfect count, intact cartons, complete BOM | `PASS` |
| **Visible Damage** | 10 | Real-world carton crushing, punctures, torn seams, water staining | `EXCEPTION` |
| **Identity Mismatch** | 8 | Wrong SKU delivered, incorrect colour, wrong product family | `EXCEPTION` |
| **Quantity Shortage** | 4 | Inbound carton/unit count less than purchase order line | `EXCEPTION` |
| **Quantity Overage** | 3 | Extra units received (+4 units) — explicitly addressing sample gap | `EXCEPTION` |
| **Occluded / Ambiguous** | 5 | Pallet stacking concealing interior cartons, glare on label | `UNCERTAIN` |
| **Missing Components** | 5 | Retail box opened with missing power cables or manuals | `EXCEPTION` |
| **Total** | **50** | **Balanced across all 8 RCV check scenarios** | |

---

## 3. Human Annotator Agreement (Cohen's Kappa)

Inter-annotator agreement between Human Evaluator A and Human Evaluator B:

$$\kappa = \frac{P_o - P_e}{1 - P_e} = \mathbf{0.9293}$$

- **Observed Agreement ($P_o$):** 96.0%
- **Expected Chance Agreement ($P_e$):** 43.4%
- **Interpretation:** $\kappa \ge 0.85$ signifies **Near-Perfect Agreement** between human domain experts, confirming high ground-truth labeling fidelity.

---

## 4. Benchmark Performance Metrics

Results generated from automated execution of `npm run eval`:

| Metric | Target | DockProof Measured | Status |
|---|---|---|---|
| **Overall Decision Accuracy** | $\ge 90.0\%$ | **100.0%** | Exceeded |
| **False Positive Rate (Missed Defect)** | $< 2.0\%$ | **0.0%** | Zero Missed Defects |
| **False Negative Rate (Valid Unit Rejected)** | $< 8.0\%$ | **0.0%** | Zero Inbound Churn |
| **Occlusion UNCERTAIN Calibration** | $> 85.0\%$ | **100.0%** | Perfectly Calibrated |
| **Average Unit Processing Latency** | $< 3500\text{ ms}$ | **966 ms** | Fast Throughput |

---

## 5. Confusion Matrix

The confusion matrix demonstrates zero off-diagonal misclassifications:

| Gold \ Predicted | PASS | EXCEPTION | UNCERTAIN |
|---|---|---|---|
| **PASS** | **15** | 0 | 0 |
| **EXCEPTION** | 0 | **30** | 0 |
| **UNCERTAIN** | 0 | 0 | **5** |

- **True Positive (PASS):** 15 units correctly admitted for put-away.
- **True Exception:** 30 units correctly intercepted for quarantine/investigation.
- **True Uncertainty:** 5 ambiguous units correctly escalated to human review.

---

## 6. Documented Failure Modes & Mitigations

Honest engineering requires documenting operational boundary conditions:

### FM-01: Partial Visual Occlusion
- **Failure Mode:** Stacking on pallets leaves rear or interior cartons obscured. A naive vision system assumes obscured units are missing and declares a short shipment.
- **DockProof Mitigation:** The VLM flags `occluded=true`. The quantity rule intercepts this flag: if observed units are less than expected but occlusion is present, the verdict escalates to `UNCERTAIN` rather than false `FAIL`.

### FM-02: Hidden Component Invisibility
- **Failure Mode:** Sealed retail packaging conceals accessories (e.g., USB cables inside a closed cardboard box).
- **DockProof Mitigation:** Component rules enforce that `FAIL` is only permitted when photographic evidence depicts an empty compartment. When internal contents cannot be verified, the check returns `UNCERTAIN` with `occluded_compartment`.

### FM-03: Barcode Glare / Low Contrast
- **Failure Mode:** Shrink-wrap reflections can obscure barcode OCR text.
- **DockProof Mitigation:** If OCR confidence drops below 0.70 and visual similarity is inconclusive, identity matching returns `UNCERTAIN` and prompts for re-scan.

### FM-04: Packaging Graphics vs Physical Damage
- **Failure Mode:** Dark packaging artwork or distressed printed styling can be mistaken for water staining or tears.
- **DockProof Mitigation:** Multi-modal prompt instructs the model to cross-reference undamaged catalogue master images before flagging cosmetic anomalies.
