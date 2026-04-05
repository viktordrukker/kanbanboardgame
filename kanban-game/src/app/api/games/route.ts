import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { createInitialGameState } from '@/lib/game-engine/init';

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const games = await db.game.findMany({
    where: { userId: session.userId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true, name: true, scenarioId: true, currentDay: true,
      status: true, createdAt: true, updatedAt: true,
    },
  });

  return Response.json(games);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { scenarioId, name } = body;

  if (!scenarioId || !['v2-21day', 'custom-35day'].includes(scenarioId)) {
    return Response.json({ error: 'Invalid scenarioId' }, { status: 400 });
  }

  const game = await db.game.create({
    data: { userId: session.userId, scenarioId, name: name || null },
  });

  const initialState = createInitialGameState(game.id, scenarioId);

  await db.gameSnapshot.create({
    data: { gameId: game.id, day: 0, boardState: initialState as any },
  });

  return Response.json(game, { status: 201 });
}
