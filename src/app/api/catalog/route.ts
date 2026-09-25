import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq, like, or } from "drizzle-orm";

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

export async function GET(request: Request) {
  const session = await getSessionFromRequest();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";

  let query = db.select().from(products).where(eq(products.orgId, session.orgId));

  const result = await query;

  const filtered = search
    ? result.filter(
        (p) =>
          p.sku.toLowerCase().includes(search.toLowerCase()) ||
          (p.title ? p.title.toLowerCase().includes(search.toLowerCase()) : false)
      )
    : result;

  return NextResponse.json({ products: filtered, total: filtered.length });
}
