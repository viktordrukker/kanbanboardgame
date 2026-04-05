import type { GameState } from './types';
import * as scenario21 from './scenarios/v2-21day';
import * as scenario35 from './scenarios/custom-35day';

const INITIAL_FINANCIALS = {
  currentDay: 1,
  totalSubscribers: 0,
  dailyRevenue: 0,
  cumulativeRevenue: 0,
  totalCosts: 0,
  grossProfit: 0,
  fines: 0,
  netProfit: 0,
};

export function createInitialGameState(gameId: string, scenarioId: string): GameState {
  const scenario = scenarioId === 'custom-35day' ? scenario35 : scenario21;

  return {
    id: gameId,
    scenarioId: scenario.SCENARIO_ID,
    currentDay: 1,
    maxDays: scenario.MAX_DAYS,
    phase: 'event',
    cards: scenario.initialCards.map((c) => ({ ...c })),
    members: scenario.initialMembers.map((m) => ({ ...m })),
    wipLimits: { ...scenario.defaultWipLimits },
    eventCards: scenario.eventCards.map((e) => ({ ...e })),
    currentEvent: null,
    diceAssignments: [],
    history: [],
    financials: INITIAL_FINANCIALS,
    bonusDiceAvailable: 0,
    noWorkToday: false,
    fines: 0,
    status: 'active',
  };
}
