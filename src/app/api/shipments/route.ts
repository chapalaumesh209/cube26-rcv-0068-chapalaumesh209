import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import { db } from '@/db';
import { shipments, purchaseOrders, units } from '@/db/schema';
import { eq, and, like, desc, count } from 'drizzle-orm';
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
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    const conditions = [eq(shipments.orgId, session.orgId)];
    if (status) conditions.push(eq(shipments.status, status as any));
    if (search) conditions.push(like(shipments.shipmentRef, `%${search}%`));

    const whereClause = and(...conditions);

    const [totalRes] = await db
      .select({ count: count() })
      .from(shipments)
      .where(whereClause);

    const rawShipments = await db
      .select({
        id: shipments.id,
        ref: shipments.shipmentRef,
        status: shipments.status,
        createdAt: shipments.createdAt,
        poNumber: purchaseOrders.poNumber,
        supplier: purchaseOrders.supplier,
      })
      .from(shipments)
      .leftJoin(purchaseOrders, eq(shipments.poId, purchaseOrders.id))
      .where(whereClause)
      .orderBy(desc(shipments.createdAt))
      .limit(limit)
      .offset(offset);

    // Get unit counts
    const allUnits = await db
      .select({ shipmentId: units.shipmentId })
      .from(units)
      .where(eq(units.orgId, session.orgId));

    const unitCountMap = new Map<string, number>();
    for (const u of allUnits) {
      if (u.shipmentId) {
        unitCountMap.set(u.shipmentId, (unitCountMap.get(u.shipmentId) || 0) + 1);
      }
    }

    const formatted = rawShipments.map((s) => ({
      id: s.id,
      ref: s.ref || s.poNumber || 'SHIP-DEFAULT',
      supplier: s.supplier?.replace(' (DUMMY)', '') || 'Unknown Supplier',
      status: s.status || 'active',
      units: unitCountMap.get(s.id) || 1,
      date: s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'Recent',
    }));

    return NextResponse.json({
      shipments: formatted,
      total: totalRes?.count || formatted.length,
    });
  } catch (error) {
    console.error('Error fetching shipments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionFromRequest();
    if (!session || session.role === 'evaluator') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { poId, shipmentRef } = await request.json();
    const newId = uuidv4();
    const now = new Date();

    const [shipment] = await db.insert(shipments).values({
      id: newId,
      orgId: session.orgId,
      poId,
      shipmentRef: shipmentRef || `SHIP-${Date.now()}`,
      status: 'in_transit',
      createdAt: now,
    }).returning();

    return NextResponse.json(shipment);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
