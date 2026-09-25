import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { db } from "@/db";
import { shipments, purchaseOrders, units, inspections } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import Papa from "papaparse";

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

export async function POST(request: Request) {
  const session = await getSessionFromRequest();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.role === "evaluator") {
    return NextResponse.json({ error: "Evaluators cannot import" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const text = await file.text();
    const { data, errors } = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h: string) => h.trim(),
    });

    if (errors.length > 0) {
      return NextResponse.json({ error: "CSV parse errors", details: errors.slice(0, 5) }, { status: 400 });
    }

    const rows = data as Record<string, string>[];
    let imported = 0;

    for (const row of rows) {
      const poNumber = row.po_number?.trim();
      if (!poNumber) continue;

      // Check if PO exists for this org
      const existingPO = await db
        .select()
        .from(purchaseOrders)
        .where(
          and(
            eq(purchaseOrders.orgId, session.orgId),
            eq(purchaseOrders.poNumber, poNumber)
          )
        );

      let poId: string;
      if (existingPO.length > 0) {
        poId = existingPO[0].id;
      } else {
        poId = uuidv4();
        await db.insert(purchaseOrders).values({
          id: poId,
          orgId: session.orgId,
          poNumber,
          supplier: row.supplier?.trim() || "Unknown",
          status: "active",
          createdAt: new Date(),
        });
      }

      // Create shipment
      const shipmentId = uuidv4();
      await db.insert(shipments).values({
        id: shipmentId,
        orgId: session.orgId,
        poId,
        shipmentRef: `SHP-${Date.now()}-${imported}`,
        status: "in_transit",
        createdAt: new Date(),
      });

      imported++;
    }

    return NextResponse.json({
      success: true,
      imported,
      total: rows.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Import failed", details: String(error) },
      { status: 500 }
    );
  }
}
