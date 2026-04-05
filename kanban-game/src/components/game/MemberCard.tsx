'use client';
import type { TeamMember } from '@/lib/game-engine/types';
import { cn } from '@/lib/utils';

interface Props {
  member: TeamMember;
  diceRoll?: number;
  assigned?: boolean;
  onSelect?: () => void;
  selected?: boolean;
}

const ROLE_COLORS = {
  analyst: 'border-red-500 text-red-400',
  developer: 'border-blue-500 text-blue-400',
  tester: 'border-green-500 text-green-400',
};

const ROLE_BG = {
  analyst: 'bg-red-900/20',
  developer: 'bg-blue-900/20',
  tester: 'bg-green-900/20',
};

export default function MemberCard({ member, diceRoll, assigned, onSelect, selected }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={!member.available || !onSelect}
      className={cn(
        'flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all min-w-[72px]',
        ROLE_COLORS[member.role],
        ROLE_BG[member.role],
        !member.available && 'opacity-40 cursor-not-allowed',
        selected && 'ring-2 ring-white',
        assigned && 'opacity-60',
        onSelect && member.available && !assigned && 'hover:scale-105 cursor-pointer',
      )}
    >
      <div className="text-2xl">
        {member.role === 'analyst' ? '🔴' : member.role === 'developer' ? '🔵' : '🟢'}
      </div>
      <span className="font-medium truncate max-w-full">{member.name}</span>
      <span className="text-slate-400 capitalize">{member.role.slice(0, 3)}</span>
      {diceRoll !== undefined && (
        <div className="mt-1 w-7 h-7 flex items-center justify-center rounded bg-slate-700 font-bold text-white text-sm border border-slate-500">
          {diceRoll}
        </div>
      )}
      {!member.available && <span className="text-xs text-red-400">Away</span>}
    </button>
  );
}
