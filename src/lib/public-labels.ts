export const OBSERVATION_ENGINE_ID = "obs-engine-v1";

export function orgDisplayName(orgId?: string | null): string {
  if (orgId === "org_demo_alpha") return "Alpha Logistics";
  if (orgId === "org_demo_bravo") return "Bravo Fulfillment";
  return orgId || "Organization";
}

export function redactModelFields<T>(value: T): T {
  if (value == null) return value;
  if (typeof value === "string") {
    if (/gemini|qwen|openrouter|mock-vlm|gpt-|claude|vlm/i.test(value)) {
      return OBSERVATION_ENGINE_ID as T;
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => redactModelFields(item)) as T;
  }
  if (typeof value === "object") {
    const next: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (/model/i.test(key) && typeof nested === "string") {
        next[key] = OBSERVATION_ENGINE_ID;
      } else {
        next[key] = redactModelFields(nested);
      }
    }
    return next as T;
  }
  return value;
}
