import { createHash } from 'crypto';

export function computeSHA256(data: string): string {
  return 'sha256:' + createHash('sha256').update(data).digest('hex');
}
