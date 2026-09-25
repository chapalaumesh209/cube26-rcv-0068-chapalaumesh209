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

  const liveReady = Boolean(process.env.GEMINI_API_KEY || process.env.OPENROUTER_API_KEY);

  return NextResponse.json({
    mode: process.env.VLM_MODE === 'live' ? 'live' : 'offline',
    liveReady,
  });
}

export async function POST(request: Request) {
  const session = await getSessionFromRequest();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Administrator access required' }, { status: 403 });
  }

  try {
    const { mode } = await request.json();
    const vlmMode = mode === 'live' ? 'live' : 'mock';
    process.env.VLM_MODE = vlmMode;

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

    envMap['VLM_MODE'] = vlmMode;

    const newEnv = Object.entries(envMap)
      .map(([k, v]) => `${k}=${v}`)
      .join('\n') + '\n';

    fs.writeFileSync(envPath, newEnv, 'utf-8');

    return NextResponse.json({
      success: true,
      mode: vlmMode === 'live' ? 'live' : 'offline',
    });
  } catch (error) {
    console.error('Failed to update observation settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
