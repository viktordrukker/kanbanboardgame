'use client';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import type { ChartData } from '@/lib/game-engine/types';

export default function CycleTimeChart({ data }: { data: ChartData['cycleTime'] }) {
  if (!data.length) {
    return <div className="text-slate-500 text-sm text-center py-8">No cards deployed yet</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="deployDay" name="Deploy Day" stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: 'Deploy Day', position: 'insideBottomRight', offset: -5, fontSize: 11 }} />
        <YAxis dataKey="cycleTime" name="Cycle Time (days)" stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: 'Cycle Time', angle: -90, position: 'insideLeft', fontSize: 11 }} />
        <Tooltip
          cursor={{ strokeDasharray: '3 3' }}
          contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 6 }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0]?.payload;
            return (
              <div className="p-2 text-xs text-slate-200">
                <div className="font-semibold">{d.cardId}: {d.title}</div>
                <div>Deployed: Day {d.deployDay}</div>
                <div>Cycle Time: {d.cycleTime} days</div>
              </div>
            );
          }}
        />
        <Scatter data={data} fill="#3b82f6" />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
