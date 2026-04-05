import type {
  GameState,
  StoryCard,
  DiceAssignment,
  ColumnId,
  DaySnapshot,
  EventEffect,
  TeamMember,
} from './types';
import { COLUMN_ORDER, ROLE_TO_COLUMN } from './types';
import { calculateFinancials } from './financial';
import { snapshotColumnCounts } from './charts';

// ─── Pull Phase ────────────────────────────────────────────────────────────────

/** Returns the next column for a card, or null if already deployed */
function nextColumn(col: ColumnId): ColumnId | null {
  const idx = COLUMN_ORDER.indexOf(col);
  if (idx === -1 || idx === COLUMN_ORDER.length - 1) return null;
  return COLUMN_ORDER[idx + 1];
}

function effortForColumn(card: StoryCard, col: ColumnId): number {
  if (col === 'analysis') return card.analysisEffort;
  if (col === 'development') return card.developmentEffort;
  if (col === 'testing') return card.testingEffort;
  return 0;
}

function cardsInColumn(cards: StoryCard[], col: ColumnId): StoryCard[] {
  return cards.filter((c) => c.currentColumn === col);
}

function wipLimitForColumn(state: GameState, col: ColumnId): number | null {
  return state.wipLimits[col];
}

/**
 * Pull phase: advance cards from right to left where effort remaining = 0.
 * Processes from rightmost column first to avoid cascades in a single pass.
 */
export function pullCards(state: GameState): GameState {
  // Work right-to-left (skip backlog and deployed)
  const pullOrder: ColumnId[] = [
    'readyToDeploy',
    'testing',
    'development',
    'analysis',
    'ready',
    'backlog',
  ];

  let cards = state.cards.map((c) => ({ ...c }));

  for (const col of pullOrder) {
    const next = nextColumn(col);
    if (!next) continue;

    // Get cards eligible to move (effort in current col = 0)
    const eligible = cards.filter(
      (c) => c.currentColumn === col && effortForColumn(c, col) === 0,
    );

    for (const card of eligible) {
      const limit = wipLimitForColumn(state, next);
      const currentCount = cards.filter((c) => c.currentColumn === next).length;
      if (limit !== null && currentCount >= limit) continue; // WIP blocked

      // Move the card
      const idx = cards.findIndex((c) => c.id === card.id);
      cards[idx] = {
        ...cards[idx],
        currentColumn: next,
        ...(next === 'ready' && !cards[idx].startDay
          ? { startDay: state.currentDay }
          : {}),
        ...(next === 'deployed' ? { deployDay: state.currentDay } : {}),
      };
    }
  }

  return { ...state, cards };
}

// ─── Work Phase ───────────────────────────────────────────────────────────────

export function assignDice(state: GameState, assignments: DiceAssignment[]): GameState {
  let cards = state.cards.map((c) => ({ ...c }));

  for (const assignment of assignments) {
    const card = cards.find((c) => c.id === assignment.cardId);
    const member = state.members.find((m) => m.id === assignment.memberId);
    if (!card || !member || !member.available) continue;

    const specialtyCol = ROLE_TO_COLUMN[member.role];
    const effectiveness =
      card.currentColumn === specialtyCol ? assignment.roll * 2 : assignment.roll;

    const cardIdx = cards.findIndex((c) => c.id === card.id);
    switch (card.currentColumn) {
      case 'analysis':
        cards[cardIdx] = {
          ...cards[cardIdx],
          analysisEffort: Math.max(0, cards[cardIdx].analysisEffort - effectiveness),
        };
        break;
      case 'development':
        cards[cardIdx] = {
          ...cards[cardIdx],
          developmentEffort: Math.max(0, cards[cardIdx].developmentEffort - effectiveness),
        };
        break;
      case 'testing':
        cards[cardIdx] = {
          ...cards[cardIdx],
          testingEffort: Math.max(0, cards[cardIdx].testingEffort - effectiveness),
        };
        break;
    }
  }

  return { ...state, cards, diceAssignments: assignments };
}

// ─── Event Processing ─────────────────────────────────────────────────────────

export function processDayStart(state: GameState): GameState {
  const todayEvent = state.eventCards.find((e) => e.day === state.currentDay) ?? null;

  if (!todayEvent) {
    return { ...state, currentEvent: null, phase: 'pull', noWorkToday: false };
  }

  // Apply automatic effects immediately; manual effects wait for UI acknowledgement
  let newState: GameState = { ...state, currentEvent: todayEvent, phase: 'event' as const };
  newState = applyEventEffects(newState, todayEvent.effects);

  return newState;
}

export function resolveEvent(state: GameState): GameState {
  return { ...state, currentEvent: null, phase: 'pull' };
}

