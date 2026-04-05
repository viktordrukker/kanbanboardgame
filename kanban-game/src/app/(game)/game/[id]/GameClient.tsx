'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import type { GameState, DiceAssignment } from '@/lib/game-engine/types';
import { calculateChartData } from '@/lib/game-engine/charts';
import KanbanBoard from '@/components/board/KanbanBoard';
import DiceRoller from '@/components/game/DiceRoller';
import EventCardModal from '@/components/game/EventCardModal';
import FinancialSummary from '@/components/game/FinancialSummary';
import CumulativeFlowDiagram from '@/components/charts/CumulativeFlowDiagram';
import CycleTimeChart from '@/components/charts/CycleTimeChart';
import FinancialChart from '@/components/charts/FinancialChart';
import { Button } from '@/components/ui/button';

interface Props {
  gameId: string;
  initialState: GameState | null;
  gameName?: string;
}

export default function GameClient({ gameId, initialState, gameName }: Props) {
  const [state, setState] = useState<GameState | null>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCharts, setShowCharts] = useState(false);

  const performAction = useCallback(async (action: object) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/games/${gameId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Action failed');
      setState(data.state);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  // Auto-start day on mount if in event phase with no event shown
  useEffect(() => {
    if (state?.phase === 'event' && !state.currentEvent) {
      performAction({ type: 'start_day' });
    }
  }, []); // intentionally run once on mount

  if (!state) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Loading game...
      </div>
    );
  }

  const chartData = calculateChartData(state, state.history);

  const handleResolveEvent = () => performAction({ type: 'resolve_event' });
  const handlePullCards = () => performAction({ type: 'pull_cards' });
  const handleAssignDice = (assignments: DiceAssignment[]) =>
    performAction({ type: 'assign_dice', assignments });
  const handleEndDay = () => performAction({ type: 'end_day' });

  if (state.phase === 'complete') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-3xl font-bold mb-2">Game Complete!</h1>
          <p className="text-slate-400 mb-6">
            Played {state.maxDays} days · {state.cards.filter((c) => c.currentColumn === 'deployed').length} stories deployed
          </p>
          <div className="bg-slate-900 rounded-xl border border-slate-700 p-6 mb-8 text-left">
            <FinancialSummary financials={state.financials} />
          </div>
          {showCharts ? (
            <div className="bg-slate-900 rounded-xl border border-slate-700 p-4 mb-6 text-left">
              <h2 className="text-base font-semibold mb-3">Cumulative Flow</h2>
              <CumulativeFlowDiagram data={chartData.cfd} />
              <h2 className="text-base font-semibold mt-6 mb-3">Financial</h2>
              <FinancialChart data={chartData.financial} />
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setShowCharts(true)} className="mb-6">
              View Charts
            </Button>
          )}
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Event modal */}
      {state.phase === 'event' && state.currentEvent && (
        <EventCardModal
          event={state.currentEvent}
          onDismiss={handleResolveEvent}
          loading={loading}
        />
      )}

      {/* Top bar */}
      <header className="border-b border-slate-800 px-4 py-2 flex items-center gap-4 shrink-0">
        <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm">← Back</Link>
        <span className="font-bold">{gameName ?? 'Game'}</span>
        <span className="text-slate-400 text-sm">
          Day <span className="text-white font-semibold">{state.currentDay}</span>
          <span className="text-slate-500">/{state.maxDays}</span>
        </span>
        <span className="ml-auto text-sm text-emerald-400 font-semibold">
          ${state.financials.netProfit.toLocaleString()}
        </span>
        <Button variant="outline" size="sm" onClick={() => setShowCharts(!showCharts)}>
          {showCharts ? 'Hide Charts' : 'Charts'}
        </Button>
      </header>

      {/* Error banner */}
      {error && (
        <div className="bg-red-900/40 border-b border-red-700 px-4 py-2 text-sm text-red-300 flex items-center justify-between">
          <span>⚠ {error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200">✕</button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Main: board */}
        <main className="flex-1 overflow-auto p-3">
          <KanbanBoard state={state} />

          {/* Charts section */}
          {showCharts && (
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              <div className="bg-slate-900 rounded-xl border border-slate-700 p-4">
                <h3 className="text-sm font-semibold mb-3 text-slate-300">Cumulative Flow</h3>
                <CumulativeFlowDiagram data={chartData.cfd} />
              </div>
              <div className="bg-slate-900 rounded-xl border border-slate-700 p-4">
                <h3 className="text-sm font-semibold mb-3 text-slate-300">Cycle Time</h3>
                <CycleTimeChart data={chartData.cycleTime} />
              </div>
              <div className="bg-slate-900 rounded-xl border border-slate-700 p-4">
                <h3 className="text-sm font-semibold mb-3 text-slate-300">Financial</h3>
                <FinancialChart data={chartData.financial} />
              </div>
            </div>
          )}
        </main>

        {/* Sidebar */}
        <aside className="w-72 shrink-0 border-l border-slate-800 overflow-y-auto p-3 space-y-4 bg-slate-900/50">
          {/* Phase indicator */}
          <div className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
            Phase: <span className="text-white capitalize">{state.phase}</span>
          </div>

          {/* Phase actions */}
          {state.phase === 'event' && !state.currentEvent && (
            <Button
              size="sm"
              className="w-full"
              onClick={() => performAction({ type: 'start_day' })}
              disabled={loading}
            >
              {loading ? 'Loading...' : `Start Day ${state.currentDay}`}
            </Button>
          )}

          {state.phase === 'pull' && (
            <Button size="sm" className="w-full" onClick={handlePullCards} disabled={loading}>
              {loading ? 'Pulling...' : '⬅ Pull Cards'}
            </Button>
          )}

          {state.phase === 'assign' && (
            <div>
              <p className="text-xs text-slate-400 mb-3">
                {state.noWorkToday
                  ? 'No work today due to event. Skip to end day.'
                  : 'Roll dice and assign to cards.'}
              </p>
              {state.noWorkToday ? (
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => performAction({ type: 'assign_dice', assignments: [] })}
                  disabled={loading}
                >
                  Skip Work Phase
                </Button>
              ) : (
                <DiceRoller state={state} onAssign={handleAssignDice} loading={loading} />
              )}
            </div>
          )}

          {state.phase === 'confirm' && (
            <Button size="sm" className="w-full" onClick={handleEndDay} disabled={loading}>
              {loading ? 'Processing...' : `✓ End Day ${state.currentDay}`}
            </Button>
          )}

          {/* Financials */}
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-widest mb-2 font-semibold">
              Financials
            </div>
            <FinancialSummary financials={state.financials} />
          </div>

          {/* Team status */}
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-widest mb-2 font-semibold">
              Team
            </div>
            <div className="space-y-1">
              {state.members.map((m) => (
                <div key={m.id} className="flex items-center gap-2 text-xs">
                  <span>{m.role === 'analyst' ? '🔴' : m.role === 'developer' ? '🔵' : '🟢'}</span>
                  <span className={m.available ? 'text-slate-200' : 'text-slate-500 line-through'}>
                    {m.name}
                  </span>
                  {!m.available && <span className="text-red-400 text-[10px]">away</span>}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
