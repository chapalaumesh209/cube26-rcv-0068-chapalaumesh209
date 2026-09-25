import { db } from "../src/db/index";
import { 
  organizations, users, products, purchaseOrders, poLines, shipments, units, 
  inspections, inspectionChecks, inspectionPhotos, evidenceRecords, overrides, auditEvents 
} from "../src/db/schema";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import Papa from "papaparse";

async function run() {
  console.log("Seeding database...");
  
  // 1. Delete all existing data
  console.log("Cleaning existing data...");
  await db.delete(auditEvents).execute();
  await db.delete(overrides).execute();
  await db.delete(evidenceRecords).execute();
  await db.delete(inspectionPhotos).execute();
  await db.delete(inspectionChecks).execute();
  await db.delete(inspections).execute();
  await db.delete(units).execute();
  await db.delete(shipments).execute();
  await db.delete(poLines).execute();
  await db.delete(purchaseOrders).execute();
  await db.delete(products).execute();
  await db.delete(users).execute();
  await db.delete(organizations).execute();

  // 2. Create Organizations
  console.log("Creating organizations...");
  const orgAlphaId = "org_demo_alpha";
  const orgBravoId = "org_demo_bravo";
  
  const now = new Date();

  await db.insert(organizations).values([
    { id: orgAlphaId, name: "Alpha Corp", slug: "alpha", createdAt: now },
    { id: orgBravoId, name: "Bravo Inc", slug: "bravo", createdAt: now }
  ]).execute();

  // 3. Create Demo Users
  console.log("Creating demo users...");
  const passwordHash = bcrypt.hashSync("demo123", 10);

  const demoUsers: Array<{
    id: string;
    orgId: string;
    email: string;
    role: "operator" | "reviewer" | "admin" | "evaluator";
    fullName: string;
    passwordHash: string;
    createdAt: Date;
  }> = [
    { id: uuidv4(), orgId: orgAlphaId, email: "admin@alpha.com", role: "admin", fullName: "Admin User", passwordHash, createdAt: now },
    { id: uuidv4(), orgId: orgAlphaId, email: "operator@alpha.com", role: "operator", fullName: "Operator Alpha", passwordHash, createdAt: now },
    { id: uuidv4(), orgId: orgAlphaId, email: "lead@alpha.com", role: "reviewer", fullName: "Lead Reviewer", passwordHash, createdAt: now },
    { id: uuidv4(), orgId: orgBravoId, email: "operator@bravo.com", role: "operator", fullName: "Operator Bravo", passwordHash, createdAt: now },
    { id: uuidv4(), orgId: orgAlphaId, email: "evaluator@alpha.com", role: "evaluator", fullName: "Evaluator", passwordHash, createdAt: now }
  ];

  await db.insert(users).values(demoUsers).execute();

  // Parse CSV
  console.log("Parsing CSV...");
  const csvPath = path.join(process.cwd(), "receiving_sample.csv");
  const csvContent = fs.readFileSync(csvPath, "utf-8");
  
  const parsed = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  const rows = parsed.data as any[];
  console.log(`Found ${rows.length} rows in CSV.`);

  // Keep track of unique entities
  const productsMap = new Map();
  const poMap = new Map();
  const poLineMap = new Map();
  const shipmentsMap = new Map();
  const operatorsMap = new Map();

  for (const row of rows) {
    const orgId = row.org_id;
    
    // Check missing operator
    if (!operatorsMap.has(row.operator_id)) {
      const opId = row.operator_id;
      // create dynamically just in case it doesn't match our demo users
      const email = `${opId}@demo.com`;
      try {
        await db.insert(users).values({
          id: opId,
          orgId,
          email,
          fullName: opId,
          role: "operator",
          passwordHash,
          createdAt: now
        }).execute();
      } catch {
        // user might already exist
      }
      operatorsMap.set(opId, opId);
    }

    // Products
    const prodKey = `${orgId}_${row.sku}`;
    let prodId = productsMap.get(prodKey);
    if (!prodId) {
      prodId = uuidv4();
      let componentsJson = null;
      if (row.spec_components) {
        componentsJson = JSON.stringify(row.spec_components.split(";").map((s: string) => s.trim()));
      }
      await db.insert(products).values({
        id: prodId,
        orgId,
        sku: row.sku,
        asin: row.asin || null,
        title: row.product_title || null,
        colour: row.spec_colour !== "n/a" ? row.spec_colour : null,
        variant: row.spec_variant !== "n/a" ? row.spec_variant : null,
        componentsJson,
        createdAt: now
      }).execute();
      productsMap.set(prodKey, prodId);
    }

    // Purchase Orders
    const poKey = `${orgId}_${row.po_number}`;
    let poId = poMap.get(poKey);
    if (!poId) {
      poId = uuidv4();
      await db.insert(purchaseOrders).values({
        id: poId,
        orgId,
        poNumber: row.po_number,
        supplier: row.supplier,
        createdAt: now
      }).execute();
      poMap.set(poKey, poId);

      // Create one shipment per PO
      const shipmentId = uuidv4();
      await db.insert(shipments).values({
        id: shipmentId,
        orgId,
        poId,
        shipmentRef: `SHIP-${row.po_number}`,
        createdAt: now
      }).execute();
      shipmentsMap.set(poKey, shipmentId);
    }

    const shipmentId = shipmentsMap.get(poKey);

    // PO Lines
    const poLineKey = `${poKey}_${row.po_line}`;
    let poLineId = poLineMap.get(poLineKey);
    if (!poLineId) {
      poLineId = uuidv4();
      await db.insert(poLines).values({
        id: poLineId,
        poId,
        orgId,
        lineNumber: parseInt(row.po_line, 10),
        productId: prodId,
        qtyOrdered: parseInt(row.qty_ordered, 10),
        cartonsOrdered: parseInt(row.cartons_ordered, 10),
        unitsPerCarton: parseInt(row.units_per_carton_ordered, 10),
        createdAt: now
      }).execute();
      poLineMap.set(poLineKey, poLineId);
    }

    // Units
    const unitIdStr = uuidv4();
    await db.insert(units).values({
      id: unitIdStr,
      orgId,
      shipmentId,
      poLineId,
      unitCode: row.unit_id,
      sku: row.sku,
      status: "completed",
      createdAt: now
    }).execute();

    // Calculate verdict
    const mapDamage = (val: string) => {
      if (val === 'none') return 'pass';
      if (['crushing', 'water', 'tears'].includes(val)) return 'fail';
      return 'uncertain';
    };
    
    const mapIdentity = (val: string) => {
      if (val === 'yes') return 'pass';
      if (val === 'no') return 'fail';
      return 'uncertain';
    };

    const cIdentity = mapIdentity(row.identity_match);
    const cQuantity = parseInt(row.qty_ordered, 10) === parseInt(row.qty_received, 10) ? 'pass' : 'fail';
    const cCartonCount = parseInt(row.cartons_ordered, 10) === parseInt(row.cartons_received, 10) ? 'pass' : 'fail';
    const cUnitsPerCarton = parseInt(row.units_per_carton_ordered, 10) === parseInt(row.units_per_carton_counted, 10) ? 'pass' : 'fail';
    const cCartonDamage = mapDamage(row.carton_damage);
    const cUnitDamage = mapDamage(row.unit_damage);

    const checkVals = [cIdentity, cQuantity, cCartonCount, cUnitsPerCarton, cCartonDamage, cUnitDamage];
    let overallVerdict = "pass";
    if (checkVals.includes("fail")) overallVerdict = "exception";
    else if (checkVals.includes("uncertain")) overallVerdict = "uncertain";

    const capturedAt = row.captured_at ? new Date(row.captured_at) : now;

    // Inspections
    const inspectionId = uuidv4();
    await db.insert(inspections).values({
      id: inspectionId,
      orgId,
      unitId: unitIdStr,
      operatorId: row.operator_id,
      status: "completed",
      overallVerdict: overallVerdict as any,
      startedAt: new Date(capturedAt.getTime() - 60000),
      completedAt: capturedAt,
      createdAt: now
    }).execute();

    // Inspection Checks
    const checksToInsert = [
      { id: uuidv4(), inspectionId, checkKey: "identity", verdict: cIdentity as any, createdAt: now },
      { id: uuidv4(), inspectionId, checkKey: "quantity", verdict: cQuantity as any, createdAt: now },
      { id: uuidv4(), inspectionId, checkKey: "carton_count", verdict: cCartonCount as any, createdAt: now },
      { id: uuidv4(), inspectionId, checkKey: "units_per_carton", verdict: cUnitsPerCarton as any, createdAt: now },
      { id: uuidv4(), inspectionId, checkKey: "carton_damage", verdict: cCartonDamage as any, createdAt: now },
      { id: uuidv4(), inspectionId, checkKey: "unit_damage", verdict: cUnitDamage as any, createdAt: now }
    ];
    await db.insert(inspectionChecks).values(checksToInsert).execute();

    // Photos
    if (row.photo_refs) {
      const photos = row.photo_refs.split(";").map((p: string) => p.trim());
      const photosToInsert = photos.map((p: string) => ({
        id: uuidv4(),
        orgId,
        inspectionId,
        objectKey: p,
        capturedAt,
        createdAt: now
      }));
      if (photosToInsert.length > 0) {
        await db.insert(inspectionPhotos).values(photosToInsert).execute();
      }
    }
  }

  console.log("Seeding completed successfully.");
}

run().catch(err => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
