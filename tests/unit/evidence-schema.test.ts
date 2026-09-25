import { describe, it, expect } from 'vitest';
import { buildEvidenceRecord } from '@/lib/evidence/builder';
import { computeSHA256 } from '@/lib/evidence/hasher';

describe('Evidence Contract (rcv.v1) & Integrity Hashing', () => {
  const mockInspection = {
    id: 'RCV-TEST-001',
    startedAt: new Date('2026-09-25T10:00:00Z'),
    completedAt: new Date('2026-09-25T10:01:15Z'),
    operatorId: 'op_amira',
    overallVerdict: 'pass',
    status: 'completed',
  };

  const mockChecks = [
    {
      checkKey: 'identity',
      verdict: 'pass',
      confidence: 0.98,
      detailJson: JSON.stringify({ match: true }),
      modelVersion: 'dockproof-vlm-v1',
      latencyMs: 850,
    },
    {
      checkKey: 'quantity',
      verdict: 'pass',
      confidence: 0.95,
      detailJson: JSON.stringify({ expected: 12, observed: 12 }),
      modelVersion: 'dockproof-vlm-v1',
      latencyMs: 420,
    }
  ];

  const mockPhotos = [
    { id: 'img_01', sha256: 'sha256:abc12345', role: 'carton_front' }
  ];

  const mockUnit = { unitCode: 'UNIT-TEST-100', sku: 'SKU-MUG-11' };
  const mockOrg = { id: 'org_demo_alpha' };

  it('generates a schema compliant rcv.v1 record', () => {
    const record = buildEvidenceRecord(
      mockInspection,
      mockChecks,
      mockPhotos,
      [],
      mockUnit,
      mockOrg
    );

    expect(record.schema_version).toBe('rcv.v1');
    expect(record.record_id).toBe('RCV-TEST-001');
    expect(record.organization_id).toBe('org_demo_alpha');
    expect(record.agent.name).toBe('DockProof');
    expect(record.subject.unit_id).toBe('UNIT-TEST-100');
    expect(record.subject.sku).toBe('SKU-MUG-11');
    expect(record.checks).toHaveLength(2);
    expect(record.outcome.decision).toBe('pass');
    expect(record.content_hash).toMatch(/^sha256:[a-f0-9]{64}$/);
  });

  it('computes deterministic SHA-256 hash', () => {
    const str1 = JSON.stringify({ test: 'payload', value: 42 });
    const hash1 = computeSHA256(str1);
    const hash2 = computeSHA256(str1);

    expect(hash1).toBe(hash2);
    expect(hash1.startsWith('sha256:')).toBe(true);
  });

  it('detects tampering when payload changes', () => {
    const record1 = buildEvidenceRecord(mockInspection, mockChecks, mockPhotos, [], mockUnit, mockOrg);
    
    // Simulate altered check verdict
    const tamperedChecks = [{ ...mockChecks[0], verdict: 'fail' }, mockChecks[1]];
    const record2 = buildEvidenceRecord(mockInspection, tamperedChecks, mockPhotos, [], mockUnit, mockOrg);

    expect(record1.content_hash).not.toBe(record2.content_hash);
  });
});
