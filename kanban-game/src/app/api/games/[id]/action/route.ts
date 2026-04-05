import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import {
  processDayStart,
  resolveEvent,
  pullCards,
  assignDice,
  endDay,
  canMoveCard,
} from '@/lib/game-engine/engine';
import type { GameState, DiceAssignment } from '@/lib/game-engine/types';

type Params = { params: Promise<{ id: string }> };

async function loadState(gameId: string): Promise<GameState | null> {
  const snap = await db.gameSnapshot.findFirst({
    where: { gameId },
    orderBy: { day: 'desc' },
  });
  return snap ? (snap.boardState as unknown as GameState) : null;
}

async function saveState(gameId: string, state: GameState): Promise<void> {
  await db.gameSnapshot.upsert({
    where: { gameId_day: { gameId, day: state.currentDay } },
    update: { boardState: state as any },
    create: { gameId, day: state.currentDay, boardState: state as any },
  });
  await db.game.update({
    where: { id: gameId },
    data: { currentDay: state.currentDay, status: state.status },
  });
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const game = await db.game.findFirst({
    where: { id, userId: session.userId },
    select: { id: true },
  });
  if (!game) return Response.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  const { type } = body;

  let state = await loadState(id);
  if (!state) return Response.json({ error: 'Game state not found' }, { status: 404 });

  switch (type) {
    case 'start_day': {
      if (state.phase !== 'event') {
        return Response.json({ error: 'Invalid phase for start_day' }, { status: 400 });
      }
      state = processDayStart(state);
      break;
    }
    case 'resolve_event': {
      if (state.phase !== 'event') {
        return Response.json({ error: 'No event to resolve' }, { status: 400 });
      }
      state = resolveEvent(state);
      break;
    }
    case 'pull_cards': {
      if (state.phase !== 'pull') {
        return Response.json({ error: 'Invalid phase for pull_cards' }, { status: 400 });
      }
      state = pullCards(state);
      state = { ...state, phase: 'assign' };
      break;
    }
    case 'assign_dice': {
      if (state.phase !== 'assign') {
        return Response.json({ error: 'Invalid phase for assign_dice' }, { status: 400 });
      }
      const assignments: DiceAssignment[] = body.assignments;
      if (!Array.isArray(assignments)) {
        return Response.json({ error: 'assignments must be an array' }, { status: 400 });
      }
      state = assignDice(state, assignments);
      state = { ...state, phase: 'confirm' };
      break;
    }
    case 'end_day': {
      if (state.phase !== 'confirm') {
        return Response.json({ error: 'Invalid phase for end_day' }, { status: 400 });
      }
      state = endDay(state);
      break;
    }
    default:
      return Response.json({ error: `Unknown action type: ${type}` }, { status: 400 });
  }

  await saveState(id, state);
  return Response.json({ state });
}
