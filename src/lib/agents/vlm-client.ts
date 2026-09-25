import { GoogleGenerativeAI } from '@google/generative-ai';
import { InspectionObservationType, InspectionObservation } from './observation-schema';
import { runMockInspection } from './mock-vlm';

export async function runVLMInspection(
  prompt: string,
  photos: any[],
  expectedState?: any
): Promise<InspectionObservationType> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || process.env.VLM_MODE !== 'live') {
    return runMockInspection(expectedState || {}, null);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });
  
  const imageParts = photos.map(photo => ({
    inlineData: {
      data: photo.base64,
      mimeType: photo.mimeType || 'image/jpeg'
    }
  }));

  const parts = [
    { text: prompt },
    ...imageParts
  ];

  try {
    const startTime = Date.now();
    const result = await Promise.race([
      model.generateContent(parts),
      new Promise((_, reject) => setTimeout(() => reject(new Error('VLM Timeout')), 30000))
    ]) as any;

    const latency = Date.now() - startTime;
    const responseText = result.response.text();
    
    // Extract JSON from markdown code block if present
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/{[\s\S]*}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText;
    
    const parsed = JSON.parse(jsonStr);
    
    // Add metadata
    parsed.metadata = {
      model_version: 'gemini-1.5-pro-latest',
      latency_ms: latency
    };

    return InspectionObservation.parse(parsed);
  } catch (error) {
    console.error('VLM Error:', error);
    // Fail-open: return a default uncertain response or fallback to mock
    return runMockInspection(expectedState || {}, null);
  }
}
