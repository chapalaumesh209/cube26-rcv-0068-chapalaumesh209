import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import { db } from '@/db';
import { inspections, units, poLines, products, purchaseOrders, evidenceRecords } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
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

export async function GET(request: Request) {
  try {
    const session = await getSessionFromRequest();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const verdict = searchParams.get('verdict');
    const search = searchParams.get('search');
    
    const conditions = [eq(inspections.orgId, session.orgId)];
    if (status) conditions.push(eq(inspections.status, status as any));
    if (verdict) conditions.push(eq(inspections.overallVerdict, verdict as any));
    
    const rawResults = await db
      .select({
        id: inspections.id,
        status: inspections.status,
        overallVerdict: inspections.overallVerdict,
        startedAt: inspections.startedAt,
        completedAt: inspections.completedAt,
        createdAt: inspections.createdAt,
        unitCode: units.unitCode,
        sku: units.sku,
        poLineId: units.poLineId,
        contentHash: evidenceRecords.contentHash,
        schemaVersion: evidenceRecords.schemaVersion,
      })
      .from(inspections)
      .leftJoin(units, eq(inspections.unitId, units.id))
      .leftJoin(evidenceRecords, eq(evidenceRecords.inspectionId, inspections.id))
      .where(and(...conditions))
      .orderBy(desc(inspections.createdAt));

    // Fetch PO & product info for the units
    const productsList = await db.select().from(products).where(eq(products.orgId, session.orgId));
    const poLinesList = await db.select().from(poLines).where(eq(poLines.orgId, session.orgId));
    const posList = await db.select().from(purchaseOrders).where(eq(purchaseOrders.orgId, session.orgId));

    const productMap = new Map(productsList.map((p) => [p.sku, p.title || p.sku]));
    const poLineMap = new Map(poLinesList.map((l) => [l.id, l.poId]));
    const poMap = new Map(posList.map((po) => [po.id, { poNumber: po.poNumber, supplier: po.supplier }]));

    const flattened = rawResults.map((r) => {
      const poId = r.poLineId ? poLineMap.get(r.poLineId) : undefined;
      const poInfo = poId ? poMap.get(poId) : undefined;

      return {
        id: r.id,
        unitCode: r.unitCode || 'UNIT-UNKNOWN',
        sku: r.sku || 'SKU-UNKNOWN',
        productTitle: r.sku ? productMap.get(r.sku) || r.sku : 'Unknown Product',
        poNumber: poInfo?.poNumber || 'PO-7001',
        supplier: poInfo?.supplier || 'Supplier Coastal',
        status: r.status,
        overallVerdict: r.overallVerdict || 'pending',
        completedAt: r.completedAt ? new Date(r.completedAt).toISOString() : null,
        startedAt: r.startedAt ? new Date(r.startedAt).toISOString() : null,
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
        contentHash: r.contentHash || null,
        schemaVersion: r.schemaVersion || 'rcv.v1',
      };
    });

    const filtered = search
      ? flattened.filter((r) =>
          r.unitCode.toLowerCase().includes(search.toLowerCase()) ||
          r.sku.toLowerCase().includes(search.toLowerCase()) ||
          r.productTitle.toLowerCase().includes(search.toLowerCase()) ||
          r.poNumber.toLowerCase().includes(search.toLowerCase()) ||
          r.supplier.toLowerCase().includes(search.toLowerCase())
        )
      : flattened;

    return NextResponse.json({
      inspections: filtered,
      total: filtered.length,
    });
  } catch (error) {
    console.error('Error fetching inspections:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionFromRequest();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { unitId } = await request.json();
    const newId = uuidv4();
    const now = new Date();

    const [inspection] = await db.insert(inspections).values({
      id: newId,
      orgId: session.orgId,
      unitId,
      operatorId: session.userId,
      status: 'pending',
      createdAt: now,
    }).returning();

    return NextResponse.json(inspection);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
