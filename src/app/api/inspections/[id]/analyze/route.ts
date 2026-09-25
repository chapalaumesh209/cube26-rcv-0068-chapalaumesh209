import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import { db } from '@/db';
import { 
  inspections, 
  units, 
  poLines, 
  products, 
  inspectionChecks, 
  evidenceRecords,
  inspectionPhotos,
  organizations 
} from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { runMockInspection } from '@/lib/agents/mock-vlm';
import { 
  computeOverallVerdict,
  computeIdentityVerdict,
  computeQuantityVerdict,
  computeCartonVerdict,
  computeVariantVerdict,
  computeDamageVerdict,
  computeComponentVerdict,
  CheckResult
} from '@/lib/rules/decision-engine';
import { buildEvidenceRecord } from '@/lib/evidence/builder';
import { v4 as uuidv4 } from 'uuid';

async function getSessionFromRequest() {
  const cookieStore = await cookies();
  const token = cookieStore.get('dockproof-session')?.value;
  if (!token) return null;
  try {
    return await verifySession(token);
  } catch {
    return null;
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionFromRequest();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const inspectionId = params.id;

    const [inspection] = await db
      .select()
      .from(inspections)
      .where(and(eq(inspections.id, inspectionId), eq(inspections.orgId, session.orgId)));

    if (!inspection) {
      return NextResponse.json({ error: 'Inspection not found' }, { status: 404 });
    }

    const [unit] = await db
      .select()
      .from(units)
      .where(eq(units.id, inspection.unitId));

    let poLine: any = null;
    let product: any = null;

    if (unit?.poLineId) {
      const [line] = await db.select().from(poLines).where(eq(poLines.id, unit.poLineId));
      poLine = line;
      if (line?.productId) {
        const [prod] = await db.select().from(products).where(eq(products.id, line.productId));
        product = prod;
      }
    }

    if (!product && unit?.sku) {
      const [prod] = await db
        .select()
        .from(products)
        .where(and(eq(products.sku, unit.sku), eq(products.orgId, session.orgId)));
      product = prod;
    }

    const expectedState = {
      sku: unit?.sku || product?.sku || 'SKU-UNKNOWN',
      quantity: poLine?.qtyOrdered || 24,
      cartons: poLine?.cartonsOrdered || 2,
      unitsPerCarton: poLine?.unitsPerCarton || 12,
      colour: product?.colour || 'Standard',
      variant: product?.variant || 'Standard',
      components: product?.componentsJson ? JSON.parse(product.componentsJson) : ['Main Unit', 'Accessory', 'Manual'],
    };

    let observation: any;
    let failOpen = false;

    try {
      observation = await runMockInspection(expectedState, unit);
    } catch {
      failOpen = true;
    }

    if (failOpen) {
      await db.update(inspections)
        .set({ status: 'failed', failOpen: true })
        .where(eq(inspections.id, inspectionId));
        
      return NextResponse.json({ success: true, message: 'Inspection marked as failed open' });
    }

    // Run deterministic decision engine over observations
    const checks: CheckResult[] = [
      computeIdentityVerdict(observation.identity, expectedState.sku),
      computeQuantityVerdict(expectedState.quantity, observation.quantity.observed_quantity, observation.quantity.occluded),
      computeCartonVerdict(expectedState.cartons, observation.cartons.observed_cartons),
      {
        checkKey: 'units_per_carton',
        verdict: observation.units_per_carton.verdict,
        confidence: observation.units_per_carton.confidence,
        detail: { expected: expectedState.unitsPerCarton, observed: observation.units_per_carton.observed_units_per_carton }
      },
      computeVariantVerdict(observation.variant, expectedState.colour, expectedState.variant),
      computeDamageVerdict(observation.damage),
      computeComponentVerdict(observation.components, expectedState.components),
    ];

    const overallVerdict = computeOverallVerdict(checks);
    const now = new Date();

    // Remove any previous checks for this inspection
    await db.delete(inspectionChecks).where(eq(inspectionChecks.inspectionId, inspectionId));

    // Insert new checks
    for (const check of checks) {
      await db.insert(inspectionChecks).values({
        id: uuidv4(),
        inspectionId,
        checkKey: check.checkKey,
        verdict: check.verdict,
        confidence: check.confidence,
        detailJson: JSON.stringify(check.detail),
        modelVersion: 'dockproof-vlm-v1',
        latencyMs: observation.metadata?.latency_ms || 1100,
        createdAt: now,
      });
    }

    // Update inspection
    await db.update(inspections)
      .set({ 
        status: 'completed', 
        overallVerdict: overallVerdict as any,
        completedAt: now,
        modelVersion: 'dockproof-vlm-v1',
      })
      .where(eq(inspections.id, inspectionId));

    // Build sealed evidence record
    const photos = await db.select().from(inspectionPhotos).where(eq(inspectionPhotos.inspectionId, inspectionId));
    const [org] = await db.select().from(organizations).where(eq(organizations.id, session.orgId));
    
    const evidencePayload = buildEvidenceRecord(
      { ...inspection, overallVerdict, completedAt: now, status: 'completed' },
      checks,
      photos,
      [],
      unit || { unitCode: 'UNIT-UNKNOWN', sku: expectedState.sku },
      org || { id: session.orgId }
    );

    // Save or update evidence record
    await db.delete(evidenceRecords).where(eq(evidenceRecords.inspectionId, inspectionId));
    await db.insert(evidenceRecords).values({
      id: uuidv4(),
      orgId: session.orgId,
      inspectionId,
      schemaVersion: 'rcv.v1',
      payloadJson: JSON.stringify(evidencePayload),
      contentHash: evidencePayload.content_hash,
      createdAt: now,
    });

    return NextResponse.json({
      success: true,
      overallVerdict,
      checksCount: checks.length,
      contentHash: evidencePayload.content_hash,
    });

  } catch (error) {
    console.error('Error during inspection analysis:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
