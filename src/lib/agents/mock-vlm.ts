import { InspectionObservationType, Verdict } from './observation-schema';

function stableNumber(value: string): number {
  let hash = 2166136261;
  for (const character of value) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return hash >>> 0;
}

function demoVerdict(unitCode: string, check: string): Verdict {
  const value = stableNumber(`${unitCode}:${check}`) % 29;
  return value === 0 || value === 1 ? 'fail' : value === 2 || value === 3 ? 'uncertain' : 'pass';
}

function damageVerdict(value: unknown, fallback: Verdict): Verdict {
  if (typeof value !== 'string') return fallback;
  if (value === 'uncertain') return 'uncertain';
  return value === 'none' || value === '' ? 'pass' : 'fail';
}

/** Stable fixture observations for offline demos. This never reads or infers from photographs. */
export async function runMockInspection(expectedState: any, unitData: any, csvRecord?: any): Promise<InspectionObservationType> {
  const unitCode = String(expectedState.unitCode || unitData?.unitCode || expectedState.sku || 'demo-unit');
  const result = (check: string): Verdict => demoVerdict(unitCode, check);
  const identity: Verdict = csvRecord?.identity_match === 'no' ? 'fail' : csvRecord?.identity_match === 'uncertain' ? 'uncertain' : csvRecord ? 'pass' : result('identity');
  const quantity: Verdict = csvRecord ? (Number(csvRecord.qty_ordered) === Number(csvRecord.qty_received) ? 'pass' : 'fail') : result('quantity');
  const cartons: Verdict = csvRecord ? (Number(csvRecord.cartons_ordered) === Number(csvRecord.cartons_received) ? 'pass' : 'fail') : result('cartons');
  const unitsPerCarton: Verdict = csvRecord ? (Number(csvRecord.units_per_carton_ordered) === Number(csvRecord.units_per_carton_counted) ? 'pass' : 'fail') : result('units_per_carton');
  const variant: Verdict = csvRecord ? (String(csvRecord.quality_flags || '').includes('wrong variant') ? 'fail' : 'pass') : result('variant');
  const cartonDamage = damageVerdict(csvRecord?.carton_damage, result('carton_damage'));
  const unitDamage = damageVerdict(csvRecord?.unit_damage, result('unit_damage'));
  const components: Verdict = csvRecord ? (String(csvRecord.quality_flags || '').includes('missing component') ? 'fail' : 'pass') : result('components');

  const makeDamage = (verdict: Verdict, subject: string) => ({
    verdict,
    confidence: verdict === 'uncertain' ? 0.45 : 0.88,
    damage_type: (verdict === 'fail' ? (subject === 'carton' ? 'crushed' : 'other') : verdict === 'pass' ? 'none' : null) as 'crushed' | 'other' | 'none' | null,
    severity: verdict === 'fail' ? 'moderate' as const : null,
    reason: `Offline fixture: ${subject} condition ${verdict}. No photograph was analyzed.`,
    evidence: [],
  });

  return {
    identity: {
      verdict: identity, confidence: identity === 'uncertain' ? 0.42 : 0.91,
      observed_sku: identity === 'fail' ? `${expectedState.sku}-MISMATCH` : identity === 'uncertain' ? null : expectedState.sku,
      label_readable: identity !== 'uncertain',
      reason: `Offline fixture: identity ${identity}. No label was read.`, evidence: [],
    },
    quantity: {
      verdict: quantity, confidence: quantity === 'uncertain' ? 0.4 : 0.9,
      observed_quantity: quantity === 'uncertain' ? null : csvRecord ? Number(csvRecord.qty_received) : quantity === 'fail' ? Math.max(0, expectedState.quantity - 1) : expectedState.quantity,
      occluded: quantity === 'uncertain', reason: `Offline fixture: quantity ${quantity}. No units were visually counted.`, evidence: [],
    },
    cartons: {
      verdict: cartons, confidence: cartons === 'uncertain' ? 0.4 : 0.9,
      observed_cartons: cartons === 'uncertain' ? null : csvRecord ? Number(csvRecord.cartons_received) : cartons === 'fail' ? Math.max(0, expectedState.cartons - 1) : expectedState.cartons,
      reason: `Offline fixture: carton count ${cartons}.`, evidence: [],
    },
    units_per_carton: {
      verdict: unitsPerCarton, confidence: unitsPerCarton === 'uncertain' ? 0.4 : 0.86,
      observed_units_per_carton: unitsPerCarton === 'uncertain' ? null : csvRecord ? Number(csvRecord.units_per_carton_counted) : unitsPerCarton === 'fail' ? Math.max(0, expectedState.unitsPerCarton - 1) : expectedState.unitsPerCarton,
      reason: `Offline fixture: units per carton ${unitsPerCarton}.`, evidence: [],
    },
    variant: {
      verdict: variant, confidence: variant === 'uncertain' ? 0.44 : 0.91,
      observed_colour: variant === 'uncertain' ? null : variant === 'fail' ? 'Different colour' : expectedState.colour,
      observed_variant: variant === 'uncertain' ? null : variant === 'fail' ? 'Different variant' : expectedState.variant,
      reason: `Offline fixture: variant ${variant}.`, evidence: [],
    },
    carton_damage: makeDamage(cartonDamage, 'carton'),
    unit_damage: makeDamage(unitDamage, 'unit'),
    components: {
      verdict: components, confidence: components === 'uncertain' ? 0.43 : 0.88,
      components: (expectedState.components || []).map((name: string, index: number) => ({ name, status: components === 'fail' && index === 0 ? 'missing' as const : components === 'uncertain' ? 'uncertain' as const : 'present' as const, visible: components !== 'uncertain' })),
      reason: `Offline fixture: components ${components}.`, evidence: [],
    },
    metadata: { model_version: 'mock-fixture-v1', latency_ms: 0 },
  };
}
