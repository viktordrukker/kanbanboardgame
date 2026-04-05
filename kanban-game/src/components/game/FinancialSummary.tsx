import type { FinancialState } from '@/lib/game-engine/types';

interface Props {
  financials: FinancialState;
}

function Money({ value, green }: { value: number; green?: boolean }) {
  const color = green ? (value >= 0 ? 'text-emerald-400' : 'text-red-400') : 'text-slate-200';
  return (
    <span className={color}>
      ${Math.abs(value).toLocaleString()}
      {value < 0 && green ? ' (loss)' : ''}
    </span>
  );
}

export default function FinancialSummary({ financials }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2 text-xs">
      <div className="bg-slate-800 rounded p-2 border border-slate-700">
        <div className="text-slate-400 mb-0.5">Subscribers</div>
        <div className="text-slate-200 font-semibold">{financials.totalSubscribers.toLocaleString()}</div>
      </div>
      <div className="bg-slate-800 rounded p-2 border border-slate-700">
        <div className="text-slate-400 mb-0.5">Daily Revenue</div>
        <div className="text-emerald-400 font-semibold">${financials.dailyRevenue.toLocaleString()}</div>
      </div>
      <div className="bg-slate-800 rounded p-2 border border-slate-700">
        <div className="text-slate-400 mb-0.5">Cumulative Revenue</div>
        <div className="font-semibold"><Money value={financials.cumulativeRevenue} /></div>
      </div>
      <div className="bg-slate-800 rounded p-2 border border-slate-700">
        <div className="text-slate-400 mb-0.5">Total Costs</div>
        <div className="text-red-400 font-semibold">${financials.totalCosts.toLocaleString()}</div>
      </div>
      {financials.fines > 0 && (
        <div className="bg-slate-800 rounded p-2 border border-red-800">
          <div className="text-slate-400 mb-0.5">Fines</div>
          <div className="text-red-400 font-semibold">${financials.fines.toLocaleString()}</div>
        </div>
      )}
      <div className="bg-slate-800 rounded p-2 border border-slate-700 col-span-2">
        <div className="text-slate-400 mb-0.5">Net Profit</div>
        <div className="font-bold text-base"><Money value={financials.netProfit} green /></div>
      </div>
    </div>
  );
}
