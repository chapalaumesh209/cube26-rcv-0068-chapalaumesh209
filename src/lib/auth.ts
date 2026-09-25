import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const AUTH_SECRET = process.env.AUTH_SECRET || "dockproof-dev-secret-change-in-production";
const key = new TextEncoder().encode(AUTH_SECRET);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string, orgId: string, role: string): Promise<string> {
  return await new SignJWT({ userId, orgId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key);
}

export async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload as { userId: string; orgId: string; role: string };
  } catch (error) {
    return null;
  }
}

export function getSession(cookies: any) {
  return cookies.get("dockproof-session")?.value || null;
}
