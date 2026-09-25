import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("dockproof-session")?.value;

  let session = null;
  if (token) {
    try {
      session = await verifySession(token);
    } catch {
      session = null;
    }
  }

  if (!session) {
    redirect("/login");
  }

  if (session.role === "reviewer") redirect("/review");
  if (session.role === "evaluator") redirect("/evaluation");
  if (session.role === "admin") redirect("/shipments");
  redirect("/receiving");
}
