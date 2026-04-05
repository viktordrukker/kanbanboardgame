'use client';
import { useState, useCallback } from 'react';
import type { GameState, DiceAssignment, StoryCard } from '@/lib/game-engine/types';
import { ROLE_TO_COLUMN } from '@/lib/game-engine/types';
import { rollDie } from '@/lib/game-engine/dice';
import MemberCard from './MemberCard';
import { Button } from '@/components/ui/button';

interface Props {
  state: GameState;
  onAssign: (assignments: DiceAssignment[]) => void;
  loading?: boolean;
}

interface MemberRoll {
  memberId: string;
  roll: number;
  assignedCardId?: string;
}

export default function DiceRoller({ state, onAssign, loading }: Props) {
  const [rolls, setRolls] = useState<MemberRoll[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [rolled, setRolled] = useState(false);

  const availableMembers = state.members.filter((m) => m.available);

  const handleRollAll = useCallback(() => {
    const newRolls = availableMembers.map((m) => ({
      memberId: m.id,
      roll: rollDie(),
    }));
    // Add bonus dice if any
    for (let i = 0; i < state.bonusDiceAvailable; i++) {
      newRolls.push({ memberId: `bonus-${i}`, roll: rollDie() });
    }
    setRolls(newRolls);
    setRolled(true);
    setSelectedMemberId(null);
  }, [availableMembers, state.bonusDiceAvailable]);

  const handleMemberClick = (memberId: string) => {
    if (!rolled) return;
    const roll = rolls.find((r) => r.memberId === memberId);
    if (!roll || roll.assignedCardId) return;
    setSelectedMemberId(memberId);
  };

  const handleCardAssign = (card: StoryCard) => {
    if (!selectedMemberId) return;
    setRolls((prev) =>
      prev.map((r) =>
        r.memberId === selectedMemberId ? { ...r, assignedCardId: card.id } : r,
      ),
    );
    setSelectedMemberId(null);
  };

  const assignedCount = rolls.filter((r) => r.assignedCardId).length;
  const allAssigned = rolled && assignedCount === rolls.length;

  const workableCards = state.cards.filter(
    (c) =>
      c.currentColumn === 'analysis' ||
      c.currentColumn === 'development' ||
      c.currentColumn === 'testing',
  );

  const handleConfirm = () => {
    const assignments: DiceAssignment[] = rolls
      .filter((r) => r.assignedCardId)
      .map((r) => ({ memberId: r.memberId, cardId: r.assignedCardId!, roll: r.roll }));
    onAssign(assignments);
  };

  return (
    <div className="space-y-4">
      {/* Team members */}
      <div>
        <div className="text-xs text-slate-400 mb-2 uppercase tracking-wide">Team</div>
        <div className="flex flex-wrap gap-2">
          {availableMembers.map((member) => {
            const roll = rolls.find((r) => r.memberId === member.id);
            const assigned = !!roll?.assignedCardId;
            const assignedCard = roll?.assignedCardId
              ? state.cards.find((c) => c.id === roll.assignedCardId)
              : undefined;
            return (
              <div key={member.id} className="flex flex-col items-center gap-1">
                <MemberCard
                  member={member}
                  diceRoll={roll?.roll}
                  assigned={assigned}
                  selected={selectedMemberId === member.id}
                  onSelect={() => handleMemberClick(member.id)}
                />
                {assignedCard && (
                  <span className="text-[10px] text-slate-400 max-w-[72px] truncate text-center">
                    → {assignedCard.id}
                    {ROLE_TO_COLUMN[member.role] === assignedCard.currentColumn && (
                      <span className="text-amber-400"> ×2</span>
                    )}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Card selection (when a member is selected) */}
      {selectedMemberId && (
        <div className="bg-slate-800 rounded-lg p-3 border border-blue-600">
          <div className="text-xs text-blue-400 mb-2">
            Select a card to assign dice:
          </div>
          <div className="flex flex-wrap gap-2">
            {workableCards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleCardAssign(card)}
                className="text-xs bg-slate-700 hover:bg-slate-600 rounded px-2 py-1 text-slate-200 border border-slate-600 hover:border-blue-500 transition-colors"
              >
                {card.id} <span className="text-slate-400">({card.currentColumn})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 items-center">
        {!rolled ? (
          <Button onClick={handleRollAll} disabled={loading || state.noWorkToday} size="sm">
            🎲 Roll Dice
          </Button>
        ) : (
          <>
            <span className="text-xs text-slate-400">
              {assignedCount}/{rolls.length} assigned
            </span>
            <Button
              onClick={handleConfirm}
              disabled={!allAssigned || loading}
              size="sm"
              variant={allAssigned ? 'default' : 'outline'}
            >
              {loading ? 'Working...' : 'Confirm Assignments'}
            </Button>
          </>
        )}
        {state.noWorkToday && (
          <span className="text-xs text-red-400">⚠ No work today (system outage)</span>
        )}
      </div>
    </div>
  );
}
