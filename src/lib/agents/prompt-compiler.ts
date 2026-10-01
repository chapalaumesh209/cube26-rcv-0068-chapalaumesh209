export function compileInspectionPrompt(expectedState: any, catalogueRefs: any[], photos: any[]): string {
  let prompt = `You are an AI evidence-first receiving inspector. You must carefully analyze the provided images of received shipments and compare them against the expected state.

EXPECTED STATE:
SKU: ${expectedState.sku || 'Unknown'}
Quantity: ${expectedState.quantity || 'Unknown'}
Cartons: ${expectedState.cartons || 'Unknown'}
Units per Carton: ${expectedState.unitsPerCarton || 'Unknown'}
Variant Details:
- Colour: ${expectedState.colour || 'N/A'}
- Variant: ${expectedState.variant || 'N/A'}
Components: ${expectedState.components ? expectedState.components.join(', ') : 'N/A'}

INSTRUCTIONS:
1. Identity: Verify if the received item matches the expected SKU. Read labels if visible.
2. Quantity: Count the items. Determine if there is occlusion preventing an accurate count.
3. Cartons: Count the number of cartons received.
4. Units per Carton: If cartons are open, count units per carton.
5. Variant: Verify the colour and specific variant details match.
6. Carton damage: Check outer packaging for crushing, water damage, tears, and punctures.
7. Unit damage: Separately check visible product surfaces for cracks, dents, staining, or other defects.
8. Components: Verify all expected components are present.

UNCERTAIN HANDLING:
If you cannot clearly see or determine a check, return "uncertain". Do not guess. If an item is occluded, quantity may be uncertain. If a label is unreadable, identity may be uncertain.

OUTPUT FORMAT:
You MUST respond with a single, valid JSON object strictly conforming to this exact structure:
{
  "identity": {
    "verdict": "pass" | "fail" | "uncertain",
    "confidence": 0.0 to 1.0,
    "observed_sku": "SKU string or null",
    "label_readable": true | false,
    "reason": "Detailed visual rationale"
  },
  "quantity": {
    "verdict": "pass" | "fail" | "uncertain",
    "confidence": 0.0 to 1.0,
    "observed_quantity": number or null,
    "occluded": true | false,
    "reason": "Detailed visual rationale"
  },
  "cartons": {
    "verdict": "pass" | "fail" | "uncertain",
    "confidence": 0.0 to 1.0,
    "observed_cartons": number or null,
    "reason": "Detailed visual rationale"
  },
  "units_per_carton": {
    "verdict": "pass" | "fail" | "uncertain",
    "confidence": 0.0 to 1.0,
    "observed_units_per_carton": number or null,
    "reason": "Detailed visual rationale"
  },
  "variant": {
    "verdict": "pass" | "fail" | "uncertain",
    "confidence": 0.0 to 1.0,
    "observed_colour": "Colour string or null",
    "observed_variant": "Variant string or null",
    "reason": "Detailed visual rationale"
  },
  "carton_damage": {
    "verdict": "pass" | "fail" | "uncertain",
    "confidence": 0.0 to 1.0,
    "damage_type": "none" | "crushed" | "water" | "torn" | "punctured" | "other",
    "severity": "minor" | "moderate" | "severe",
    "reason": "Detailed visual rationale"
  },
  "unit_damage": {
    "verdict": "pass" | "fail" | "uncertain",
    "confidence": 0.0 to 1.0,
    "damage_type": "none" | "crushed" | "water" | "torn" | "punctured" | "other",
    "severity": "minor" | "moderate" | "severe",
    "reason": "Detailed visual rationale"
  },
  "components": {
    "verdict": "pass" | "fail" | "uncertain",
    "confidence": 0.0 to 1.0,
    "components": [
      { "name": "string", "status": "present" | "missing" | "uncertain", "visible": true | false }
    ],
    "reason": "Detailed visual rationale"
  }
}
Do NOT wrap in any extra outer keys. Do NOT include markdown commentary. Strictly output JSON matching these keys.
`;

  if (catalogueRefs && catalogueRefs.length > 0) {
    prompt += `\nCATALOGUE REFERENCES:\n` + catalogueRefs.map(ref => `- ${ref.description}`).join('\n');
  }

  return prompt;
}
