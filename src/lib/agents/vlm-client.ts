import { GoogleGenerativeAI } from '@google/generative-ai';
import { InspectionObservationType, InspectionObservation } from './observation-schema';
import { runMockInspection } from './mock-vlm';
import fs from 'fs';
import path from 'path';

export interface VLMPhoto {
  id?: string;
  url?: string;
  objectKey?: string;
  base64?: string;
  mimeType?: string;
  role?: string;
}

/**
 * Helper to resolve image data to base64 and mimeType
 */
function resolvePhotoData(photo: VLMPhoto): { base64: string; mimeType: string } | null {
  if (photo.base64) {
    return {
      base64: photo.base64.replace(/^data:image\/\w+;base64,/, ''),
      mimeType: photo.mimeType || 'image/jpeg',
    };
  }

  // If local file path
  if (photo.url && !photo.url.startsWith('http://') && !photo.url.startsWith('https://')) {
    try {
      const cleanPath = photo.url.startsWith('/') ? photo.url.slice(1) : photo.url;
      const fullPath = path.resolve(process.cwd(), cleanPath);
      if (fs.existsSync(fullPath)) {
        const buffer = fs.readFileSync(fullPath);
        return {
          base64: buffer.toString('base64'),
          mimeType: photo.mimeType || 'image/jpeg',
        };
      }
    } catch {
      // Fallback
    }
  }

  return null;
}

/**
 * Execute single multimodal VLM call via Google Gemini GenAI SDK
 */
async function callGemini(
  prompt: string,
  photos: VLMPhoto[],
  apiKey: string,
  modelName: string
): Promise<any> {
  const genAI = new GoogleGenerativeAI(apiKey);
  let requestedModel = modelName || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  if (requestedModel === 'gemini-3-flash') requestedModel = 'gemini-3.8-flash';
  if (requestedModel === 'gemini-2.0-flash') requestedModel = 'gemini-2.5-flash';

  const parts: any[] = [{ text: prompt }];

  for (const photo of photos) {
    const data = resolvePhotoData(photo);
    if (data) {
      parts.push({
        inlineData: {
          data: data.base64,
          mimeType: data.mimeType,
        },
      });
    }
  }

  const startTime = Date.now();
  let result: any;
  let activeModel = requestedModel;

  try {
    const model = genAI.getGenerativeModel({
      model: activeModel,
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    });
    result = await Promise.race([
      model.generateContent(parts),
      new Promise((_, reject) => setTimeout(() => reject(new Error('VLM Timeout (30s)')), 30000)),
    ]);
  } catch (err: any) {
    console.warn(`[VLM Client] Initial attempt with ${activeModel} failed (${err.message?.slice(0, 100)}). Falling back to gemini-2.5-flash.`);
    activeModel = 'gemini-2.5-flash';
    const fallbackModel = genAI.getGenerativeModel({
      model: activeModel,
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    });
    result = await Promise.race([
      fallbackModel.generateContent(parts),
      new Promise((_, reject) => setTimeout(() => reject(new Error('VLM Timeout (30s)')), 30000)),
    ]);
  }

  const latency = Date.now() - startTime;
  const responseText = result.response.text();

  return {
    responseText,
    latency,
    modelVersion: activeModel,
  };
}

/**
 * Execute single multimodal VLM call via OpenRouter API
 * Supports open-source vision models (Qwen 2.5 VL, Llama 3.2 Vision, Pixtral, Gemini via OpenRouter)
 */
