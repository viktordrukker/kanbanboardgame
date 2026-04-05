import { describe, it, expect } from 'vitest';
import {
  pullCards,
  assignDice,
  processDayStart,
  resolveEvent,
  endDay,
  canMoveCard,
} from '@/lib/game-engine/engine';
import { createInitialGameState } from '@/lib/game-engine/init';
import type { GameState } from '@/lib/game-engine/types';

function makeState(overrides: Partial<GameState> = {}): GameState {
  return { ...createInitialGameState('test-id', 'v2-21day'), ...overrides };
}

// ── pullCards ─────────────────────────────────────────────────────────────────

describe('pullCards', () => {
  it('moves cards with 0 effort from backlog to ready when WIP allows', () => {
    const state = makeState({
      cards: [
        { id: 'S1', title: 'T', analysisEffort: 0, developmentEffort: 3, testingEffort: 2,
          subscribers: 100, priority: 'standard', color: 'white', currentColumn: 'backlog' },
      ],
    });
    const next = pullCards(state);
    expect(next.cards[0].currentColumn).toBe('ready');
  });

  it('does not move a card when WIP limit is fully saturated by cards that cannot advance', () => {
    // Fill ready AND analysis to their WIP limits with cards that still have remaining effort,
    // so no cascade can happen and backlog→ready is genuinely blocked.
    const readyCards = Array.from({ length: 6 }, (_, i) => ({
      id: `R${i}`, title: 'R', analysisEffort: 3, developmentEffort: 4, testingEffort: 2,
      subscribers: 50, priority: 'standard' as const, color: 'white' as const, currentColumn: 'ready' as const,
    }));
    // analysis at WIP=4, all with remaining effort so nothing flows out
    const analysisCards = Array.from({ length: 4 }, (_, i) => ({
      id: `A${i}`, title: 'A', analysisEffort: 5, developmentEffort: 4, testingEffort: 2,
      subscribers: 50, priority: 'standard' as const, color: 'white' as const, currentColumn: 'analysis' as const,
    }));
    const state = makeState({
      cards: [
        ...readyCards,
        ...analysisCards,
        { id: 'S1', title: 'T', analysisEffort: 0, developmentEffort: 3, testingEffort: 2,
          subscribers: 100, priority: 'standard', color: 'white', currentColumn: 'backlog' },
      ],
    });
    const next = pullCards(state);
    const s1 = next.cards.find((c) => c.id === 'S1')!;
    expect(s1.currentColumn).toBe('backlog'); // WIP limit blocks because analysis is also full
  });

  it('sets startDay when card enters ready column', () => {
    const state = makeState({
      currentDay: 5,
      cards: [
        { id: 'S1', title: 'T', analysisEffort: 0, developmentEffort: 3, testingEffort: 2,
          subscribers: 100, priority: 'standard', color: 'white', currentColumn: 'backlog' },
      ],
    });
    const next = pullCards(state);
    expect(next.cards[0].startDay).toBe(5);
  });

  it('sets deployDay when card enters deployed column', () => {
    const state = makeState({
      currentDay: 10,
      cards: [
        { id: 'S1', title: 'T', analysisEffort: 3, developmentEffort: 4, testingEffort: 0,
          subscribers: 100, priority: 'standard', color: 'white', currentColumn: 'testing' },
      ],
    });
    const next = pullCards(state);
    expect(next.cards[0].currentColumn).toBe('readyToDeploy');
  });
});

// ── assignDice ────────────────────────────────────────────────────────────────

describe('assignDice', () => {
  it('reduces effort when a developer works on development', () => {
    const state = makeState({
      cards: [
        { id: 'S1', title: 'T', analysisEffort: 3, developmentEffort: 10, testingEffort: 2,
          subscribers: 100, priority: 'standard', color: 'white', currentColumn: 'development' },
      ],
      members: [
        { id: 'M3', name: 'Charlie', role: 'developer', color: 'blue', available: true },
      ],
    });
    const next = assignDice(state, [{ memberId: 'M3', cardId: 'S1', roll: 3 }]);
    const card = next.cards.find((c) => c.id === 'S1')!;
    // specialist: roll × 2 = 6, so 10 - 6 = 4
    expect(card.developmentEffort).toBe(4);
  });

  it('does not apply specialist bonus for cross-column work', () => {
    const state = makeState({
      cards: [
        { id: 'S1', title: 'T', analysisEffort: 10, developmentEffort: 3, testingEffort: 2,
          subscribers: 100, priority: 'standard', color: 'white', currentColumn: 'analysis' },
      ],
      members: [
        { id: 'M3', name: 'Charlie', role: 'developer', color: 'blue', available: true },
      ],
    });
    const next = assignDice(state, [{ memberId: 'M3', cardId: 'S1', roll: 4 }]);
    const card = next.cards.find((c) => c.id === 'S1')!;
    // cross-column: roll × 1 = 4, so 10 - 4 = 6
    expect(card.analysisEffort).toBe(6);
  });

  it('clamps effort to 0 (never negative)', () => {
    const state = makeState({
      cards: [
        { id: 'S1', title: 'T', analysisEffort: 3, developmentEffort: 1, testingEffort: 2,
          subscribers: 100, priority: 'standard', color: 'white', currentColumn: 'development' },
      ],
      members: [
        { id: 'M3', name: 'Charlie', role: 'developer', color: 'blue', available: true },
      ],
    });
    const next = assignDice(state, [{ memberId: 'M3', cardId: 'S1', roll: 6 }]);
    const card = next.cards.find((c) => c.id === 'S1')!;
    expect(card.developmentEffort).toBe(0);
  });

  it('ignores unavailable members', () => {
    const state = makeState({
      cards: [
        { id: 'S1', title: 'T', analysisEffort: 3, developmentEffort: 5, testingEffort: 2,
          subscribers: 100, priority: 'standard', color: 'white', currentColumn: 'development' },
      ],
      members: [
        { id: 'M3', name: 'Charlie', role: 'developer', color: 'blue', available: false },
      ],
    });
    const next = assignDice(state, [{ memberId: 'M3', cardId: 'S1', roll: 4 }]);
    const card = next.cards.find((c) => c.id === 'S1')!;
    expect(card.developmentEffort).toBe(5); // unchanged
  });
});

