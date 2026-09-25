import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { db } from "@/db";
import { auditEvents } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

async function getSessionFromRequest() {
  const cookieStore = await cookies();
  const token = cookieStore.get("dockproof-session")?.value;
  if (!token) return null;
  try {
    return await verifySession(token);
  } catch {
    return null;
  }
}

export async function GET() {
  const session = await getSessionFromRequest();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const events = await db
    .select()
    .from(auditEvents)
    .where(eq(auditEvents.orgId, session.orgId))
    .orderBy(desc(auditEvents.createdAt))
    .limit(100);

  return NextResponse.json({ events, total: events.length });
}
