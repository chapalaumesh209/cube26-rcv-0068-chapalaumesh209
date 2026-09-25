import { computeSHA256 } from './hasher';

export function buildEvidenceRecord(
  inspection: any,
  checks: any[],
  photos: any[],
  overrides: any[],
  unit: any,
  org: any
) {
  const payload = {
    record_id: inspection.id,
    schema_version: 'rcv.v1',
    organization_id: org.id,
    agent: { name: 'DockProof', version: '1.0.0' },
    subject: { unit_id: unit.unitCode, sku: unit.sku },
    captured_at: inspection.startedAt,
    operator_label: inspection.operatorId,
    images: photos.map(p => ({ id: p.id, sha256: p.sha256, role: p.role })),
    checks: checks.map(c => ({
      check_key: c.checkKey,
      verdict: c.verdict,
      confidence: c.confidence,
      detail: typeof c.detailJson === 'string' ? JSON.parse(c.detailJson || '{}') : c.detail,
      model_version: c.modelVersion,
      latency_ms: c.latencyMs,
    })),
    outcome: {
      decision: inspection.overallVerdict,
      decided_by: overrides.length > 0 ? 'human' : 'system',
      decided_at: inspection.completedAt,
    },
    overrides: overrides.map(o => ({
      actor: o.actorId,
      original: o.originalVerdict,
      new: o.newVerdict,
      reason: o.reason,
      at: o.createdAt,
    })),
    status: inspection.status,
    content_hash: '', // filled below
  };
  
  // Compute SHA-256 of the payload (minus content_hash)
  const payloadStr = JSON.stringify({ ...payload, content_hash: undefined });
  payload.content_hash = computeSHA256(payloadStr);
  return payload;
}
