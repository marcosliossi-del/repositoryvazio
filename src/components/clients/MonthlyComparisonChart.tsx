'use client'

import {
  ComposedChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import type { MonthlyDataPoint } from '@/lib/dal'

export function MonthlyComparisonChart({ data }: { data: MonthlyDataPoint[] }) {
  const hasRevenue = data.some((d) => d.revenue > 0)
  if (!hasRevenue) return null

  const fmt = (v: number) =>
    v >= 1000
      ? `R$ ${(v / 1000).toFixed(1)}k`
      : `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`

  const chartData = data.map((d) => ({
    month: d.month,
    Receita: d.revenue,
    Investimento: d.spend,
    roas: d.roas,
  }))

  return (
    <div className="bg-[#0A1E2C] border border-[#38435C] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-[#EBEBEB]">Histórico — últimos 6 meses</p>
        <div className="flex items-center gap-3 text-[10px] text-[#87919E]">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-sm bg-[#22C55E]/70" /> Receita
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-sm bg-[#95BBE2]/70" /> Investimento
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-0.5 bg-[#F59E0B]" /> ROAS
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <ComposedChart data={chartData} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1C2E3E" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: '#87919E', fontSize: 9 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis yAxisId="left" hide />
          <YAxis yAxisId="right" orientation="right" hide />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              return (
                <div className="bg-[#0A1E2C] border border-[#38435C] rounded-xl px-3 py-2 text-xs shadow-lg">
                  <p className="text-[#87919E] font-semibold mb-1">{label}</p>
                  {payload.map((p) => (
                    <p key={p.name} style={{ color: p.color as string }} className="font-medium">
                      {p.name}:{' '}
                      {p.name === 'ROAS'
                        ? `${Number(p.value).toFixed(2)}x`
                        : typeof p.value === 'number'
                        ? `R$ ${Number(p.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                        : '—'}
                    </p>
                  ))}
                </div>
              )
            }}
          />
          <Bar yAxisId="left" dataKey="Receita" fill="#22C55E" fillOpacity={0.7} radius={[3, 3, 0, 0]} />
          <Bar yAxisId="left" dataKey="Investimento" fill="#95BBE2" fillOpacity={0.7} radius={[3, 3, 0, 0]} />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="roas"
            name="ROAS"
            stroke="#F59E0B"
            strokeWidth={2}
            dot={{ fill: '#F59E0B', r: 3 }}
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
