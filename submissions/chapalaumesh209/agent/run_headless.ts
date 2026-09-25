/**
 * Headless Receiving Manager Agent Runner
 * Face 3 Deliverable: Runs automated inspection verification over fixtures
 * 
 * Usage: npx tsx submissions/chapalaumesh209/agent/run_headless.ts
 */

import { runVLMInspection } from "../../../src/lib/agents/vlm-client";
import { compileInspectionPrompt } from "../../../src/lib/agents/prompt-compiler";
import {
  computeIdentityVerdict,
  computeQuantityVerdict,
  computeCartonVerdict,
  computeVariantVerdict,
  computeDamageVerdict,
  computeComponentVerdict,
  computeOverallVerdict,
} from "../../../src/lib/rules/decision-engine";
import { buildEvidenceRecord } from "../../../src/lib/evidence/builder";

interface FixtureUnit {
  unitId: string;
  sku: string;
  productTitle: string;
  poNumber: string;
  expected: {
    sku: string;
    quantity: number;
    cartons: number;
    unitsPerCarton: number;
    colour: string;
    variant: string;
    components: string[];
  };
  samplePhotoRole: string;
}

const TEST_FIXTURES: FixtureUnit[] = [
  {
    unitId: "UNIT-FIXTURE-01",
    sku: "ELEC-SPK-001",
    productTitle: "AuraSound Portable Bluetooth Speaker",
    poNumber: "PO-10492",
    expected: {
      sku: "ELEC-SPK-001",
      quantity: 24,
      cartons: 2,
      unitsPerCarton: 12,
      colour: "Midnight Black",
      variant: "Standard",
      components: ["Main Speaker Unit", "USB-C Charging Cable", "Quick Start Guide"],
    },
    samplePhotoRole: "overview",
  },
  {
    unitId: "UNIT-FIXTURE-02",
    sku: "CLTH-TSH-002",
    productTitle: "Organic Cotton Crewneck T-Shirt",
    poNumber: "PO-10493",
    expected: {
      sku: "CLTH-TSH-002",
      quantity: 50,
      cartons: 1,
      unitsPerCarton: 50,
      colour: "Navy Blue",
      variant: "Size L",
      components: ["Folded Garment", "Polybag", "Hangtag"],
    },
    samplePhotoRole: "label",
  },
  {
    unitId: "UNIT-FIXTURE-03",
    sku: "HOME-BLN-003",
    productTitle: "Thermal Insulated Blackout Curtains",
    poNumber: "PO-10494",
    expected: {
      sku: "HOME-BLN-003",
      quantity: 10,
      cartons: 1,
      unitsPerCarton: 10,
      colour: "Charcoal",
      variant: "84-inch",
      components: ["Curtain Panel Pair", "Tiebacks", "Care Insert"],
    },
    samplePhotoRole: "damage_detail",
  },
];

async function runHeadlessInspection(fixture: FixtureUnit) {
  const samplePhoto = {
    id: `photo_${fixture.unitId}`,
    objectKey: `fixtures/${fixture.unitId}.jpg`,
    role: fixture.samplePhotoRole,
    // Base64 1x1 test gif
    base64: "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    mimeType: "image/gif",
  };

  const prompt = compileInspectionPrompt(fixture.expected, [], [samplePhoto]);
  const startTime = Date.now();

  // 1. Single Multimodal Call
  const observation = await runVLMInspection(prompt, [samplePhoto], fixture.expected);
  const latency = Date.now() - startTime;

  // 2. Deterministic Decision Engine
  const checks = [
    computeIdentityVerdict(observation.identity!, fixture.expected.sku),
    computeQuantityVerdict(
      fixture.expected.quantity,
      observation.quantity?.observed_quantity ?? undefined,
      Boolean(observation.quantity?.occluded)
    ),
    computeCartonVerdict(fixture.expected.cartons, observation.cartons?.observed_cartons ?? undefined),
    {
      checkKey: "units_per_carton",
      verdict: observation.units_per_carton?.verdict || "uncertain",
      confidence: observation.units_per_carton?.confidence || 0.9,
      detail: {
        expected: fixture.expected.unitsPerCarton,
        observed: observation.units_per_carton?.observed_units_per_carton,
      },
    },
    computeVariantVerdict(
      observation.variant!,
      fixture.expected.colour,
      fixture.expected.variant
    ),
    computeDamageVerdict(observation.damage!),
    computeComponentVerdict(observation.components!, fixture.expected.components),
  ];

  const overallVerdict = computeOverallVerdict(checks);

  // 3. Sealed Evidence Record
  const mockInspection = {
    id: `ins_${fixture.unitId.toLowerCase()}`,
    overallVerdict,
    startedAt: new Date(startTime).toISOString(),
    completedAt: new Date().toISOString(),
    status: "completed",
    operatorId: "operator_headless_cli",
  };

  const evidenceRecord = buildEvidenceRecord(
    mockInspection,
    checks,
    [{ id: samplePhoto.id, sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", role: samplePhoto.role }],
    [],
    { unitCode: fixture.unitId, sku: fixture.sku },
    { id: "org_demo_alpha" }
  );

  return {
    unitId: fixture.unitId,
    sku: fixture.sku,
    overallVerdict,
    checksCount: checks.length,
    latencyMs: latency,
    contentHash: evidenceRecord.content_hash,
  };
}

async function main() {
  console.log("================================================================================");
  console.log("  DOCKPROOF HEADLESS AGENT RUNNER (Face 3 Deliverable)");
  console.log("  Evaluating Receiving Fixtures Without Browser UI");
  console.log("================================================================================\n");

  const results = [];
  for (const fixture of TEST_FIXTURES) {
    process.stdout.write(`Inspecting [${fixture.unitId}] ${fixture.sku}... `);
    const res = await runHeadlessInspection(fixture);
    results.push(res);
    console.log(`✓ DONE (Verdict: ${res.overallVerdict.toUpperCase()}, Hash: ${res.contentHash.slice(0, 16)}...)`);
  }

  console.log("\n================================================================================");
  console.log("  HEADLESS AGENT EXECUTION SUMMARY");
  console.log("================================================================================");
  console.table(results);
  console.log("✓ All 3 test fixtures processed with single-call VLM and deterministic rules.");
}

main().catch(console.error);
