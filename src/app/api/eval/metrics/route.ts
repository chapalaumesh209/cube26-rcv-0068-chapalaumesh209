import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import * as fs from "fs";
import * as path from "path";

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

  let report = null;

  try {
    const reportPath = path.join(process.cwd(), "data", "eval", "report.json");
    if (fs.existsSync(reportPath)) {
      report = JSON.parse(fs.readFileSync(reportPath, "utf-8"));
    }
  } catch (err) {
    console.warn("Could not read report.json:", err);
  }

  return NextResponse.json({ report });
}
