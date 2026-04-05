import { describe, it, expect } from 'vitest';
import { calculateFinancials } from '@/lib/game-engine/financial';
import { createInitialGameState } from '@/lib/game-engine/init';
import type { GameState, FinancialState } from '@/lib/game-engine/types';

const BASE_FINANCIALS: FinancialState = {
  currentDay: 1,
  totalSubscribers: 0,
  dailyRevenue: 0,
  cumulativeRevenue: 0,
  totalCosts: 0,
  grossProfit: 0,
  fines: 0,
  netProfit: 0,
};

describe('calculateFinancials', () => {
  it('accumulates subscribers from deployed cards', () => {
    const state = {
      ...createInitialGameState('id', 'v2-21day'),
      currentDay: 2,
      fines: 0,
      cards: [
        { id: 'S1', title: 'T', analysisEffort: 0, developmentEffort: 0, testingEffort: 0,
          subscribers: 150, priority: 'standard' as const, color: 'white' as const, currentColumn: 'deployed' as const },
      ],
    } as GameState;

    const prev: FinancialState = { ...BASE_FINANCIALS, totalSubscribers: 0 };
    const fin = calculateFinancials(state, prev);
    expect(fin.totalSubscribers).toBe(150);
  });

  it('earns revenue from previous day subscribers (delay by 1)', () => {
    const state = {
      ...createInitialGameState('id', 'v2-21day'),
      currentDay: 3,
      fines: 0,
      cards: [
        { id: 'S1', title: 'T', analysisEffort: 0, developmentEffort: 0, testingEffort: 0,
          subscribers: 200, priority: 'standard' as const, color: 'white' as const, currentColumn: 'deployed' as const },
      ],
    } as GameState;

    // Previous day had 200 subscribers
    const prev: FinancialState = { ...BASE_FINANCIALS, totalSubscribers: 200, cumulativeRevenue: 2000 };
    const fin = calculateFinancials(state, prev);
    // Today's revenue = 200 * $10 = $2000; cumulative = 2000 + 2000 = 4000
    expect(fin.cumulativeRevenue).toBe(4000);
  });

  it('calculates net profit correctly with fines', () => {
    const state = {
      ...createInitialGameState('id', 'v2-21day'),
      currentDay: 5,
      fines: 1000,
      cards: [],
    } as GameState;

    const prev: FinancialState = { ...BASE_FINANCIALS, totalSubscribers: 0, cumulativeRevenue: 0 };
    const fin = calculateFinancials(state, prev);
    // totalCosts = 5 * 500 = 2500; grossProfit = 0 - 2500 = -2500; fines = 1000; net = -3500
    expect(fin.totalCosts).toBe(2500);
    expect(fin.fines).toBe(1000);
    expect(fin.netProfit).toBe(-3500);
  });
});
