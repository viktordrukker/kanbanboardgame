import { NextRequest } from 'next/server';
import { deleteSession } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (body.action === 'logout') {
    await deleteSession();
    return Response.json({ ok: true });
  }
  return Response.json({ error: 'Unknown action' }, { status: 400 });
}
