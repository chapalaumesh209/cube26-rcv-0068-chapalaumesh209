import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import { db } from '@/db';
import { inspections, overrides, auditEvents } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
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
    if (!session || (session.role !== 'reviewer' && session.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized. Reviewer or Admin role required.' }, { status: 403 });
    }

    const { newVerdict, reason } = await request.json();
    const inspectionId = params.id;

    if (!newVerdict || !reason) {
      return NextResponse.json({ error: 'newVerdict and reason are required' }, { status: 400 });
    }

    const [currentInspection] = await db
      .select()
      .from(inspections)
      .where(and(eq(inspections.id, inspectionId), eq(inspections.orgId, session.orgId)));

    if (!currentInspection) {
      return NextResponse.json({ error: 'Inspection not found' }, { status: 404 });
    }

    const originalVerdict = currentInspection.overallVerdict || 'pending';
    const now = new Date();

    // 1. Record override without modifying or erasing original AI verdict history
    await db.insert(overrides).values({
      id: uuidv4(),
      inspectionId,
      orgId: session.orgId,
      actorId: session.userId,
      originalVerdict,
      newVerdict,
      reason,
      createdAt: now,
    });

    // 2. Update inspection overall verdict
    await db.update(inspections)
      .set({ overallVerdict: newVerdict })
      .where(eq(inspections.id, inspectionId));

    // 3. Log audit event
    await db.insert(auditEvents).values({
      id: uuidv4(),
      orgId: session.orgId,
      actorId: session.userId,
      eventType: 'OVERRIDE_VERDICT',
      objectType: 'inspection',
      objectId: inspectionId,
      payloadHash: `override:${originalVerdict}->${newVerdict}`,
      createdAt: now,
    });

    return NextResponse.json({
      success: true,
      originalVerdict,
      newVerdict,
      reason,
      overriddenAt: now.toISOString(),
    });

  } catch (error) {
    console.error('Error recording override:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
