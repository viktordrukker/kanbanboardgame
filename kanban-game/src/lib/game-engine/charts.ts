import type { DaySnapshot, ChartData, ColumnId, GameState } from './types';
import { COLUMN_ORDER } from './types';

export function calculateChartData(state: GameState, history: DaySnapshot[]): ChartData {
  const cfd = history.map((snap) => ({
    day: snap.day,
    backlog: snap.columnCounts.backlog,
    ready: snap.columnCounts.ready,
    analysis: snap.columnCounts.analysis,
    development: snap.columnCounts.development,
    testing: snap.columnCounts.testing,
    readyToDeploy: snap.columnCounts.readyToDeploy,
    deployed: snap.columnCounts.deployed,
  }));

  const cycleTime = state.cards
    .filter((c) => c.deployDay !== undefined && c.startDay !== undefined)
    .map((c) => ({
      deployDay: c.deployDay!,
      cycleTime: c.deployDay! - c.startDay!,
      cardId: c.id,
      title: c.title,
    }));

  const financial = history.map((snap) => ({
    day: snap.day,
    cumulativeRevenue: snap.financials.cumulativeRevenue,
    totalCosts: snap.financials.totalCosts,
    netProfit: snap.financials.netProfit,
  }));

  return { cfd, cycleTime, financial };
}

export function snapshotColumnCounts(state: GameState): Record<ColumnId, number> {
  const counts: Record<ColumnId, number> = {
    backlog: 0,
    ready: 0,
    analysis: 0,
    development: 0,
    testing: 0,
    readyToDeploy: 0,
    deployed: 0,
  };
  for (const card of state.cards) {
    counts[card.currentColumn]++;
  }
  return counts;
}
