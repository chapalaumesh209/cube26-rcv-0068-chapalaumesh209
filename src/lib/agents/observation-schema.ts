import { z } from 'zod';

export const VerdictEnum = z.enum(['pass', 'fail', 'uncertain']);

export const EvidenceItem = z.object({
  image_id: z.string(),
  region: z.object({
    ymin: z.number(),
    xmin: z.number(),
    ymax: z.number(),
    xmax: z.number(),
  }).optional(),
  observation: z.string(),
  source_type: z.enum(['visual', 'ocr', 'metadata']),
});

export const IdentityObservation = z.object({
  verdict: VerdictEnum,
  confidence: z.number().min(0).max(1),
  observed_sku: z.string().nullish(),
  observed_asin: z.string().nullish(),
  observed_title: z.string().nullish(),
  label_readable: z.boolean(),
  visual_similarity: z.number().min(0).max(1).nullish(),
  reason: z.string(),
  evidence: z.array(EvidenceItem).nullish(),
});

export const QuantityObservation = z.object({
  verdict: VerdictEnum,
  confidence: z.number().min(0).max(1),
  observed_quantity: z.number().nullish(),
  occluded: z.boolean(),
  reason: z.string(),
  evidence: z.array(EvidenceItem).nullish(),
});

export const CartonObservation = z.object({
  verdict: VerdictEnum,
  confidence: z.number().min(0).max(1),
  observed_cartons: z.number().nullish(),
  reason: z.string(),
  evidence: z.array(EvidenceItem).nullish(),
});

export const UnitsPerCartonObservation = z.object({
  verdict: VerdictEnum,
  confidence: z.number().min(0).max(1),
  observed_units_per_carton: z.number().nullish(),
  reason: z.string(),
  evidence: z.array(EvidenceItem).nullish(),
});

export const VariantObservation = z.object({
  verdict: VerdictEnum,
  confidence: z.number().min(0).max(1),
  observed_colour: z.string().nullish(),
  observed_variant: z.string().nullish(),
  reason: z.string(),
  evidence: z.array(EvidenceItem).nullish(),
});

export const DamageObservation = z.object({
  verdict: VerdictEnum,
  confidence: z.number().min(0).max(1),
  damage_type: z.enum(['none', 'crushed', 'water', 'torn', 'punctured', 'other']).nullish(),
  severity: z.enum(['minor', 'moderate', 'severe']).nullish(),
  affected_area: z.string().nullish(),
  reason: z.string(),
  evidence: z.array(EvidenceItem).nullish(),
});

export const ComponentObservation = z.object({
  verdict: VerdictEnum,
  confidence: z.number().min(0).max(1),
  components: z.array(z.object({
    name: z.string(),
    status: z.enum(['present', 'missing', 'uncertain']),
    visible: z.boolean(),
  })).nullish(),
  reason: z.string(),
  evidence: z.array(EvidenceItem).nullish(),
});

export const ModelMetadata = z.object({
  model_version: z.string(),
  prompt_tokens: z.number().optional(),
  completion_tokens: z.number().optional(),
  latency_ms: z.number().optional(),
});

export const InspectionObservation = z.object({
  identity: IdentityObservation.optional(),
  quantity: QuantityObservation.optional(),
  cartons: CartonObservation.optional(),
  units_per_carton: UnitsPerCartonObservation.optional(),
  variant: VariantObservation.optional(),
  carton_damage: DamageObservation.optional(),
  unit_damage: DamageObservation.optional(),
  damage: DamageObservation.optional(),
  components: ComponentObservation.optional(),
  metadata: ModelMetadata,
});

export type Verdict = z.infer<typeof VerdictEnum>;
export type EvidenceItemType = z.infer<typeof EvidenceItem>;
export type IdentityObservationType = z.infer<typeof IdentityObservation>;
export type QuantityObservationType = z.infer<typeof QuantityObservation>;
export type CartonObservationType = z.infer<typeof CartonObservation>;
export type UnitsPerCartonObservationType = z.infer<typeof UnitsPerCartonObservation>;
export type VariantObservationType = z.infer<typeof VariantObservation>;
export type DamageObservationType = z.infer<typeof DamageObservation>;
export type ComponentObservationType = z.infer<typeof ComponentObservation>;
export type ModelMetadataType = z.infer<typeof ModelMetadata>;
export type InspectionObservationType = z.infer<typeof InspectionObservation>;
