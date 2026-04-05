import type { GameState, FinancialState } from './types';

const REVENUE_PER_SUBSCRIBER_PER_DAY = 10;
const DAILY_TEAM_COST = 500;

export function calculateFinancials(
  state: GameState,
  previousFinancials: FinancialState,
): FinancialState {
  const deployedCards = state.cards.filter((c) => c.currentColumn === 'deployed');
  const totalSubscribers = deployedCards.reduce((sum, c) => sum + c.subscribers, 0);
  const dailyRevenue = totalSubscribers * REVENUE_PER_SUBSCRIBER_PER_DAY;

  // Revenue starts the day AFTER deployment, so we use previous subscribers
  const prevDeployedCards = previousFinancials.totalSubscribers;
  const todayRevenue = prevDeployedCards * REVENUE_PER_SUBSCRIBER_PER_DAY;

  const cumulativeRevenue = previousFinancials.cumulativeRevenue + todayRevenue;
  const totalCosts = state.currentDay * DAILY_TEAM_COST;
  const grossProfit = cumulativeRevenue - totalCosts;
  const fines = state.fines;
  const netProfit = grossProfit - fines;

  return {
    currentDay: state.currentDay,
    totalSubscribers,
    dailyRevenue,
    cumulativeRevenue,
    totalCosts,
    grossProfit,
    fines,
    netProfit,
  };
}
