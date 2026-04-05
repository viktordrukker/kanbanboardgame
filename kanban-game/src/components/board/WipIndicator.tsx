import { cn } from '@/lib/utils';

interface Props {
  current: number;
  limit: number | null;
}

export default function WipIndicator({ current, limit }: Props) {
  if (limit === null) return null;
  const atLimit = current >= limit;
  return (
    <span
      className={cn(
        'text-xs px-1.5 py-0.5 rounded font-mono',
        atLimit
          ? 'bg-red-900/60 text-red-300 border border-red-700'
          : 'bg-slate-700 text-slate-400 border border-slate-600',
      )}
    >
      {current}/{limit}
    </span>
  );
}
