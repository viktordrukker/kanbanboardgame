import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { logoutAction } from '@/lib/auth/actions';
import NewGameButton from './NewGameButton';
import DeleteGameButton from './DeleteGameButton';

export const metadata = {
  title: 'Dashboard — Kanban Board Game',
  description: 'Manage your Kanban simulation games.',
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const games = await db.game.findMany({
    where: { userId: session.userId },
    orderBy: { updatedAt: 'desc' },
    select: { id: true, name: true, scenarioId: true, currentDay: true, status: true, createdAt: true },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <nav className="border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <span className="font-bold text-lg">🎯 Kanban Board Game</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">Hello, {session.username}</span>
          <form action={logoutAction}>
            <button type="submit" className="text-sm text-slate-400 hover:text-white transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">My Games</h1>
            <p className="text-slate-400 text-sm mt-1">Continue an existing game or start a new one.</p>
          </div>
          <NewGameButton />
        </div>

        {games.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <p className="text-4xl mb-4">🎲</p>
            <p className="text-lg font-medium mb-2">No games yet</p>
            <p className="text-sm">Create your first game to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {games.map((game) => (
              <div
                key={game.id}
                className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-xl p-4 hover:border-slate-500 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/game/${game.id}`}
                    className="font-semibold text-white hover:text-blue-400 transition-colors truncate block"
                  >
                    {game.name || `Untitled Game (${game.scenarioId})`}
                  </Link>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span>{game.scenarioId === 'v2-21day' ? '21 Days' : '35 Days'}</span>
                    <span>•</span>
                    <span>Day {game.currentDay}</span>
                    <span>•</span>
                    <span className={
                      game.status === 'completed' ? 'text-emerald-400' :
                      game.status === 'abandoned' ? 'text-red-400' : 'text-blue-400'
                    }>
                      {game.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <Link
                    href={`/game/${game.id}`}
                    className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {game.status === 'active' ? 'Continue' : 'View'}
                  </Link>
                  <DeleteGameButton gameId={game.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
