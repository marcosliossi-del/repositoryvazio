'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import type { ChurnRiskPoint } from '@/lib/dal'

type Props = {
  data: ChurnRiskPoint[]
  clientName: string
}

function scoreLabel(score: number) {
  if (score >= 70) return 'Alto Risco'
  if (score >= 40) return 'Risco Médio'
  return 'Baixo Risco'
}

function scoreColor(score: number) {
  if (score >= 70) return '#EF4444'
  if (score >= 40) return '#EAB308'
  return '#22C55E'
}

export function ChurnRiskChart({ data, clientName }: Props) {
  const latest = data[data.length - 1]
  const color = latest ? scoreColor(latest.score) : '#87919E'

  const chartData = data.map((d) => ({
    ...d,
    weekLabel: new Date(d.weekStart).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    }),
  }))

  return (
    <div className="bg-[#0A1E2C] border border-[#38435C] rounded-2xl p-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-[#87919E] uppercase tracking-wide mb-0.5">
            Score de Risco de Churn
          </p>
          <p className="text-sm font-semibold text-[#EBEBEB]">{clientName}</p>
        </div>
        {latest && (
          <div className="text-right">
            <p className="text-2xl font-bold" style={{ color }}>
              {latest.score}
            </p>
            <p className="text-[10px] font-medium" style={{ color }}>
              {scoreLabel(latest.score)}
            </p>
          </div>
        )}
      </div>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-24">
          <p className="text-[#87919E] text-sm">Sem histórico disponível ainda.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#38435C" vertical={false} />
            <XAxis
              dataKey="weekLabel"
              tick={{ fontSize: 9, fill: '#87919E' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 9, fill: '#87919E' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                background: '#0A1E2C',
                border: '1px solid #38435C',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#EBEBEB',
              }}
              formatter={(value) => [`${value} — ${scoreLabel(Number(value))}`, 'Score']}
              labelStyle={{ color: '#87919E', marginBottom: 2 }}
            />
            {/* Threshold lines */}
            <ReferenceLine y={70} stroke="#EF4444" strokeDasharray="3 3" strokeOpacity={0.4} />
            <ReferenceLine y={40} stroke="#EAB308" strokeDasharray="3 3" strokeOpacity={0.4} />
            <Line
              type="monotone"
              dataKey="score"
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2">
        {[
          { label: '0–39 Baixo', color: '#22C55E' },
          { label: '40–69 Médio', color: '#EAB308' },
          { label: '70–100 Alto', color: '#EF4444' },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
            <span className="text-[9px] text-[#87919E]">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
