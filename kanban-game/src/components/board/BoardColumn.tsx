'use client';
import type { StoryCard, ColumnId, WipLimits } from '@/lib/game-engine/types';
import { COLUMN_LABELS } from '@/lib/game-engine/types';
import { cn } from '@/lib/utils';
import StoryCardComponent from './StoryCard';
import WipIndicator from './WipIndicator';

interface Props {
  columnId: ColumnId;
  cards: StoryCard[];
  wipLimits: WipLimits;
  onCardClick?: (card: StoryCard) => void;
}

const COLUMN_HEADER_COLORS: Partial<Record<ColumnId, string>> = {
  deployed: 'text-emerald-400 border-emerald-700',
  backlog: 'text-slate-300 border-slate-600',
};

export default function BoardColumn({ columnId, cards, wipLimits, onCardClick }: Props) {
  const limit = wipLimits[columnId];
  const atLimit = limit !== null && cards.length >= limit;
  const headerClass = COLUMN_HEADER_COLORS[columnId] ?? 'text-slate-300 border-slate-600';

  return (
    <div
      className={cn(
        'flex flex-col bg-slate-800/50 rounded-lg border border-slate-700 min-w-[140px] max-w-[180px] flex-1',
        atLimit && 'border-red-700/50',
      )}
    >
      {/* Column header */}
      <div
        className={cn(
          'flex items-center justify-between px-2 py-1.5 border-b text-xs font-semibold uppercase tracking-wide',
          headerClass,
        )}
      >
        <span className="truncate">{COLUMN_LABELS[columnId]}</span>
        <WipIndicator current={cards.length} limit={limit} />
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-1.5 min-h-[200px]">
        {cards.map((card) => (
          <StoryCardComponent
            key={card.id}
            card={card}
            onClick={() => onCardClick?.(card)}
            compact={columnId === 'backlog' || columnId === 'deployed'}
          />
        ))}
      </div>
    </div>
  );
}
