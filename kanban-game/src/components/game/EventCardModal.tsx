'use client';
import type { EventCard } from '@/lib/game-engine/types';
import { Button } from '@/components/ui/button';

interface Props {
  event: EventCard;
  onDismiss: () => void;
  loading?: boolean;
}

export default function EventCardModal({ event, onDismiss, loading }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-600 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4 border-b border-slate-600">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-slate-400">DAY {event.day}</span>
            <span className="text-xs text-amber-400">EVENT CARD</span>
          </div>
          <h2 className="text-lg font-bold text-white">{event.title}</h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-slate-300 text-sm leading-relaxed mb-4">{event.description}</p>

          {/* Effects */}
          <div className="space-y-2">
            {event.effects.map((effect, i) => (
              <div key={i} className="flex items-start gap-2 text-xs bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                <span className="text-amber-400 mt-0.5">⚡</span>
                <span className="text-slate-300">{effectDescription(effect)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700 flex justify-end">
          <Button onClick={onDismiss} disabled={loading} size="sm">
            {loading ? 'Applying...' : 'Accept & Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function effectDescription(effect: EventCard['effects'][0]): string {
  switch (effect.type) {
    case 'add_member': return `Add a ${effect.role} to the team${effect.memberName ? ` (${effect.memberName})` : ''}`;
    case 'remove_member': return `A ${effect.role ?? 'team member'} is unavailable for ${effect.days} day(s)`;
    case 'change_wip': return `Change WIP limit for ${effect.column} to ${effect.newLimit}`;
    case 'add_fine': return `$${effect.amount.toLocaleString()} fine added${effect.condition ? ` (${effect.condition})` : ''}`;
    case 'expedite': return `Card ${effect.cardId} is now expedited`;
    case 'no_work': return 'No work can be done today';
    case 'bonus_dice': return 'One bonus dice assignment for today';
    case 'custom': return effect.description;
    default: return 'Unknown effect';
  }
}
