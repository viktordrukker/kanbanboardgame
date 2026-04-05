'use client';
import type { StoryCard as StoryCardType } from '@/lib/game-engine/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Props {
  card: StoryCardType;
  onClick?: () => void;
  compact?: boolean;
}

const PRIORITY_COLORS = {
  standard: 'border-l-slate-400',
  expedite: 'border-l-amber-400',
  'fixed-date': 'border-l-orange-500',
};

const PRIORITY_LABELS = {
  standard: null,
  expedite: 'EXPEDITE',
  'fixed-date': 'FIXED DATE',
};

function EffortBar({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total > 0 ? Math.round(((total - value) / total) * 100) : 100;
  return (
    <div className="flex items-center gap-1 text-xs">
      <span className="w-9 shrink-0 text-slate-400">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-4 text-right text-slate-300">{value}</span>
    </div>
  );
}

export default function StoryCard({ card, onClick, compact = false }: Props) {
  const borderColor = PRIORITY_COLORS[card.priority];
  const priorityLabel = PRIORITY_LABELS[card.priority];

  return (
    <div
      className={cn(
        'bg-slate-800 rounded border-l-4 p-2 cursor-pointer hover:bg-slate-750 transition-colors select-none',
        borderColor,
        onClick && 'hover:ring-1 hover:ring-blue-500/50',
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-1 mb-1">
        <span className="text-xs font-semibold text-slate-200 leading-tight">{card.id}</span>
        {priorityLabel && (
          <Badge
            variant="outline"
            className={cn(
              'text-[9px] px-1 py-0 h-4',
              card.priority === 'expedite' ? 'border-amber-400 text-amber-400' : 'border-orange-500 text-orange-500',
            )}
          >
            {priorityLabel}
          </Badge>
        )}
      </div>
      <p className="text-xs text-slate-300 leading-tight mb-2">{card.title}</p>
      {!compact && (
        <>
          <div className="space-y-1 mb-2">
            <EffortBar label="Ana" value={card.analysisEffort} total={card.analysisEffort + (card.currentColumn === 'analysis' ? 0 : 0)} />
            <EffortBar label="Dev" value={card.developmentEffort} total={card.developmentEffort} />
            <EffortBar label="Test" value={card.testingEffort} total={card.testingEffort} />
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-400">
            <span>+{card.subscribers}</span>
            <span className="text-slate-500">subs</span>
          </div>
        </>
      )}
    </div>
  );
}