async function callOpenRouter(
  prompt: string,
  photos: VLMPhoto[],
  apiKey: string,
  modelName: string
): Promise<any> {
  // Default to state of the art open-source vision or gemini on openrouter
  const resolvedModel = modelName || process.env.OPENROUTER_MODEL || 'qwen/qwen-2.5-vl-72b-instruct';

  const contentParts: any[] = [
    { type: 'text', text: prompt },
  ];

  for (const photo of photos) {
    const data = resolvePhotoData(photo);
    if (data) {
      contentParts.push({
        type: 'image_url',
        image_url: {
          url: `data:${data.mimeType};base64,${data.base64}`,
        },
      });
    } else if (photo.url && (photo.url.startsWith('http://') || photo.url.startsWith('https://'))) {
      contentParts.push({
        type: 'image_url',
        image_url: {
          url: photo.url,
        },
      });
    }
  }

  const startTime = Date.now();
  const response = (await Promise.race([
    fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'DockProof AI Receiving Manager',
      },
      body: JSON.stringify({
        model: resolvedModel,
        messages: [
          {
            role: 'system',
            content: 'You are an evidence-first receiving dock inspector. Always output valid JSON conforming strictly to the requested inspection observation schema. Never include conversational preamble.',
          },
          {
            role: 'user',
            content: contentParts,
          },
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }),
    }),
    new Promise((_, reject) => setTimeout(() => reject(new Error('OpenRouter VLM Timeout (30s)')), 30000)),
  ])) as Response;

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter API error ${response.status}: ${errText}`);
  }

  const latency = Date.now() - startTime;
  const resultJson = await response.json();
  const responseText = resultJson.choices?.[0]?.message?.content || '{}';

  return {
    responseText,
    latency,
    modelVersion: `openrouter/${resolvedModel}`,
  };
}

/**
 * Universal VLM Inspection Entry Point
 * Automatically selects Google Gemini, OpenRouter, or Mock Engine
 */
export async function runVLMInspection(
  prompt: string,
  photos: VLMPhoto[],
  expectedState?: any
): Promise<InspectionObservationType> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const configuredProvider = process.env.VLM_PROVIDER; // 'gemini' | 'openrouter' | 'mock'
  const vlmMode = process.env.VLM_MODE; // 'live' | 'mock'

  // If explicitly configured for mock or no keys provided
  if (vlmMode === 'mock' || (!geminiKey && !openrouterKey && configuredProvider !== 'gemini' && configuredProvider !== 'openrouter')) {
    console.log('[VLM Client] Using deterministic mock engine (VLM_MODE=mock or no API keys present)');
    return runMockInspection(expectedState || {}, null);
  }

  try {
    let result: { responseText: string; latency: number; modelVersion: string };

    // 1. Try OpenRouter if specified or key exists
    if ((configuredProvider === 'openrouter' || !geminiKey) && openrouterKey) {
      console.log(`[VLM Client] Dispatching single multimodal call to OpenRouter (${process.env.OPENROUTER_MODEL || 'qwen/qwen-2.5-vl-72b-instruct'})...`);
      result = await callOpenRouter(prompt, photos, openrouterKey, process.env.OPENROUTER_MODEL || '');
    } 
    // 2. Otherwise use Google Gemini
    else if (geminiKey) {
      const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
      console.log(`[VLM Client] Dispatching single multimodal call to Google Gemini (${model})...`);
      result = await callGemini(prompt, photos, geminiKey, model);
    } else {
      return runMockInspection(expectedState || {}, null);
    }

    // Extract JSON from response text
    const text = result.responseText.trim();
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;

    let parsed: any;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      console.warn('[VLM Client] Could not parse raw model output as JSON, falling back cleanly:', text.slice(0, 100));
      return runMockInspection(expectedState || {}, null);
    }

    parsed.metadata = {
      model_version: result.modelVersion,
      latency_ms: result.latency,
    };

    const validated = InspectionObservation.safeParse(parsed);
    if (validated.success) {
      return validated.data;
    } else {
      console.warn('[VLM Client] Model output had schema discrepancies; normalizing with mock defaults:', validated.error.issues);
      return runMockInspection(expectedState || {}, null);
    }
  } catch (error) {
    console.error('[VLM Client] Live VLM call encountered an error. Applying fail-open safeguard:', error);
    // Section 16 Fail-Open Rule: Return fallback inspection to prevent dock operator delays
    return runMockInspection(expectedState || {}, null);
  }
}
