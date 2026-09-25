import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import { db } from '@/db';
import { shipments, purchaseOrders, units } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

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

    const [shipment] = await db
      .select()
      .from(shipments)
      .where(and(eq(shipments.id, params.id), eq(shipments.orgId, session.orgId)));

    if (!shipment) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }

    let po = null;
    if (shipment.poId) {
      const [order] = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, shipment.poId));
      po = order;
    }

    const unitsList = await db
      .select()
      .from(units)
      .where(eq(units.shipmentId, shipment.id));

    return NextResponse.json({
      shipment: {
        id: shipment.id,
        ref: shipment.shipmentRef,
        poNumber: po?.poNumber,
        supplier: po?.supplier,
        status: shipment.status,
        date: shipment.createdAt ? new Date(shipment.createdAt).toISOString() : null,
      },
      units: unitsList.map((u) => ({
        id: u.id,
        unitCode: u.unitCode,
        sku: u.sku,
        status: u.status,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
