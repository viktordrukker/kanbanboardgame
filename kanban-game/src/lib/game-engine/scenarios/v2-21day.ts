import type { StoryCard, EventCard, TeamMember, WipLimits } from '../types';

export const SCENARIO_ID = 'v2-21day';
export const MAX_DAYS = 21;

export const initialCards: StoryCard[] = [
  { id: 'S1',  title: 'Feature: User Login',          analysisEffort: 3,  developmentEffort: 5,  testingEffort: 2,  subscribers: 150, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S2',  title: 'Feature: User Registration',   analysisEffort: 4,  developmentEffort: 6,  testingEffort: 3,  subscribers: 120, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S3',  title: 'Feature: Dashboard',           analysisEffort: 5,  developmentEffort: 8,  testingEffort: 4,  subscribers: 200, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S4',  title: 'Feature: Search',              analysisEffort: 3,  developmentEffort: 4,  testingEffort: 2,  subscribers: 100, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S5',  title: 'Feature: Notifications',       analysisEffort: 4,  developmentEffort: 6,  testingEffort: 3,  subscribers: 180, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S6',  title: 'Feature: Profile Page',        analysisEffort: 2,  developmentEffort: 4,  testingEffort: 2,  subscribers: 90,  priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S7',  title: 'Feature: Settings',            analysisEffort: 3,  developmentEffort: 5,  testingEffort: 2,  subscribers: 110, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S8',  title: 'Feature: Reporting',           analysisEffort: 6,  developmentEffort: 10, testingEffort: 5,  subscribers: 250, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S9',  title: 'Feature: Export Data',         analysisEffort: 3,  developmentEffort: 5,  testingEffort: 3,  subscribers: 130, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S10', title: 'Feature: Import Data',         analysisEffort: 4,  developmentEffort: 6,  testingEffort: 4,  subscribers: 140, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S11', title: 'Feature: API Integration',     analysisEffort: 5,  developmentEffort: 9,  testingEffort: 4,  subscribers: 220, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S12', title: 'Feature: Mobile Layout',       analysisEffort: 4,  developmentEffort: 7,  testingEffort: 3,  subscribers: 190, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S13', title: 'Bug: Fix Login Error',         analysisEffort: 1,  developmentEffort: 3,  testingEffort: 1,  subscribers: 60,  priority: 'expedite',   color: 'yellow', currentColumn: 'backlog' },
  { id: 'S14', title: 'Feature: Audit Log',           analysisEffort: 4,  developmentEffort: 6,  testingEffort: 3,  subscribers: 160, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S15', title: 'Feature: Two-Factor Auth',     analysisEffort: 5,  developmentEffort: 8,  testingEffort: 4,  subscribers: 230, priority: 'fixed-date', color: 'orange', currentColumn: 'backlog' },
  { id: 'S16', title: 'Feature: Webhooks',            analysisEffort: 5,  developmentEffort: 8,  testingEffort: 4,  subscribers: 200, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S17', title: 'Feature: Dark Mode',           analysisEffort: 2,  developmentEffort: 4,  testingEffort: 2,  subscribers: 80,  priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S18', title: 'Feature: Email Templates',     analysisEffort: 3,  developmentEffort: 5,  testingEffort: 2,  subscribers: 100, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S19', title: 'Feature: Analytics Dashboard', analysisEffort: 6,  developmentEffort: 10, testingEffort: 5,  subscribers: 270, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S20', title: 'Feature: Role Management',     analysisEffort: 4,  developmentEffort: 7,  testingEffort: 3,  subscribers: 175, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S21', title: 'Feature: Bulk Actions',        analysisEffort: 3,  developmentEffort: 5,  testingEffort: 3,  subscribers: 120, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
];

export const initialMembers: TeamMember[] = [
  { id: 'M1', name: 'Alice',   role: 'analyst',   color: 'red',   available: true },
  { id: 'M2', name: 'Bob',     role: 'analyst',   color: 'red',   available: true },
  { id: 'M3', name: 'Charlie', role: 'developer', color: 'blue',  available: true },
  { id: 'M4', name: 'Diana',   role: 'developer', color: 'blue',  available: true },
  { id: 'M5', name: 'Eve',     role: 'developer', color: 'blue',  available: true },
  { id: 'M6', name: 'Frank',   role: 'tester',    color: 'green', available: true },
  { id: 'M7', name: 'Grace',   role: 'tester',    color: 'green', available: true },
];

export const defaultWipLimits: WipLimits = {
  backlog: null,
  ready: 6,
  analysis: 4,
  development: 5,
  testing: 4,
  readyToDeploy: null,
  deployed: null,
};

export const eventCards: EventCard[] = [
  {
    id: 'E1',
    day: 5,
    title: 'New Hire — Junior Developer',
    description: 'A junior developer joins the team today. Their effectiveness is slightly lower than senior members.',
    effects: [{ type: 'add_member', role: 'developer', temporary: false, memberName: 'Junior Dev' }],
  },
  {
    id: 'E2',
    day: 8,
    title: 'Conference — Analyst Away',
    description: 'One of your analysts is attending a conference and will be unavailable for 2 days.',
    effects: [{ type: 'remove_member', role: 'analyst', days: 2 }],
  },
  {
    id: 'E3',
    day: 10,
    title: 'Expedite Request',
    description: 'The business has requested that S13 (Fix Login Error) be treated as the highest priority. Move it to the expedite lane immediately.',
    effects: [{ type: 'expedite', cardId: 'S13' }],
  },
  {
    id: 'E4',
    day: 12,
    title: 'Reduce WIP in Development',
    description: 'After a quality review, management has decided to reduce the WIP limit in Development to 3 to improve focus.',
    effects: [{ type: 'change_wip', column: 'development', newLimit: 3 }],
  },
  {
    id: 'E5',
    day: 15,
    title: 'Retrospective Insights',
    description: 'The team retrospective went well! Everyone is energized and you get one bonus dice assignment today.',
    effects: [{ type: 'bonus_dice' }],
  },
  {
    id: 'E6',
    day: 18,
    title: 'System Outage',
    description: 'A major system outage has occurred. No development work can be done today.',
    effects: [{ type: 'no_work' }],
  },
  {
    id: 'E7',
    day: 21,
    title: 'Release Deadline',
    description: 'The final day! If fewer than 8 stories are deployed, the project incurs a $2000 fine per missing story.',
    effects: [{ type: 'custom', description: 'Check if 8+ stories are deployed. Apply $2000 fine per missing story.' }],
  },
];
