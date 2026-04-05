'use client';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import type { ChartData } from '@/lib/game-engine/types';

export default function FinancialChart({ data }: { data: ChartData['financial'] }) {
  if (!data.length) {
    return <div className="text-slate-500 text-sm text-center py-8">No data yet</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: 'Day', position: 'insideBottomRight', offset: -5, fontSize: 11 }} />
        <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 6 }}
          labelStyle={{ color: '#94a3b8' }}
          formatter={(v) => [`$${Number(v).toLocaleString()}`, '']}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <ReferenceLine y={0} stroke="#475569" />
        <Line type="monotone" dataKey="cumulativeRevenue" name="Revenue" stroke="#10b981" dot={false} strokeWidth={2} />
        <Line type="monotone" dataKey="totalCosts" name="Costs" stroke="#ef4444" dot={false} strokeWidth={2} />
        <Line type="monotone" dataKey="netProfit" name="Net Profit" stroke="#3b82f6" dot={false} strokeWidth={2} strokeDasharray="4 2" />
      </LineChart>
    </ResponsiveContainer>
  );
}
