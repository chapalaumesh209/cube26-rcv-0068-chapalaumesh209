import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { db } from "@/db";
import { inspections, inspectionChecks, units } from "@/db/schema";
import { eq, and } from "drizzle-orm";

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

export async function POST() {
  const session = await getSessionFromRequest();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get all completed inspections for this org
  const allInspections = await db
    .select()
    .from(inspections)
    .where(
      and(
        eq(inspections.orgId, session.orgId),
        eq(inspections.status, "completed")
      )
    );

  const totalUnits = allInspections.length;
  if (totalUnits === 0) {
    return NextResponse.json({
      summary: { total: 0, message: "No completed inspections to evaluate" },
    });
  }

  let passCount = 0;
  let exceptionCount = 0;
  let uncertainCount = 0;

  const checkStats: Record<string, { total: number; pass: number; fail: number; uncertain: number }> = {};
  const CHECK_KEYS = [
    "identity", "quantity", "carton_count", "units_per_carton",
    "variant", "carton_damage", "unit_damage", "components",
  ];

  CHECK_KEYS.forEach((key) => {
    checkStats[key] = { total: 0, pass: 0, fail: 0, uncertain: 0 };
  });

  for (const insp of allInspections) {
    if (insp.overallVerdict === "pass") passCount++;
    else if (insp.overallVerdict === "exception") exceptionCount++;
    else if (insp.overallVerdict === "uncertain") uncertainCount++;

    const checks = await db
      .select()
      .from(inspectionChecks)
      .where(eq(inspectionChecks.inspectionId, insp.id));

    for (const check of checks) {
      const key = check.checkKey;
      if (checkStats[key]) {
        checkStats[key].total++;
        if (check.verdict === "pass") checkStats[key].pass++;
        else if (check.verdict === "fail") checkStats[key].fail++;
        else if (check.verdict === "uncertain") checkStats[key].uncertain++;
      }
    }
  }

  const accuracy = totalUnits > 0 ? passCount / totalUnits : 0;
  const fpRate = totalUnits > 0 ? exceptionCount / totalUnits : 0;
  const fnRate = 0; // Would need ground truth labels
  const uncertainRate = totalUnits > 0 ? uncertainCount / totalUnits : 0;

  const perCheckAccuracy = Object.entries(checkStats).map(([key, stats]) => ({
    check: key,
    accuracy: stats.total > 0 ? stats.pass / stats.total : 0,
    passRate: stats.total > 0 ? stats.pass / stats.total : 0,
    failRate: stats.total > 0 ? stats.fail / stats.total : 0,
    uncertainRate: stats.total > 0 ? stats.uncertain / stats.total : 0,
    total: stats.total,
  }));

  return NextResponse.json({
    summary: {
      total: totalUnits,
      pass: passCount,
      exception: exceptionCount,
      uncertain: uncertainCount,
      accuracy: Math.round(accuracy * 10000) / 100,
      fpRate: Math.round(fpRate * 10000) / 100,
      fnRate: Math.round(fnRate * 10000) / 100,
      uncertainRate: Math.round(uncertainRate * 10000) / 100,
    },
    perCheckAccuracy,
    verdictDistribution: [
      { name: "Pass", value: passCount, color: "#10b981" },
      { name: "Exception", value: exceptionCount, color: "#f43f5e" },
      { name: "Uncertain", value: uncertainCount, color: "#f59e0b" },
    ],
  });
}

export async function GET() {
  const session = await getSessionFromRequest();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({ message: "Use POST to run evaluation" });
}
