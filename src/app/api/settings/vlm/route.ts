import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

async function getSessionFromRequest() {
  const cookieStore = await cookies();
  const token = cookieStore.get('dockproof-session')?.value;
  if (!token) return null;
  try {
    return await verifySession(token);
  } catch {
    return null;
  }
}

export async function GET() {
  const session = await getSessionFromRequest();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  return NextResponse.json({
    vlmMode: process.env.VLM_MODE || 'mock',
    provider: process.env.VLM_PROVIDER || (process.env.OPENROUTER_API_KEY ? 'openrouter' : 'gemini'),
    geminiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    openrouterModel: process.env.OPENROUTER_MODEL || 'qwen/qwen-2.5-vl-72b-instruct',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasOpenrouterKey: Boolean(process.env.OPENROUTER_API_KEY),
  });
}

export async function POST(request: Request) {
  const session = await getSessionFromRequest();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Admin credentials required to modify VLM settings' }, { status: 403 });
  }

  try {
    const {
      vlmMode,
      provider,
      geminiKey,
      geminiModel,
      openrouterKey,
      openrouterModel,
    } = await request.json();

    // Update in-memory process environment
    if (vlmMode) process.env.VLM_MODE = vlmMode;
    if (provider) process.env.VLM_PROVIDER = provider;
    if (geminiKey) process.env.GEMINI_API_KEY = geminiKey;
    if (geminiModel) process.env.GEMINI_MODEL = geminiModel;
    if (openrouterKey) process.env.OPENROUTER_API_KEY = openrouterKey;
    if (openrouterModel) process.env.OPENROUTER_MODEL = openrouterModel;

    // Update .env.local file
    const envPath = path.resolve(process.cwd(), '.env.local');
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf-8');
    }

    const envMap: Record<string, string> = {};
    envContent.split('\n').forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        envMap[match[1]] = match[2] || '';
      }
    });

    if (vlmMode) envMap['VLM_MODE'] = vlmMode;
    if (provider) envMap['VLM_PROVIDER'] = provider;
    if (geminiKey) envMap['GEMINI_API_KEY'] = geminiKey;
    if (geminiModel) envMap['GEMINI_MODEL'] = geminiModel;
    if (openrouterKey) envMap['OPENROUTER_API_KEY'] = openrouterKey;
    if (openrouterModel) envMap['OPENROUTER_MODEL'] = openrouterModel;

    const newEnv = Object.entries(envMap)
      .map(([k, v]) => `${k}=${v}`)
      .join('\n') + '\n';

    fs.writeFileSync(envPath, newEnv, 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'VLM settings updated successfully',
      vlmMode: process.env.VLM_MODE,
      provider: process.env.VLM_PROVIDER,
      geminiModel: process.env.GEMINI_MODEL,
      openrouterModel: process.env.OPENROUTER_MODEL,
    });
  } catch (error) {
    console.error('Failed to update VLM settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
