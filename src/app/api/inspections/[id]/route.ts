import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import { db } from '@/db';
import { 
  inspections, 
  units, 
  poLines, 
  purchaseOrders, 
  products, 
  inspectionChecks, 
  inspectionPhotos, 
  evidenceRecords, 
  overrides 
} from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { OBSERVATION_ENGINE_ID, redactModelFields } from '@/lib/public-labels';

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

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionFromRequest();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [inspection] = await db
      .select()
      .from(inspections)
      .where(and(eq(inspections.id, params.id), eq(inspections.orgId, session.orgId)));

    if (!inspection) {
      return NextResponse.json({ error: 'Inspection not found' }, { status: 404 });
    }

    // Get unit
    const [unit] = await db
      .select()
      .from(units)
      .where(eq(units.id, inspection.unitId));

    // Get PO line & product
    let poLine: any = null;
    let product: any = null;
    let po: any = null;

    if (unit?.poLineId) {
      const [line] = await db.select().from(poLines).where(eq(poLines.id, unit.poLineId));
      poLine = line;
      if (line?.productId) {
        const [prod] = await db.select().from(products).where(eq(products.id, line.productId));
        product = prod;
      }
      if (line?.poId) {
        const [pOrder] = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, line.poId));
        po = pOrder;
      }
    }

    if (!product && unit?.sku) {
      const [prod] = await db
        .select()
        .from(products)
        .where(and(eq(products.sku, unit.sku), eq(products.orgId, session.orgId)));
      product = prod;
    }

    // Checks
    const checks = await db
      .select()
      .from(inspectionChecks)
      .where(eq(inspectionChecks.inspectionId, inspection.id));

    // Photos
    const photos = await db
      .select()
      .from(inspectionPhotos)
      .where(eq(inspectionPhotos.inspectionId, inspection.id));

    // Overrides
    const overridesList = await db
      .select()
      .from(overrides)
      .where(eq(overrides.inspectionId, inspection.id));

    // Evidence
    const [evidence] = await db
      .select()
      .from(evidenceRecords)
      .where(eq(evidenceRecords.inspectionId, inspection.id));

    const checkIconMap: Record<string, string> = {
      identity: 'Identity Match',
      quantity: 'Quantity Verified',
      carton_count: 'Carton Count',
      units_per_carton: 'Units Per Carton',
      variant: 'Variant Match',
      carton_damage: 'Carton Damage',
      unit_damage: 'Unit Damage',
      components: 'Component Checklist',
    };

    let parsedComponents: string[] = [];
    if (product?.componentsJson) {
      try {
        parsedComponents = JSON.parse(product.componentsJson);
      } catch {
        parsedComponents = [];
      }
    }

    return NextResponse.json({
      inspection: {
        id: inspection.id,
        unitCode: unit?.unitCode || 'UNIT-UNKNOWN',
        sku: unit?.sku || product?.sku || 'SKU-UNKNOWN',
        productTitle: product?.title || 'Unknown Product',
        poNumber: po?.poNumber || 'PO-UNKNOWN',
        supplier: po?.supplier || 'Supplier Unknown',
        status: inspection.status,
        overallVerdict: inspection.overallVerdict || 'pending',
        operatorId: inspection.operatorId,
        startedAt: inspection.startedAt ? new Date(inspection.startedAt).toISOString() : new Date().toISOString(),
        completedAt: inspection.completedAt ? new Date(inspection.completedAt).toISOString() : null,
        modelVersion: OBSERVATION_ENGINE_ID,
        latency_ms: checks[0]?.latencyMs || null,
        contentHash: evidence?.contentHash || null,
        failOpen: Boolean(inspection.failOpen),
        poLine: {
          qtyOrdered: poLine?.qtyOrdered || 24,
          cartonsOrdered: poLine?.cartonsOrdered || 2,
          unitsPerCarton: poLine?.unitsPerCarton || 12,
        },
        product: {
          colour: product?.colour || 'Standard',
          variant: product?.variant || 'Standard',
          asin: product?.asin || 'B0DUMMY',
          components: parsedComponents.length > 0 ? parsedComponents : ['Main Unit', 'Accessory', 'Manual'],
        },
        photos: photos.map((p) => ({
          id: p.id,
          url: p.objectKey
            ? (p.objectKey.startsWith('/') ? p.objectKey : `/fixtures/${p.objectKey}`)
            : '',
          role: p.role || 'Carton',
          sha256: p.sha256 || '',
        })),
        evidence: evidence?.payloadJson ? redactModelFields(JSON.parse(evidence.payloadJson)) : {},
        overrides: overridesList.map((o) => ({
          id: o.id,
          previousVerdict: o.originalVerdict,
          newVerdict: o.newVerdict,
          reason: o.reason || 'Manual override applied',
          timestamp: new Date(o.createdAt).toISOString(),
          operatorId: o.actorId,
        })),
        checks: checks.map((c) => ({
          id: c.id,
          name: checkIconMap[c.checkKey] || c.checkKey.replace('_', ' ').toUpperCase(),
          type: c.checkKey,
          verdict: c.verdict,
          confidence: Math.round((c.confidence || 0.92) * 100),
          detail: c.detailJson || `Check for ${c.checkKey} completed with status: ${c.verdict}.`,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching inspection detail:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
