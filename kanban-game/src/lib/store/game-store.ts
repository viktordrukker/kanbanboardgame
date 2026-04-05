import { create } from 'zustand';
import type { GameState, DiceAssignment } from '@/lib/game-engine/types';

interface GameStore {
  state: GameState | null;
  loading: boolean;
  error: string | null;

  // Load game state from server
  loadGame: (gameId: string) => Promise<void>;

  // Perform a game action (calls API)
  performAction: (gameId: string, action: object) => Promise<void>;

  // Optimistic local state update (for dice UI)
  setLocalState: (state: GameState) => void;

  clearError: () => void;
}

async function apiAction(gameId: string, action: object): Promise<GameState> {
  const res = await fetch(`/api/games/${gameId}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(action),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? 'Action failed');
  }
  const data = await res.json();
  return data.state as GameState;
}

export const useGameStore = create<GameStore>((set, get) => ({
  state: null,
  loading: false,
  error: null,

  loadGame: async (gameId: string) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/games/${gameId}`);
      if (!res.ok) throw new Error('Failed to load game');
      const data = await res.json();
      set({ state: data.state as GameState, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  performAction: async (gameId: string, action: object) => {
    set({ loading: true, error: null });
    try {
      const newState = await apiAction(gameId, action);
      set({ state: newState, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  setLocalState: (state: GameState) => set({ state }),

  clearError: () => set({ error: null }),
}));
