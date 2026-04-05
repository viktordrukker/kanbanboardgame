import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import GameClient from './GameClient';
import type { GameState } from '@/lib/game-engine/types';

type Props = { params: Promise<{ id: string }> };

export default async function GamePage({ params }: Props) {
  const session = await getSession();
  if (!session) redirect('/login');

  const { id } = await params;

  const game = await db.game.findFirst({
    where: { id, userId: session.userId },
  });
  if (!game) redirect('/dashboard');

  const latest = await db.gameSnapshot.findFirst({
    where: { gameId: id },
    orderBy: { day: 'desc' },
  });

  const gameState = latest?.boardState as unknown as GameState | null;

  return <GameClient gameId={id} initialState={gameState} gameName={game.name ?? undefined} />;
}
