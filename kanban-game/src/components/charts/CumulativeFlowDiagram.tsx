'use client';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { ChartData } from '@/lib/game-engine/types';

const COLORS: Record<string, string> = {
  backlog: '#64748b',
  ready: '#8b5cf6',
  analysis: '#ef4444',
  development: '#3b82f6',
  testing: '#22c55e',
  readyToDeploy: '#f59e0b',
  deployed: '#10b981',
};

export default function CumulativeFlowDiagram({ data }: { data: ChartData['cfd'] }) {
  if (!data.length) {
    return <div className="text-slate-500 text-sm text-center py-8">No data yet</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: 'Day', position: 'insideBottomRight', offset: -5, fontSize: 11 }} />
        <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
        <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 6 }} labelStyle={{ color: '#94a3b8' }} itemStyle={{ color: '#e2e8f0' }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {Object.entries(COLORS).map(([key, color]) => (
          <Area key={key} type="monotone" dataKey={key} stackId="1" stroke={color} fill={color} fillOpacity={0.6} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
