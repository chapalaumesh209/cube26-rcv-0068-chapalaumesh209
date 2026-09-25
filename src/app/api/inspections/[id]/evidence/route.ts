import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import { db } from '@/db';
import { 
  inspections, 
  evidenceRecords, 
  units, 
  inspectionChecks, 
  inspectionPhotos, 
  overrides,
  organizations 
} from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { buildEvidenceRecord } from '@/lib/evidence/builder';

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

    // Try finding existing evidence record
    const [existingEvidence] = await db
      .select()
      .from(evidenceRecords)
      .where(eq(evidenceRecords.inspectionId, inspection.id));

    if (existingEvidence?.payloadJson) {
      try {
        const payload = JSON.parse(existingEvidence.payloadJson);
        return NextResponse.json({ evidence: payload });
      } catch {
        // Fallback to building fresh
      }
    }

    // Build fresh evidence record
    const [unit] = await db.select().from(units).where(eq(units.id, inspection.unitId));
    const [org] = await db.select().from(organizations).where(eq(organizations.id, session.orgId));
    const checks = await db.select().from(inspectionChecks).where(eq(inspectionChecks.inspectionId, inspection.id));
    const photos = await db.select().from(inspectionPhotos).where(eq(inspectionPhotos.inspectionId, inspection.id));
    const overridesList = await db.select().from(overrides).where(eq(overrides.inspectionId, inspection.id));

    const evidencePayload = buildEvidenceRecord(
      inspection,
      checks,
      photos,
      overridesList,
      unit || { unitCode: 'UNIT-UNKNOWN', sku: 'SKU-UNKNOWN' },
      org || { id: session.orgId }
    );

    return NextResponse.json({ evidence: evidencePayload });
  } catch (error) {
    console.error('Error generating evidence:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
