# KanbanBoardGame.com — Full Rebuild & Modernization Spec
> For Claude Code. Written April 2026. Based on live analysis of the production site.

---

## 1. WHAT WE ARE BUILDING

A modern, open-source, free-to-play **Kanban Simulation Game** — a digital board game teaching Agile/Lean flow management through interactive gameplay. Players manage a software team, pull story cards through a Kanban board, roll dice to simulate work variability, and optimize for throughput and profit over 21 or 35 simulated days.

This is a direct, modernized clone of [kanbanboardgame.com](https://kanbanboardgame.com) with:
- A clean, contemporary UI replacing a 2014-era Bootstrap 3 design
- Working analytics (GA4), SEO meta, and social sharing
- A monetization-ready architecture (free tier + future paid facilitation mode)
- 100% open-source, zero commercial dependencies

---

## 2. ORIGINAL SITE — TECHNICAL AUTOPSY

### 2.1 Tech Stack (Legacy)
| Layer | Technology | Status |
|---|---|---|
| Framework | ASP.NET MVC (.NET Framework ~4.5) | ❌ Obsolete |
| CSS | Bootstrap 3 (`col-xs-*`) | ❌ Abandoned 2019 |
| JS | jQuery 1.x/2.x | ⚠️ Outdated |
| Auth | ASP.NET Identity | ✅ Working |
| Analytics | Google Universal Analytics (UA-42261279-9) | ❌ DEAD (retired Jul 2023) |
| Social | AddThis widget | ❌ DEAD (shut down May 2023) |
| Build | ASP.NET MVC Bundling | ❌ Obsolete |
| Database | SQL Server (assumed) | ✅ Working |
| Charts | Unknown (server-rendered or jQuery plugin) | Unknown |

### 2.2 Routes Identified (from JS bundle analysis)
```
GET  /                          → Home / Login page
GET  /Account/Register          → Registration form
GET  /Account/Manage            → Account settings
GET  /Account/LogOff            → Logout (redirect)
POST /Account/LogOff            → Logout
GET  /Game (or /Games)          → Game list / Dashboard (auth required)
POST /Game/Delete/{gameId}      → Delete a game (auth required)
GET  /Game/Play/{gameId}        → Game board (auth required)
GET  /Game/New                  → Create new game form (auth required)
```

### 2.3 Known Bugs / Issues
- Google Analytics silent failure (no data collected since July 2023)
- AddThis widget throws JS errors (dead CDN)
- No meta description (SEO gap)
- `html` tag missing `lang` attribute
- No favicon (or uses default browser placeholder)
- Bootstrap 3 `col-xs-*` classes deprecated (still works but unsupported)
- No CSRF visible hardening beyond ASP.NET defaults

---

## 3. GAME MECHANICS — COMPLETE SPECIFICATION

### 3.1 Board Layout

The board has **7 columns** representing a software development workflow:

```
[BACKLOG] → [READY] → [ANALYSIS] → [DEVELOPMENT] → [TESTING] → [READY TO DEPLOY] → [DEPLOYED]
 unlimited   WIP: 6    WIP: 4         WIP: 5          WIP: 4      unlimited           done
```

> WIP limits are the *default starting state*. Event cards may instruct the player to change them during the game.

### 3.2 Story Cards

Each story card has:
```typescript
interface StoryCard {
  id: string;                  // e.g. "S1", "S2", ... "S21"
  title: string;               // "Feature: Search", etc.
  analysisEffort: number;      // effort points remaining in Analysis
  developmentEffort: number;   // effort points remaining in Development
  testingEffort: number;       // effort points remaining in Testing
  subscribers: number;         // revenue value (new subscribers per day when deployed)
  priority: 'standard' | 'expedite' | 'fixed-date';
  color: 'white' | 'yellow' | 'orange'; // standard / expedite / fixed-date
  startDay?: number;           // day the card entered Ready column
  deployDay?: number;          // day the card was deployed
  currentColumn: ColumnId;
}
```

**Scenarios include:**
- **Scenario 1 (21 days):** Based on getKanban v2 free cards. ~21 story cards.
- **Scenario 2 (35 days):** Custom event card set. ~35 story cards.

### 3.3 Team Members

Each team member is a **specialist** with a dice color representing their domain:

```typescript
interface TeamMember {
  id: string;
  name: string;
  role: 'analyst' | 'developer' | 'tester';
  color: 'red' | 'blue' | 'green'; // analyst=red, developer=blue, tester=green
  available: boolean;              // false when blocked by event card
}
```

**Default team composition:**
- 2 Analysts (red)
- 3 Developers (blue)
- 2 Testers (green)

**Specialization Rule:** When a member works **in their specialty column**, dice roll effectiveness is **doubled**. Cross-trained work (outside specialty) uses raw dice roll.

### 3.4 Daily Dice Mechanic

Each day follows this turn sequence:

```
1. REVEAL EVENT CARD (if any for this day)
2. RESOLVE EVENT (apply changes to board state)
3. PULL PHASE — move cards right (from right-most columns first)
   - Cards with 0 effort remaining in current column → advance to next column
   - WIP limits must be respected
4. WORK PHASE — assign team members to cards
   - Each available member rolls 1d6
   - If member's role matches card's current column: effectiveness = roll × 2
   - If cross-column assignment: effectiveness = roll × 1
   - Subtract effectiveness from card's current effort
5. UPDATE CHARTS (CFD, Cycle Time, Financial)
6. ADVANCE DAY COUNTER
```

### 3.5 Financial Model

```typescript
interface FinancialState {
  currentDay: number;
  totalSubscribers: number;       // sum of all deployed card subscriber values
  dailyRevenue: number;           // totalSubscribers × revenuePerSubscriber (e.g. $10/subscriber/day)
  cumulativeRevenue: number;
  totalCosts: number;             // fixed team cost per day × days elapsed
  grossProfit: number;            // cumulativeRevenue - totalCosts
  fines: number;                  // accumulated from event cards (missed deadlines, etc.)
  netProfit: number;              // grossProfit - fines
}
```

**Revenue trigger:** A story starts earning revenue the day **after** it reaches the Deployed column.

### 3.6 Event Cards

Event cards are drawn on specific days and create game-changing situations. Known examples:

| Day | Event Description | Effect |
|-----|------------------|--------|
| Day 5 | "New Hire — Junior Developer" | Add 1 Developer (lower effectiveness) |
| Day 8 | "Conference — Analyst away" | 1 Analyst unavailable for 2 days |
| Day 10 | "Expedite request" | Must move nominated card to expedite lane |
| Day 12 | "Reduce WIP in Development" | Set Dev WIP limit to 3 |
| Day 15 | "Retrospective" | Gain 1 extra dice assignment this day |
| Day 18 | "System outage" | No work done this day |
| Day 21 | "Release deadline" | Fine if fewer than X stories deployed |

> Note: Exact event card text lives in scenario data files (JSON). The engine handles them as generic `EventCard` objects.

```typescript
interface EventCard {
  id: string;
  day: number;
  title: string;
  description: string;
  effect: EventEffect;    // see below
}

type EventEffect =
  | { type: 'add_member'; role: TeamMember['role']; temporary?: boolean; days?: number }
  | { type: 'remove_member'; memberId: string; days: number }
  | { type: 'change_wip'; column: ColumnId; newLimit: number }
  | { type: 'add_fine'; amount: number; condition?: string }
  | { type: 'expedite'; cardId: string }
  | { type: 'no_work' }
  | { type: 'bonus_dice' }
  | { type: 'custom'; description: string }; // manual resolution
```

### 3.7 Charts

**Cumulative Flow Diagram (CFD):**
- X-axis: Day number
- Y-axis: Card count (stacked by column)
- One line per column, area chart, colored by column

**Cycle Time Chart:**
- X-axis: Deploy day
- Y-axis: Days from "entered Ready" to "Deployed"
- Scatter plot, one dot per deployed card

**Financial Chart:**
- X-axis: Day number
- Y-axis: $ value
- Lines: Cumulative Revenue, Cumulative Cost, Net Profit

---

## 4. DATA MODELS (DATABASE SCHEMA)

```sql
-- Users
users (
  id          UUID PRIMARY KEY,
  username    VARCHAR(50) UNIQUE NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW()
)

-- Games
games (
  id          UUID PRIMARY KEY,
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  scenario_id VARCHAR(20) NOT NULL,  -- 'v2-21day' | 'custom-35day'
  name        VARCHAR(100),
  current_day INT DEFAULT 1,
  status      VARCHAR(20) DEFAULT 'active', -- 'active' | 'completed' | 'abandoned'
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
)

-- Game state snapshots (one row per day per game)
game_snapshots (
  id          UUID PRIMARY KEY,
  game_id     UUID REFERENCES games(id) ON DELETE CASCADE,
  day         INT NOT NULL,
  board_state JSONB NOT NULL,   -- full BoardState snapshot
  created_at  TIMESTAMP DEFAULT NOW(),
  UNIQUE(game_id, day)
)
```

---

## 5. NEW TECH STACK

### 5.1 Chosen Stack (all free, open-source, production-ready)

| Layer | Technology | Rationale |
|---|---|---|
| **Runtime** | Node.js 20 LTS | Universal, free hosting everywhere |
| **Framework** | Next.js 14 (App Router) | Full-stack, SSR, API routes, free Vercel deploy |
| **Language** | TypeScript 5 | Type safety, essential for game logic |
| **Styling** | Tailwind CSS 3 + shadcn/ui | Modern, fast, accessible components |
| **State (game)** | Zustand | Lightweight, perfect for game state |
| **Database** | PostgreSQL + Prisma ORM | Open source, relational, type-safe |
| **Auth** | NextAuth.js v5 (credentials) | Free, simple, works with Prisma |
| **Charts** | Recharts | React-native, composable, free |
| **Drag & Drop** | @dnd-kit/core | Modern, accessible, replaces jQuery UI |
| **Animations** | Framer Motion | Smooth card transitions |
| **Icons** | Lucide React | Free, consistent icon set |
| **Analytics** | Umami (self-hosted) OR Plausible | GDPR-friendly, open-source GA4 replacement |
| **Testing** | Vitest + Playwright | Unit + E2E, free |
| **Deployment** | Vercel (hobby = free) | Zero-config Next.js hosting |

### 5.2 Rejected Stack Options
- ❌ Vite+React SPA — no SSR, harder auth, separate API server needed
- ❌ Remix — smaller ecosystem, same power as Next.js
- ❌ Supabase — fine but adds a vendor lock-in; raw Prisma is more portable
- ❌ tRPC — overkill for this project size

---

## 6. PROJECT STRUCTURE

```
kanban-game/
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── seed.ts                    # Scenario card/event data seeder
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (game)/
│   │   │   ├── dashboard/page.tsx # Game list
│   │   │   └── game/[id]/page.tsx # Game board
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── games/
│   │   │   │   ├── route.ts       # GET list, POST create
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts   # GET, DELETE
│   │   │   │       └── action/route.ts  # POST game actions
│   │   └── layout.tsx
│   ├── components/
│   │   ├── board/
│   │   │   ├── KanbanBoard.tsx    # Main board container
│   │   │   ├── BoardColumn.tsx    # Single column with WIP indicator
│   │   │   ├── StoryCard.tsx      # Draggable card component
│   │   │   ├── CardDetail.tsx     # Card modal (effort breakdown)
│   │   │   └── WipIndicator.tsx   # WIP limit badge
│   │   ├── game/
│   │   │   ├── DayCounter.tsx     # Current day display
│   │   │   ├── DiceRoller.tsx     # Animated dice + assignment UI
│   │   │   ├── TeamPanel.tsx      # Team members sidebar
│   │   │   ├── MemberCard.tsx     # Individual team member
│   │   │   ├── EventCardModal.tsx # Daily event card popup
│   │   │   └── FinancialSummary.tsx
│   │   ├── charts/
│   │   │   ├── CumulativeFlowDiagram.tsx
│   │   │   ├── CycleTimeChart.tsx
│   │   │   └── FinancialChart.tsx
│   │   └── ui/                    # shadcn/ui components (auto-generated)
│   ├── lib/
│   │   ├── game-engine/
│   │   │   ├── engine.ts          # Core game logic (pure functions)
│   │   │   ├── scenarios/
│   │   │   │   ├── v2-21day.ts    # Scenario 1 card + event data
│   │   │   │   └── custom-35day.ts # Scenario 2 card + event data
│   │   │   ├── types.ts           # All TypeScript interfaces
│   │   │   ├── dice.ts            # Dice rolling logic
│   │   │   ├── financial.ts       # Revenue/cost calculations
│   │   │   └── charts.ts          # Chart data transformation
│   │   ├── store/
│   │   │   └── game-store.ts      # Zustand game state store
│   │   ├── db.ts                  # Prisma client singleton
│   │   └── auth.ts                # NextAuth config
│   └── types/
│       └── next-auth.d.ts         # Auth type extensions
├── public/
│   └── (favicon, og-image, etc.)
├── tests/
│   ├── unit/
│   │   ├── engine.test.ts         # Game logic unit tests
│   │   └── financial.test.ts
│   └── e2e/
│       ├── auth.spec.ts
│       └── game.spec.ts
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 7. CORE GAME ENGINE (Pure Functions — No Framework Dependency)

The game engine must be **pure TypeScript with zero side effects**. All state changes return new state objects. This makes it fully testable and portable.

```typescript
// src/lib/game-engine/engine.ts

export function processDayStart(state: GameState): GameState {
  // 1. Reveal today's event card
  // 2. Apply automatic event effects
  // 3. Return updated state
}

export function pullCards(state: GameState): GameState {
  // Move cards from right to left where effort = 0
  // Respect WIP limits
  // Return new state
}

export function assignDice(
  state: GameState,
  assignments: DiceAssignment[]
): GameState {
  // Apply dice rolls to assigned cards
  // Apply specialization doubling
  // Subtract effort from cards
  // Return new state
}

export function endDay(state: GameState): GameState {
  // Calculate financials
  // Record chart data point
  // Advance day counter
  // Check win/loss conditions
  // Return final state for the day
}

export function calculateChartData(history: DaySnapshot[]): ChartData {
  // Transform history into CFD, CycleTime, Financial datasets
}
```

---

## 8. API ENDPOINTS

```
POST /api/auth/register         → Create account
POST /api/auth/login            → Login (NextAuth)
POST /api/auth/logout           → Logout

GET  /api/games                 → List user's games
POST /api/games                 → Create new game { scenarioId, name }
GET  /api/games/:id             → Get game state
DELETE /api/games/:id           → Delete game

POST /api/games/:id/action      → Perform game action
  Body: { type: 'pull_cards' }
  Body: { type: 'assign_dice', assignments: [...] }
  Body: { type: 'end_day' }
  Body: { type: 'resolve_event', resolution: {...} }

GET  /api/games/:id/history     → Get all day snapshots (for charts)
```

---

## 9. UI/UX DESIGN SPECIFICATION

### 9.1 Design Philosophy
- **Reference:** Linear.app, Vercel Dashboard, Notion — clean, minimal, purposeful
- **Color palette:**
  - Background: `slate-950` (near-black)
  - Board surface: `slate-900`
  - Columns: `slate-800` with `slate-700` borders
  - Cards: white with colored left-border by type
  - Analysts: `red-500`, Developers: `blue-500`, Testers: `green-500`
  - Expedite cards: `amber-400` border
  - Deployed: `emerald-500` column header

### 9.2 Kanban Board Layout
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🎯 KanbanGame    Day 12 / 21    💰 $42,300    ⏩ Next Day    [Charts] [⚙]  │
├──────────┬────────┬──────────┬─────────────┬─────────┬──────────┬──────────┤
│ BACKLOG  │ READY  │ ANALYSIS │ DEVELOPMENT │ TESTING │ READY TO │ DEPLOYED │
│          │ WIP:6  │  WIP:4   │   WIP:5     │  WIP:4  │  DEPLOY  │          │
│  [card]  │[card]  │ [card]   │   [card]    │ [card]  │  [card]  │  [card]  │
│  [card]  │[card]  │ [card]   │   [card]    │ [card]  │          │  [card]  │
│  [card]  │        │          │   [card]    │         │          │  [card]  │
│  ...     │        │          │             │         │          │          │
└──────────┴────────┴──────────┴─────────────┴─────────┴──────────┴──────────┘
│ TEAM: [👤 Ana R:●] [👤 Bob D:●] [👤 Cal D:●] [👤 Dev D:●] [👤 Eve T:●]    │
│ DICE:  [🎲 Roll All]  Ana→S4 · Bob→S7 · Cal→S7 · Dev→S9 · Eve→S11         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 9.3 Story Card Design
```
┌─────────────────────┐
│ ● S7                │  ← colored dot = priority
│ User Authentication │
├─────────────────────┤
│ Analysis:  ██░░  4  │
│ Dev:       ███░  6  │  ← progress bars for effort
│ Test:      ██░░  3  │
├─────────────────────┤
│ 📈 +250 subscribers │
└─────────────────────┘
```

### 9.4 Dice Assignment UI
- Click "Roll Dice" → animated dice roll for each team member
- Dice values appear on member avatars
- Drag dice onto a column OR click member → select target card
- Specialization bonus shows as "×2" badge when in-lane
- Remaining effort updates live as assignments are made
- "Confirm Day" button only enabled when all dice assigned

### 9.5 Event Card Modal
- Full-screen overlay with card flip animation
- Card shows: Day, Title, Flavor text, Effect description
- Action buttons: "Accept" / "Resolve" (for complex effects)

---

## 10. MONETIZATION-READY ARCHITECTURE (Post-MVP)

The architecture should support a future paid tier without a full rewrite:

```typescript
// User tiers (seed into DB)
type UserTier = 'free' | 'facilitator' | 'team';

// Free tier: unlimited solo play, both scenarios
// Facilitator ($9/mo): Create shareable game rooms, multiplayer facilitation mode
// Team ($29/mo): Up to 10 concurrent players, leaderboards, custom scenarios
```

Add `tier` field to users table from Day 1.

---

## 11. ANALYTICS & SEO (Fix the Broken Stuff First)

### 11.1 GA4 Setup (replace dead UA)
```typescript
// src/app/layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google'
// <GoogleAnalytics gaId="G-XXXXXXXXXX" />
```

### 11.2 Meta Tags (add to every page)
```typescript
export const metadata: Metadata = {
  title: 'Kanban Board Game — Free Online Agile Simulator',
  description: 'Learn Kanban methodology by playing a free browser-based simulation. Pull story cards, manage WIP limits, and optimize flow. No download required.',
  openGraph: { ... },
  twitter: { ... }
}
```

### 11.3 Social Sharing (replace dead AddThis)
Use native Web Share API + manual share buttons (Twitter/X, LinkedIn).

---

## 12. IMPLEMENTATION PHASES FOR CLAUDE CODE

### Phase 1 — Foundation (Days 1-2)
1. `npx create-next-app@latest kanban-game --typescript --tailwind --app`
2. Install: `prisma`, `@prisma/client`, `next-auth@beta`, `zustand`, `recharts`, `@dnd-kit/core`, `framer-motion`, `lucide-react`
3. Set up Prisma schema + PostgreSQL (local Docker or Railway free tier)
4. Scaffold NextAuth with credentials provider
5. Create register/login pages

### Phase 2 — Game Engine (Days 3-4)
1. Define all TypeScript interfaces in `src/lib/game-engine/types.ts`
2. Build scenario data files (v2-21day.ts, custom-35day.ts) with all cards + events
3. Implement pure game engine functions (pull, assign, financial, charts)
4. Write unit tests for ALL engine functions (Vitest)
5. Build API routes for game CRUD + actions

### Phase 3 — Game Board UI (Days 5-7)
1. Build `KanbanBoard` → `BoardColumn` → `StoryCard` component tree
2. Implement drag-and-drop with @dnd-kit (card movement)
3. Build `DiceRoller` component with animation
4. Build `TeamPanel` with member cards
5. Build `EventCardModal` with flip animation
6. Wire everything to Zustand store + API

### Phase 4 — Charts & Polish (Days 8-9)
1. Build CFD, Cycle Time, Financial charts with Recharts
2. Add game dashboard (list/create/delete games)
3. Add account management page
4. Add win/loss screen with final stats
5. SEO meta, GA4, favicon, OG image

### Phase 5 — Testing & Deploy (Day 10)
1. Playwright E2E: full game walkthrough
2. Fix any broken flows
3. Deploy to Vercel
4. Configure production PostgreSQL (Railway or Supabase free tier)

---

## 13. CRITICAL RULES FOR CLAUDE CODE

1. **Game engine is PURE FUNCTIONS ONLY** — no database calls, no React hooks, no side effects inside `src/lib/game-engine/`. Test coverage must be 100% for this folder.

2. **Never hard-code game data in components** — all cards and events come from scenario JSON/TS data files. Components receive props.

3. **Zustand store is the single source of truth** on the client. Server state is only loaded on mount and after confirmed server actions.

4. **All API routes must validate auth** — use `getServerSession()` in every route handler.

5. **WIP limits are enforced in the engine** — the UI can show "would exceed WIP" warnings but the engine must reject invalid moves server-side.

6. **The dice assignment phase must complete before `endDay` is callable** — add a `phase` field to `GameState`: `'event' | 'pull' | 'assign' | 'confirm'`.

7. **Never store passwords in plain text** — use `bcryptjs` with salt rounds ≥ 12.

8. **Every database write returns the updated game state** — no separate GET needed after a POST action.

9. **Charts must be responsive** — use `ResponsiveContainer` from Recharts, never fixed pixel widths.

10. **Run `tsc --noEmit` and `vitest run` before calling anything done** — the build must not contain TypeScript errors or failing unit tests.

---

## 14. ENVIRONMENT VARIABLES (.env.example)

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/kanban_game"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_GA4_ID="G-XXXXXXXXXX"  # optional, add after MVP
```

---

## 15. QUICK-START COMMANDS FOR CLAUDE CODE

```bash
# Bootstrap
npx create-next-app@latest kanban-game --typescript --tailwind --app --src-dir
cd kanban-game

# Dependencies
npm install prisma @prisma/client next-auth@beta @auth/prisma-adapter
npm install zustand recharts @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install framer-motion lucide-react bcryptjs
npm install -D vitest @vitest/ui playwright @playwright/test

# Shadcn/ui init
npx shadcn@latest init
npx shadcn@latest add button card badge dialog sheet tabs tooltip progress

# Database
npx prisma init
# (edit schema.prisma with the models from Section 4)
npx prisma db push
npx prisma db seed

# Dev
npm run dev
```

---

*End of spec. Total estimated rebuild time with Claude Code: 8–12 hours of generation + testing.*
