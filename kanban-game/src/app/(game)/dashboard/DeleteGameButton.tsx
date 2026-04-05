'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteGameButton({ gameId }: { gameId: string }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await fetch(`/api/games/${gameId}`, { method: 'DELETE' });
      router.refresh();
    });
  };

  if (confirm) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-xs bg-red-700 hover:bg-red-600 text-white px-2 py-1 rounded transition-colors"
        >
          {isPending ? '...' : 'Yes'}
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded transition-colors"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="text-xs text-slate-500 hover:text-red-400 transition-colors px-1"
    >
      ✕
    </button>
  );
}
