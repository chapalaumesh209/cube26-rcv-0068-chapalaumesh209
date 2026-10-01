import { describe, it, expect } from 'vitest';
import { 
  computeOverallVerdict,
  computeQuantityVerdict,
  computeCartonVerdict,
  computeUnitsPerCartonVerdict,
  computeIdentityVerdict,
  computeVariantVerdict,
  computeDamageVerdict,
  computeComponentVerdict,
  CheckResult
} from '@/lib/rules/decision-engine';

describe('Decision Engine - Overall Verdict Calculation', () => {
  it('returns PASS when all checks pass', () => {
    const checks: CheckResult[] = [
      { checkKey: 'identity', verdict: 'pass', confidence: 0.95, detail: {} },
      { checkKey: 'quantity', verdict: 'pass', confidence: 0.92, detail: {} },
      { checkKey: 'cartons', verdict: 'pass', confidence: 0.99, detail: {} },
      { checkKey: 'damage', verdict: 'pass', confidence: 0.90, detail: {} },
    ];
    expect(computeOverallVerdict(checks)).toBe('pass');
  });

  it('returns EXCEPTION when any check fails (No Masked Failures)', () => {
    const checks: CheckResult[] = [
      { checkKey: 'identity', verdict: 'pass', confidence: 0.95, detail: {} },
      { checkKey: 'quantity', verdict: 'fail', confidence: 0.92, detail: {} },
      { checkKey: 'cartons', verdict: 'pass', confidence: 0.99, detail: {} },
      { checkKey: 'damage', verdict: 'pass', confidence: 0.90, detail: {} },
    ];
    expect(computeOverallVerdict(checks)).toBe('exception');
  });

  it('returns UNCERTAIN when any check is uncertain and none failed', () => {
    const checks: CheckResult[] = [
      { checkKey: 'identity', verdict: 'pass', confidence: 0.95, detail: {} },
      { checkKey: 'quantity', verdict: 'uncertain', confidence: 0.50, detail: {} },
      { checkKey: 'cartons', verdict: 'pass', confidence: 0.99, detail: {} },
      { checkKey: 'damage', verdict: 'pass', confidence: 0.90, detail: {} },
    ];
    expect(computeOverallVerdict(checks)).toBe('uncertain');
  });

  it('prioritizes EXCEPTION over UNCERTAIN when both are present', () => {
    const checks: CheckResult[] = [
      { checkKey: 'identity', verdict: 'pass', confidence: 0.95, detail: {} },
      { checkKey: 'quantity', verdict: 'fail', confidence: 0.92, detail: {} },
      { checkKey: 'cartons', verdict: 'uncertain', confidence: 0.50, detail: {} },
      { checkKey: 'damage', verdict: 'pass', confidence: 0.90, detail: {} },
    ];
    expect(computeOverallVerdict(checks)).toBe('exception');
  });
});

describe('Individual Check Rules', () => {
  describe('Quantity Logic', () => {
    it('passes when observed equals expected', () => {
      const res = computeQuantityVerdict(24, 24, false);
      expect(res.verdict).toBe('pass');
    });

    it('fails on shortage when fully visible', () => {
      const res = computeQuantityVerdict(24, 20, false);
      expect(res.verdict).toBe('fail');
    });

    it('fails on overage (extra units)', () => {
      const res = computeQuantityVerdict(24, 28, false);
      expect(res.verdict).toBe('fail');
    });

    it('returns UNCERTAIN when partial occlusion prevents verification', () => {
      const res = computeQuantityVerdict(24, 18, true);
      expect(res.verdict).toBe('uncertain');
    });
  });

  it('does not accept a readable SKU that differs from the PO', () => {
    const result = computeIdentityVerdict({ verdict: 'pass', confidence: 0.99, observed_sku: 'SKU-WRONG', label_readable: true, reason: 'OCR result' }, 'SKU-ORDERED');
    expect(result.verdict).toBe('fail');
  });

  it('checks units per carton from the observed count rather than the model verdict', () => {
    expect(computeUnitsPerCartonVerdict(12, 10).verdict).toBe('fail');
    expect(computeUnitsPerCartonVerdict(12, undefined).verdict).toBe('uncertain');
  });

  describe('Damage Logic', () => {
    it('passes when no damage is detected', () => {
      const res = computeDamageVerdict({
        verdict: 'pass',
        confidence: 0.95,
        damage_type: 'none',
        reason: 'Clean carton surface'
      });
      expect(res.verdict).toBe('pass');
    });

    it('fails when visible crushing is observed', () => {
      const res = computeDamageVerdict({
        verdict: 'fail',
        confidence: 0.92,
        damage_type: 'crushed',
        severity: 'major',
        reason: 'Front right corner compressed and punctured'
      });
      expect(res.verdict).toBe('fail');
    });

    it('does not mask reported damage with a contradictory PASS flag', () => {
      const res = computeDamageVerdict({ verdict: 'pass', confidence: 0.82, damage_type: 'water', reason: 'Visible water stain' }, 'carton_damage');
      expect(res.verdict).toBe('fail');
      expect(res.checkKey).toBe('carton_damage');
    });
  });

  describe('Component Logic', () => {
    it('passes when all required accessories are visible', () => {
      const res = computeComponentVerdict(
        {
          verdict: 'pass',
          confidence: 0.9,
          components: [
            { name: 'USB Cable', status: 'present', visible: true },
            { name: 'Manual', status: 'present', visible: true }
          ],
          reason: 'All components present'
        },
        ['USB Cable', 'Manual']
      );
      expect(res.verdict).toBe('pass');
    });

    it('fails when a compartment is empty and missing component confirmed', () => {
      const res = computeComponentVerdict(
        {
          verdict: 'fail',
          confidence: 0.95,
          components: [
            { name: 'Power Adapter', status: 'missing', visible: true }
          ],
          reason: 'Cavity empty'
        },
        ['Power Adapter']
      );
      expect(res.verdict).toBe('fail');
    });
  });
});
