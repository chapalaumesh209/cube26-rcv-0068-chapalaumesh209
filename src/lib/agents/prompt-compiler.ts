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
6. Damage: Check for any signs of damage (crushed, water damage, torn, punctured).
7. Components: Verify all expected components are present.

UNCERTAIN HANDLING:
If you cannot clearly see or determine a check, return "uncertain". Do not guess. If an item is occluded, quantity may be uncertain. If a label is unreadable, identity may be uncertain.

OUTPUT FORMAT:
Return a strictly formatted JSON object matching the requested schema. Ensure all findings are backed by visual evidence in the images provided. Include evidence items with bounding box regions if applicable, or observation descriptions.
`;

  if (catalogueRefs && catalogueRefs.length > 0) {
    prompt += `\nCATALOGUE REFERENCES:\n` + catalogueRefs.map(ref => `- ${ref.description}`).join('\n');
  }

  return prompt;
}
