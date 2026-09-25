import { InspectionObservationType, Verdict } from './observation-schema';

export function runMockInspection(
  expectedState: any,
  unitData: any,
  csvRecord?: any
): Promise<InspectionObservationType> {
  return new Promise((resolve) => {
    const latency = Math.floor(Math.random() * (2500 - 800 + 1)) + 800;

    setTimeout(() => {
      let identityVerdict: Verdict = 'pass';
      let quantityVerdict: Verdict = 'pass';
      let cartonsVerdict: Verdict = 'pass';
      let upcVerdict: Verdict = 'pass';
      let variantVerdict: Verdict = 'pass';
      let damageVerdict: Verdict = 'pass';
      let componentsVerdict: Verdict = 'pass';

      if (csvRecord) {
        // Deterministic based on CSV
        if (csvRecord.identity_match === 'no') identityVerdict = 'fail';
        else if (csvRecord.identity_match === 'uncertain') identityVerdict = 'uncertain';
        else identityVerdict = 'pass';

        if (csvRecord.qty_ordered !== csvRecord.qty_received) quantityVerdict = 'fail';
        if (csvRecord.cartons_ordered !== csvRecord.cartons_received) cartonsVerdict = 'fail';
        if (csvRecord.units_per_carton_ordered !== csvRecord.units_per_carton_counted) upcVerdict = 'fail';

        const damage = csvRecord.unit_damage || csvRecord.carton_damage;
        if (damage && damage !== 'none') damageVerdict = 'fail';
        else if (damage === 'uncertain') damageVerdict = 'uncertain';
        
        const qualityFlags = csvRecord.quality_flags || '';
        if (qualityFlags.includes('wrong variant')) variantVerdict = 'fail';
        if (qualityFlags.includes('missing component')) componentsVerdict = 'fail';
      } else {
        // Semi-random
        const rand = () => Math.random();
        const getVerdict = (): Verdict => {
          const val = rand();
          if (val > 0.3) return 'pass';
          if (val > 0.15) return 'fail';
          return 'uncertain';
        };

        identityVerdict = getVerdict();
        quantityVerdict = getVerdict();
        cartonsVerdict = getVerdict();
        upcVerdict = getVerdict();
        variantVerdict = getVerdict();
        damageVerdict = getVerdict();
        componentsVerdict = getVerdict();
      }

      const observation: InspectionObservationType = {
        identity: {
          verdict: identityVerdict,
          confidence: 0.9,
          observed_sku: expectedState.sku,
          label_readable: true,
          reason: `Identity check returned ${identityVerdict}`,
          evidence: [{ image_id: 'img1', observation: 'SKU label visible', source_type: 'visual' }]
        },
        quantity: {
          verdict: quantityVerdict,
          confidence: 0.85,
          observed_quantity: expectedState.quantity,
          occluded: false,
          reason: `Quantity check returned ${quantityVerdict}`
        },
        cartons: {
          verdict: cartonsVerdict,
          confidence: 0.9,
          observed_cartons: expectedState.cartons,
          reason: `Cartons check returned ${cartonsVerdict}`
        },
        units_per_carton: {
          verdict: upcVerdict,
          confidence: 0.8,
          observed_units_per_carton: expectedState.unitsPerCarton,
          reason: `UPC check returned ${upcVerdict}`
        },
        variant: {
          verdict: variantVerdict,
          confidence: 0.95,
          observed_colour: expectedState.colour,
          reason: `Variant check returned ${variantVerdict}`
        },
        damage: {
          verdict: damageVerdict,
          confidence: 0.9,
          damage_type: damageVerdict === 'fail' ? 'crushed' : 'none',
          severity: damageVerdict === 'fail' ? 'minor' : undefined,
          reason: `Damage check returned ${damageVerdict}`
        },
        components: {
          verdict: componentsVerdict,
          confidence: 0.88,
          components: expectedState.components?.map((c: string) => ({
            name: c,
            status: componentsVerdict === 'fail' ? 'missing' : 'present',
            visible: true
          })),
          reason: `Components check returned ${componentsVerdict}`
        },
        metadata: {
          model_version: 'obs-engine-v1',
          latency_ms: latency
        }
      };

      resolve(observation);
    }, latency);
  });
}
