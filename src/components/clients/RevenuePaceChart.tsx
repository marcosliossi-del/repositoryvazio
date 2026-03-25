'use client'

import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import type { DailyRevenuePoint } from '@/lib/dal'

interface Props {
  data: DailyRevenuePoint[]
  goal?: number | null
}

export function RevenuePaceChart({ data, goal }: Props) {
  const today = new Date().toISOString().slice(0, 10)
  const elapsed = data.filter((d) => d.date <= today && d.revenue > 0)
  const daysElapsed = elapsed.length
  const accumulatedToday = elapsed[elapsed.length - 1]?.accumulated ?? 0
  const dailyPace = daysElapsed > 0 ? accumulatedToday / daysElapsed : 0
  const projectedTotal = dailyPace * data.length

  const chartData = data.map((d, i) => ({
    date: d.date.slice(5),
    Diária: d.revenue > 0 ? d.revenue : null,
    Acumulado: d.accumulated > 0 ? d.accumulated : null,
    Projeção: dailyPace > 0 && d.date > today ? dailyPace * (i + 1) : null,
  }))

  const fmt = (v: number) =>
    `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="bg-[#0A1E2C] border border-[#38435C] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-[#EBEBEB]">Receita Acumulada no Período</p>
        <div className="flex items-center gap-3 text-[10px] text-[#87919E]">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-sm bg-[#95BBE2]/70" /> Diária
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-0.5 bg-[#22C55E]" /> Acumulado
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-0.5 border-t border-dashed border-[#87919E]" /> Projeção
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <ComposedChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1C2E3E" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#87919E', fontSize: 9 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis hide />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              return (
                <div className="bg-[#0A1E2C] border border-[#38435C] rounded-xl px-3 py-2 text-xs shadow-lg">
                  <p className="text-[#87919E] mb-1">{label}</p>
                  {payload.map((p) => (
                    <p key={p.name} style={{ color: p.color as string }} className="font-medium">
                      {p.name}: {typeof p.value === 'number' ? fmt(p.value) : '—'}
                    </p>
                  ))}
                </div>
              )
            }}
          />
          <Bar dataKey="Diária" fill="#95BBE2" fillOpacity={0.6} radius={[2, 2, 0, 0]} />
          <Line type="monotone" dataKey="Acumulado" stroke="#22C55E" strokeWidth={2} dot={false} connectNulls />
          <Line
            type="monotone"
            dataKey="Projeção"
            stroke="#87919E"
            strokeWidth={1.5}
            strokeDasharray="5 3"
            dot={false}
            connectNulls
          />
          {goal && goal > 0 && (
            <ReferenceLine
              y={goal}
              stroke="#F59E0B"
              strokeDasharray="4 3"
              label={{ value: `Meta ${fmt(goal)}`, fill: '#F59E0B', fontSize: 9, position: 'insideTopRight' }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {projectedTotal > 0 && (
        <p className="text-[10px] text-[#87919E] mt-2">
          Projeção total:{' '}
          <span className="text-[#EBEBEB] font-semibold">{fmt(projectedTotal)}</span>
          {goal && goal > 0 && (
            <span className={`ml-2 ${projectedTotal >= goal ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
              ({projectedTotal >= goal ? '✓ acima da meta' : `${Math.round((projectedTotal / goal) * 100)}% da meta`})
            </span>
          )}
        </p>
      )}
    </div>
  )
}
