'use client';
import type { GameState, StoryCard, ColumnId } from '@/lib/game-engine/types';
import { COLUMN_ORDER } from '@/lib/game-engine/types';
import BoardColumn from './BoardColumn';

interface Props {
  state: GameState;
  onCardClick?: (card: StoryCard) => void;
}

export default function KanbanBoard({ state, onCardClick }: Props) {
  const cardsByColumn = COLUMN_ORDER.reduce(
    (acc, col) => {
      acc[col] = state.cards
        .filter((c) => c.currentColumn === col)
        .sort((a, b) => {
          // Expedite cards sort to top
          if (a.priority === 'expedite' && b.priority !== 'expedite') return -1;
          if (b.priority === 'expedite' && a.priority !== 'expedite') return 1;
          return a.id.localeCompare(b.id);
        });
      return acc;
    },
    {} as Record<ColumnId, StoryCard[]>,
  );

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {COLUMN_ORDER.map((col) => (
        <BoardColumn
          key={col}
          columnId={col}
          cards={cardsByColumn[col]}
          wipLimits={state.wipLimits}
          onCardClick={onCardClick}
        />
      ))}
    </div>
  );
}
