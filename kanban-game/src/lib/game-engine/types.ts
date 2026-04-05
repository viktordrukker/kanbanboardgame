export type ColumnId =
  | 'backlog'
  | 'ready'
  | 'analysis'
  | 'development'
  | 'testing'
  | 'readyToDeploy'
  | 'deployed';

export type Priority = 'standard' | 'expedite' | 'fixed-date';
export type CardColor = 'white' | 'yellow' | 'orange';
export type MemberRole = 'analyst' | 'developer' | 'tester';
export type DiceColor = 'red' | 'blue' | 'green';
export type GamePhase = 'event' | 'pull' | 'assign' | 'confirm' | 'complete';

export interface StoryCard {
  id: string;
  title: string;
  analysisEffort: number;
  developmentEffort: number;
  testingEffort: number;
  subscribers: number;
  priority: Priority;
  color: CardColor;
  startDay?: number;
  deployDay?: number;
  currentColumn: ColumnId;
}

export interface TeamMember {
  id: string;
  name: string;
  role: MemberRole;
  color: DiceColor;
  available: boolean;
  temporary?: boolean;
  temporaryUntilDay?: number;
}

export interface WipLimits {
  backlog: number | null;
  ready: number;
  analysis: number;
  development: number;
  testing: number;
  readyToDeploy: number | null;
  deployed: number | null;
}

export type EventEffect =
  | { type: 'add_member'; role: MemberRole; temporary?: boolean; days?: number; memberName?: string }
  | { type: 'remove_member'; memberId?: string; role?: MemberRole; days: number }
  | { type: 'change_wip'; column: ColumnId; newLimit: number }
  | { type: 'add_fine'; amount: number; condition?: string }
  | { type: 'expedite'; cardId?: string }
  | { type: 'no_work' }
  | { type: 'bonus_dice' }
  | { type: 'custom'; description: string };

export interface EventCard {
  id: string;
  day: number;
  title: string;
  description: string;
  effects: EventEffect[];
}

export interface DiceAssignment {
  memberId: string;
  cardId: string;
  roll: number;
}

export interface DaySnapshot {
  day: number;
  columnCounts: Record<ColumnId, number>;
  deployedCardIds: string[];
  financials: FinancialState;
}

export interface FinancialState {
  currentDay: number;
  totalSubscribers: number;
  dailyRevenue: number;
  cumulativeRevenue: number;
  totalCosts: number;
  grossProfit: number;
  fines: number;
  netProfit: number;
}

export const COLUMN_LABELS: Record<ColumnId, string> = {
  backlog: 'Backlog',
  ready: 'Ready',
  analysis: 'Analysis',
  development: 'Development',
  testing: 'Testing',
  readyToDeploy: 'Ready to Deploy',
  deployed: 'Deployed',
};

export const COLUMN_ORDER: ColumnId[] = [
  'backlog',
  'ready',
  'analysis',
  'development',
  'testing',
  'readyToDeploy',
  'deployed',
];

export const ROLE_TO_COLUMN: Record<MemberRole, ColumnId> = {
  analyst: 'analysis',
  developer: 'development',
  tester: 'testing',
};

export interface GameState {
  id: string;
  scenarioId: string;
  currentDay: number;
  maxDays: number;
  phase: GamePhase;
  cards: StoryCard[];
  members: TeamMember[];
  wipLimits: WipLimits;
  eventCards: EventCard[];
  currentEvent: EventCard | null;
  diceAssignments: DiceAssignment[];
  history: DaySnapshot[];
  financials: FinancialState;
  bonusDiceAvailable: number;
  noWorkToday: boolean;
  fines: number;
  status: 'active' | 'completed' | 'abandoned';
}

export interface ChartData {
  cfd: Array<{ day: number } & Record<ColumnId, number>>;
  cycleTime: Array<{ deployDay: number; cycleTime: number; cardId: string; title: string }>;
  financial: Array<{
    day: number;
    cumulativeRevenue: number;
    totalCosts: number;
    netProfit: number;
  }>;
}
