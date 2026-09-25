import { 
  QuantityObservationType, 
  CartonObservationType, 
  IdentityObservationType, 
  VariantObservationType, 
  DamageObservationType, 
  ComponentObservationType 
} from '../agents/observation-schema';

export interface CheckResult {
  checkKey: string;
  verdict: 'pass' | 'fail' | 'uncertain';
  confidence: number;
  detail: any;
}

export function computeOverallVerdict(checks: CheckResult[]): 'pass' | 'exception' | 'uncertain' {
  if (checks.some(c => c.verdict === 'fail')) return 'exception';
  if (checks.some(c => c.verdict === 'uncertain')) return 'uncertain';
  return 'pass';
}

export function computeQuantityVerdict(expected: number, observed: number | undefined, occluded: boolean): CheckResult {
  if (observed === undefined || occluded) {
    return { checkKey: 'quantity', verdict: 'uncertain', confidence: 0.5, detail: { expected, observed, occluded } };
  }
  if (expected === observed) {
    return { checkKey: 'quantity', verdict: 'pass', confidence: 0.9, detail: { expected, observed } };
  }
  return { checkKey: 'quantity', verdict: 'fail', confidence: 0.9, detail: { expected, observed } };
}

export function computeCartonVerdict(expected: number, observed: number | undefined): CheckResult {
  if (observed === undefined) {
    return { checkKey: 'cartons', verdict: 'uncertain', confidence: 0.5, detail: { expected, observed } };
  }
  if (expected === observed) {
    return { checkKey: 'cartons', verdict: 'pass', confidence: 0.9, detail: { expected, observed } };
  }
  return { checkKey: 'cartons', verdict: 'fail', confidence: 0.9, detail: { expected, observed } };
}

export function computeIdentityVerdict(observation: IdentityObservationType, expectedSku: string): CheckResult {
  if (observation.verdict === 'pass' && observation.confidence > 0.7) {
    return { checkKey: 'identity', verdict: 'pass', confidence: observation.confidence, detail: { expectedSku, observation } };
  }
  if (observation.verdict === 'fail') {
    return { checkKey: 'identity', verdict: 'fail', confidence: observation.confidence, detail: { expectedSku, observation } };
  }
  return { checkKey: 'identity', verdict: 'uncertain', confidence: observation.confidence, detail: { expectedSku, observation } };
}

export function computeVariantVerdict(observation: VariantObservationType, expectedColour: string, expectedVariant: string): CheckResult {
  if (observation.verdict === 'fail') {
    return { checkKey: 'variant', verdict: 'fail', confidence: observation.confidence, detail: { expectedColour, expectedVariant, observation } };
  }
  if (observation.verdict === 'uncertain') {
    return { checkKey: 'variant', verdict: 'uncertain', confidence: observation.confidence, detail: { expectedColour, expectedVariant, observation } };
  }
  return { checkKey: 'variant', verdict: 'pass', confidence: observation.confidence, detail: { expectedColour, expectedVariant, observation } };
}

export function computeDamageVerdict(observation: DamageObservationType): CheckResult {
  if (observation.damage_type === 'none' || observation.verdict === 'pass') {
    return { checkKey: 'damage', verdict: 'pass', confidence: observation.confidence, detail: { observation } };
  }
  if (observation.verdict === 'fail') {
    return { checkKey: 'damage', verdict: 'fail', confidence: observation.confidence, detail: { observation } };
  }
  return { checkKey: 'damage', verdict: 'uncertain', confidence: observation.confidence, detail: { observation } };
}

export function computeComponentVerdict(observation: ComponentObservationType, expectedComponents: string[]): CheckResult {
  if (observation.verdict === 'fail' || observation.components?.some(c => c.status === 'missing')) {
    return { checkKey: 'components', verdict: 'fail', confidence: observation.confidence, detail: { expectedComponents, observation } };
  }
  if (observation.verdict === 'uncertain' || observation.components?.some(c => c.status === 'uncertain' || !c.visible)) {
    return { checkKey: 'components', verdict: 'uncertain', confidence: observation.confidence, detail: { expectedComponents, observation } };
  }
  return { checkKey: 'components', verdict: 'pass', confidence: observation.confidence, detail: { expectedComponents, observation } };
}
