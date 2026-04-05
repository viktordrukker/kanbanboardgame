import type { StoryCard, EventCard, TeamMember, WipLimits } from '../types';

export const SCENARIO_ID = 'custom-35day';
export const MAX_DAYS = 35;

export const initialCards: StoryCard[] = [
  { id: 'S1',  title: 'Feature: Core Platform',         analysisEffort: 5,  developmentEffort: 10, testingEffort: 5,  subscribers: 300, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S2',  title: 'Feature: User Authentication',   analysisEffort: 4,  developmentEffort: 7,  testingEffort: 3,  subscribers: 150, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S3',  title: 'Feature: Admin Panel',           analysisEffort: 6,  developmentEffort: 12, testingEffort: 6,  subscribers: 250, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S4',  title: 'Feature: Payment Gateway',       analysisEffort: 7,  developmentEffort: 14, testingEffort: 7,  subscribers: 400, priority: 'fixed-date', color: 'orange', currentColumn: 'backlog' },
  { id: 'S5',  title: 'Feature: Email Notifications',   analysisEffort: 3,  developmentEffort: 5,  testingEffort: 2,  subscribers: 120, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S6',  title: 'Feature: File Upload',           analysisEffort: 4,  developmentEffort: 6,  testingEffort: 3,  subscribers: 140, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S7',  title: 'Feature: Real-time Updates',     analysisEffort: 6,  developmentEffort: 12, testingEffort: 5,  subscribers: 280, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S8',  title: 'Feature: Search & Filter',       analysisEffort: 4,  developmentEffort: 8,  testingEffort: 4,  subscribers: 170, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S9',  title: 'Feature: Reporting Engine',      analysisEffort: 8,  developmentEffort: 15, testingEffort: 7,  subscribers: 350, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S10', title: 'Feature: User Roles & Perms',    analysisEffort: 5,  developmentEffort: 9,  testingEffort: 4,  subscribers: 200, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S11', title: 'Feature: API Documentation',     analysisEffort: 4,  developmentEffort: 6,  testingEffort: 2,  subscribers: 130, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S12', title: 'Feature: Mobile App',            analysisEffort: 8,  developmentEffort: 16, testingEffort: 8,  subscribers: 450, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S13', title: 'Bug: Security Vulnerability',    analysisEffort: 2,  developmentEffort: 4,  testingEffort: 2,  subscribers: 0,   priority: 'expedite',   color: 'yellow', currentColumn: 'backlog' },
  { id: 'S14', title: 'Feature: Audit Trail',           analysisEffort: 4,  developmentEffort: 7,  testingEffort: 3,  subscribers: 160, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S15', title: 'Feature: SSO Integration',       analysisEffort: 6,  developmentEffort: 11, testingEffort: 5,  subscribers: 290, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S16', title: 'Feature: Data Migration Tool',   analysisEffort: 5,  developmentEffort: 9,  testingEffort: 4,  subscribers: 180, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S17', title: 'Feature: Backup & Recovery',     analysisEffort: 4,  developmentEffort: 8,  testingEffort: 4,  subscribers: 200, priority: 'fixed-date', color: 'orange', currentColumn: 'backlog' },
  { id: 'S18', title: 'Feature: Performance Dashboard', analysisEffort: 5,  developmentEffort: 10, testingEffort: 5,  subscribers: 230, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S19', title: 'Feature: Webhooks v2',           analysisEffort: 4,  developmentEffort: 7,  testingEffort: 3,  subscribers: 160, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S20', title: 'Feature: Custom Branding',       analysisEffort: 3,  developmentEffort: 6,  testingEffort: 3,  subscribers: 140, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S21', title: 'Feature: CLI Tool',              analysisEffort: 4,  developmentEffort: 8,  testingEffort: 4,  subscribers: 170, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S22', title: 'Feature: OAuth Provider',        analysisEffort: 5,  developmentEffort: 9,  testingEffort: 4,  subscribers: 210, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S23', title: 'Feature: Rate Limiting',         analysisEffort: 3,  developmentEffort: 5,  testingEffort: 2,  subscribers: 120, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S24', title: 'Feature: Event Streaming',       analysisEffort: 7,  developmentEffort: 13, testingEffort: 6,  subscribers: 320, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S25', title: 'Feature: PDF Export',            analysisEffort: 3,  developmentEffort: 5,  testingEffort: 2,  subscribers: 110, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S26', title: 'Feature: Charts & Graphs',       analysisEffort: 4,  developmentEffort: 8,  testingEffort: 4,  subscribers: 190, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S27', title: 'Feature: A/B Testing',           analysisEffort: 5,  developmentEffort: 9,  testingEffort: 4,  subscribers: 220, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S28', title: 'Feature: Localization',          analysisEffort: 4,  developmentEffort: 7,  testingEffort: 3,  subscribers: 150, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S29', title: 'Feature: AI Recommendations',    analysisEffort: 8,  developmentEffort: 15, testingEffort: 7,  subscribers: 400, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S30', title: 'Feature: Plugin System',         analysisEffort: 7,  developmentEffort: 13, testingEffort: 6,  subscribers: 300, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S31', title: 'Feature: Dark Mode',             analysisEffort: 2,  developmentEffort: 4,  testingEffort: 2,  subscribers: 80,  priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S32', title: 'Feature: Onboarding Flow',       analysisEffort: 4,  developmentEffort: 7,  testingEffort: 3,  subscribers: 170, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S33', title: 'Feature: Team Collaboration',    analysisEffort: 5,  developmentEffort: 10, testingEffort: 5,  subscribers: 250, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
  { id: 'S34', title: 'Feature: Compliance Reports',    analysisEffort: 5,  developmentEffort: 9,  testingEffort: 4,  subscribers: 200, priority: 'fixed-date', color: 'orange', currentColumn: 'backlog' },
  { id: 'S35', title: 'Feature: Enterprise SSO',        analysisEffort: 6,  developmentEffort: 12, testingEffort: 6,  subscribers: 350, priority: 'standard',   color: 'white', currentColumn: 'backlog' },
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
    id: 'E1', day: 3,
    title: 'Sprint Planning Gone Wrong',
    description: 'Poor sprint planning caused misalignment. Development WIP reduced to 4 for the rest of the sprint.',
    effects: [{ type: 'change_wip', column: 'development', newLimit: 4 }],
  },
  {
    id: 'E2', day: 7,
    title: 'Security Vulnerability Found',
    description: 'A critical security vulnerability was discovered. S13 must be expedited immediately.',
    effects: [{ type: 'expedite', cardId: 'S13' }],
  },
  {
    id: 'E3', day: 10,
    title: 'New Senior Developer Joins',
    description: 'A senior developer joins the team, boosting capacity.',
    effects: [{ type: 'add_member', role: 'developer', memberName: 'Senior Dev' }],
  },
  {
    id: 'E4', day: 14,
    title: 'Lead Tester on Sick Leave',
    description: 'Your lead tester has fallen ill and will be out for 3 days.',
    effects: [{ type: 'remove_member', role: 'tester', days: 3 }],
  },
  {
    id: 'E5', day: 18,
    title: 'Architecture Review',
    description: 'A mandatory architecture review — no development work today.',
    effects: [{ type: 'no_work' }],
  },
  {
    id: 'E6', day: 21,
    title: 'Mid-project Review',
    description: 'The mid-project review went well! Bonus dice for today.',
    effects: [{ type: 'bonus_dice' }],
  },
  {
    id: 'E7', day: 24,
    title: 'Scope Creep Fine',
    description: 'Scope creep from stakeholders results in a $1500 project fine.',
    effects: [{ type: 'add_fine', amount: 1500 }],
  },
  {
    id: 'E8', day: 28,
    title: 'Deploy Freeze Lifted',
    description: 'The deploy freeze is lifted. Increase testing WIP to 6 for the final push.',
    effects: [{ type: 'change_wip', column: 'testing', newLimit: 6 }],
  },
  {
    id: 'E9', day: 35,
    title: 'Final Release',
    description: 'Project complete! If fewer than 15 stories are deployed, a $3000 fine per missing story applies.',
    effects: [{ type: 'custom', description: 'Check if 15+ stories are deployed. Apply $3000 fine per missing story.' }],
  },
];
