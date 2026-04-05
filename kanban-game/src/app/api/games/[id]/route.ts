import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const game = await db.game.findFirst({
    where: { id, userId: session.userId },
  });
  if (!game) return Response.json({ error: 'Not found' }, { status: 404 });

  // Return the latest snapshot as the game state
  const latest = await db.gameSnapshot.findFirst({
    where: { gameId: id },
    orderBy: { day: 'desc' },
  });

  return Response.json({ game, state: latest?.boardState ?? null });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const game = await db.game.findFirst({
    where: { id, userId: session.userId },
    select: { id: true },
  });
  if (!game) return Response.json({ error: 'Not found' }, { status: 404 });

  await db.game.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