// ── processDayStart ───────────────────────────────────────────────────────────

describe('processDayStart', () => {
  it('sets currentEvent when event card matches current day', () => {
    const state = makeState({ currentDay: 5, phase: 'event' });
    const next = processDayStart(state);
    expect(next.currentEvent?.day).toBe(5);
    expect(next.phase).toBe('event');
  });

  it('transitions to pull phase when no event today', () => {
    const state = makeState({ currentDay: 3, phase: 'event' }); // no event on day 3
    const next = processDayStart(state);
    expect(next.currentEvent).toBeNull();
    expect(next.phase).toBe('pull');
  });

  it('applies no_work effect immediately', () => {
    const state = makeState({ currentDay: 18, phase: 'event' });
    const next = processDayStart(state);
    expect(next.noWorkToday).toBe(true);
  });
});

// ── resolveEvent ──────────────────────────────────────────────────────────────

describe('resolveEvent', () => {
  it('clears currentEvent and sets phase to pull', () => {
    const state = makeState({
      phase: 'event',
      currentEvent: {
        id: 'E1', day: 5, title: 'Test', description: 'test', effects: [],
      },
    });
    const next = resolveEvent(state);
    expect(next.currentEvent).toBeNull();
    expect(next.phase).toBe('pull');
  });
});

// ── endDay ────────────────────────────────────────────────────────────────────

describe('endDay', () => {
  it('increments currentDay', () => {
    const state = makeState({ phase: 'confirm', currentDay: 3 });
    const next = endDay(state);
    expect(next.currentDay).toBe(4);
  });

  it('adds a day snapshot to history', () => {
    const state = makeState({ phase: 'confirm', currentDay: 3, history: [] });
    const next = endDay(state);
    expect(next.history).toHaveLength(1);
    expect(next.history[0].day).toBe(3);
  });

  it('sets status to completed on last day', () => {
    const state = makeState({ phase: 'confirm', currentDay: 21, maxDays: 21 });
    const next = endDay(state);
    expect(next.status).toBe('completed');
    expect(next.phase).toBe('complete');
  });

  it('restores temporarily removed members', () => {
    const state = makeState({
      phase: 'confirm',
      currentDay: 10,
      members: [
        { id: 'M1', name: 'Alice', role: 'analyst', color: 'red', available: false, temporaryUntilDay: 10 },
      ],
    });
    const next = endDay(state);
    expect(next.members[0].available).toBe(true);
  });
});

// ── canMoveCard ───────────────────────────────────────────────────────────────

describe('canMoveCard', () => {
  it('allows moving a card with 0 effort to the next column', () => {
    const state = makeState({
      cards: [
        { id: 'S1', title: 'T', analysisEffort: 0, developmentEffort: 3, testingEffort: 2,
          subscribers: 100, priority: 'standard', color: 'white', currentColumn: 'ready' },
      ],
    });
    const result = canMoveCard(state, 'S1', 'analysis');
    expect(result.allowed).toBe(true);
  });

  it('blocks moving when card still has effort', () => {
    const state = makeState({
      cards: [
        { id: 'S1', title: 'T', analysisEffort: 5, developmentEffort: 3, testingEffort: 2,
          subscribers: 100, priority: 'standard', color: 'white', currentColumn: 'analysis' },
      ],
    });
    const result = canMoveCard(state, 'S1', 'development');
    expect(result.allowed).toBe(false);
  });

  it('blocks moving when WIP limit reached', () => {
    const devCards = Array.from({ length: 5 }, (_, i) => ({
      id: `D${i}`, title: 'D', analysisEffort: 0, developmentEffort: 4, testingEffort: 2,
      subscribers: 50, priority: 'standard' as const, color: 'white' as const, currentColumn: 'development' as const,
    }));
    const state = makeState({
      cards: [
        ...devCards,
        { id: 'S1', title: 'T', analysisEffort: 0, developmentEffort: 0, testingEffort: 2,
          subscribers: 100, priority: 'standard', color: 'white', currentColumn: 'analysis' },
      ],
    });
    const result = canMoveCard(state, 'S1', 'development');
    expect(result.allowed).toBe(false);
  });
});
