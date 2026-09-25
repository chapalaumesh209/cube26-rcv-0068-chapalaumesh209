# DockProof — Model Card & AI Specification

> **CUBE Buildathon · Round 2 · Track 01: Receiving Manager (RCV)**  
> Multimodal Inspection Architecture, Ethical Considerations, and Operational Bounds

---

## 1. Model Details

- **Model Architecture:** Google Gemini 1.5 Pro / Flash Multimodal Large Language Model
- **Integration Framework:** Google GenAI SDK (`@google/generative-ai`) with Zod-enforced structured JSON output
- **Input Modalities:** Textual purchase order line specifications, product catalogue metadata, and high-resolution receiving dock photographs (JPEG, PNG, WebP)
- **Output Modality:** Schema-validated JSON observation payload containing visual findings and confidence scores across 8 inspection vectors
- **Inference Mode:** Single batched multimodal request per physical unit

---

## 2. Intended Use

- **Primary Application:** Automated assistance for warehouse receiving operators during physical dock intake.
- **Operational Roles:** Identifies obvious SKU mis-picks, counts visible cartons and units, cross-references variant colours, identifies visible structural damage, and detects missing accessories.
- **Human-in-the-Loop:** Designed to operate alongside receiving leads. All non-PASS outcomes route directly to the Review Queue (`/review`) with mandatory justification audit trails.

---

## 3. Out-of-Scope & Prohibited Use

- **Autonomous Chargebacks:** DockProof must not be used to execute financial supplier clawbacks directly without downstream Review or Recovery Manager verification.
- **Hazardous Materials Assessment:** The model is not calibrated to detect chemical spills, hazardous leaks, or lithium battery punctures.
- **Inferring Hidden Cargo:** The model is strictly instructed never to extrapolate or guess the existence of obscured items behind pallets.

---

## 4. Benchmark & Development Datasets

1. **CUBE Organizer Dataset (`receiving_sample.csv`):** 100 synthetic reference records used to align application schemas, SKU taxonomy, and purchase order mappings.
2. **Kaputt Visual Defect Benchmark (Amazon Science):** Reference taxonomy for logistics carton crushing, punctured seams, and moisture deformation.
3. **Amazon Berkeley Objects (ABO):** Reference catalogue imagery and product variant hierarchies.
4. **DockProof 50-Unit Held-Out Evaluation Benchmark:** 50 unseen synthetic fixtures evaluating clean shipments, damage, mismatches, shortages, explicit overages, and visual occlusion.

---

## 5. AI Safety & Security Considerations (OWASP LLM Top 10)

1. **LLM01: Prompt Injection Defense:** Incoming image file metadata and OCR labels are treated as untrusted data. System instructions instruct the model to report visual attributes only and ignore any textual commands contained inside barcode images or packaging text.
2. **LLM02: Insecure Output Handling:** VLM JSON output is parsed and validated through strict Zod schemas before being passed to application rules. Model output is never interpolated directly into raw SQL or shell commands.
3. **LLM06: Sensitive Information Disclosure:** Image EXIF metadata and tenant identity headers are stripped before external API inference calls.

---

## 6. Performance & Economics

- **Average Inference Latency:** ~950 ms – 1400 ms
- **Token Usage:** ~1,200 prompt tokens (including image embeddings) + ~450 completion tokens per unit
- **Estimated Operating Cost:** < $0.003 per receiving unit inspected
- **Fail-Open Safeguard:** In the event of network disruption or provider throttling, receipts are persisted in `pending` state with `fail_open=true`, preventing dock delays.