function applyEventEffects(state: GameState, effects: EventEffect[]): GameState {
  let newState = { ...state };
  for (const effect of effects) {
    newState = applySingleEffect(newState, effect);
  }
  return newState;
}

function applySingleEffect(state: GameState, effect: EventEffect): GameState {
  switch (effect.type) {
    case 'no_work':
      return { ...state, noWorkToday: true };
    case 'bonus_dice':
      return { ...state, bonusDiceAvailable: state.bonusDiceAvailable + 1 };
    case 'add_fine':
      return { ...state, fines: state.fines + effect.amount };
    case 'change_wip': {
      return {
        ...state,
        wipLimits: { ...state.wipLimits, [effect.column]: effect.newLimit },
      };
    }
    case 'add_member': {
      const newMember: TeamMember = {
        id: `temp-${Date.now()}`,
        name: effect.memberName ?? `New ${effect.role}`,
        role: effect.role,
        color: effect.role === 'analyst' ? 'red' : effect.role === 'developer' ? 'blue' : 'green',
        available: true,
        temporary: effect.temporary ?? false,
        temporaryUntilDay: effect.days ? state.currentDay + effect.days : undefined,
      };
      return { ...state, members: [...state.members, newMember] };
    }
    case 'remove_member': {
      const members = state.members.map((m) => {
        if (effect.memberId && m.id !== effect.memberId) return m;
        if (!effect.memberId && effect.role && m.role !== effect.role) return m;
        if (!m.available) return m; // already blocked
        return { ...m, available: false, temporaryUntilDay: state.currentDay + effect.days };
      });
      // Only block the first matching member
      let blocked = false;
      const updatedMembers = state.members.map((m) => {
        if (blocked) return m;
        const matches = effect.memberId
          ? m.id === effect.memberId
          : effect.role
            ? m.role === effect.role
            : false;
        if (matches && m.available) {
          blocked = true;
          return { ...m, available: false, temporaryUntilDay: state.currentDay + effect.days };
        }
        return m;
      });
      return { ...state, members: updatedMembers };
    }
    case 'expedite': {
      if (!effect.cardId) return state;
      const cards = state.cards.map((c) =>
        c.id === effect.cardId ? { ...c, priority: 'expedite' as const, color: 'yellow' as const } : c,
      );
      return { ...state, cards };
    }
    default:
      return state;
  }
}

// ─── End of Day ───────────────────────────────────────────────────────────────

export function endDay(state: GameState): GameState {
  // Restore members whose temporary removal period has ended
  const members = state.members
    .map((m) => {
      if (!m.available && m.temporaryUntilDay && m.temporaryUntilDay <= state.currentDay) {
        const { temporaryUntilDay, ...rest } = m;
        return { ...rest, available: true };
      }
      return m;
    })
    .filter((m) => {
      // Remove temporary additions that have expired
      if (m.temporary && m.temporaryUntilDay && m.temporaryUntilDay <= state.currentDay) {
        return false;
      }
      return true;
    });

  const financials = calculateFinancials({ ...state, members }, state.financials);

  const snapshot: DaySnapshot = {
    day: state.currentDay,
    columnCounts: snapshotColumnCounts(state),
    deployedCardIds: state.cards
      .filter((c) => c.currentColumn === 'deployed')
      .map((c) => c.id),
    financials,
  };

  const nextDay = state.currentDay + 1;
  const isComplete = nextDay > state.maxDays;

  return {
    ...state,
    members,
    financials,
    history: [...state.history, snapshot],
    currentDay: nextDay,
    diceAssignments: [],
    bonusDiceAvailable: 0,
    phase: isComplete ? 'complete' : 'event',
    status: isComplete ? 'completed' : 'active',
  };
}

// ─── WIP validation ───────────────────────────────────────────────────────────

export function canMoveCard(
  state: GameState,
  cardId: string,
  targetColumn: ColumnId,
): { allowed: boolean; reason?: string } {
  const card = state.cards.find((c) => c.id === cardId);
  if (!card) return { allowed: false, reason: 'Card not found' };

  const currentIdx = COLUMN_ORDER.indexOf(card.currentColumn);
  const targetIdx = COLUMN_ORDER.indexOf(targetColumn);

  if (targetIdx !== currentIdx + 1) {
    return { allowed: false, reason: 'Can only move to the next column' };
  }

  const effort = effortForColumn(card, card.currentColumn);
  if (effort > 0) {
    return { allowed: false, reason: 'Card still has effort remaining' };
  }

  const limit = wipLimitForColumn(state, targetColumn);
  const currentCount = cardsInColumn(state.cards, targetColumn).length;
  if (limit !== null && currentCount >= limit) {
    return { allowed: false, reason: `WIP limit (${limit}) reached for ${targetColumn}` };
  }

  return { allowed: true };
}
