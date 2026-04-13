'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, TrendingDown, AlertTriangle, CheckCircle2, Lightbulb } from 'lucide-react'
import {
  classifyCPS,
  classifyTaxaConversao,
  CPS_IMPROVEMENTS,
  TAXA_CONVERSAO_IMPROVEMENTS,
  TICKET_MEDIO_IMPROVEMENTS,
  type BenchmarkLevel,
} from '@/lib/benchmarks'

interface Props {
  cps: number | null
  taxaConversao: number | null
  ticketMedio: number | null
  // % changes vs previous period
  cpsPct: number | null
  taxaPct: number | null
  ticketPct: number | null
}

function LevelBadge({ level, label, color }: { level: BenchmarkLevel; label: string; color: string }) {
  return (
    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ color, backgroundColor: `${color}20` }}>
      {label}
    </span>
  )
}

function ImprovementList({ title, items, color }: {
  title: string
  items: { rank: number; action: string; detail: string }[]
  color: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-[#38435C]/60 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-[#38435C]/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Lightbulb size={13} style={{ color }} />
          <span className="text-xs font-semibold text-[#EBEBEB]">{title}</span>
        </div>
        {open ? <ChevronUp size={13} className="text-[#87919E]" /> : <ChevronDown size={13} className="text-[#87919E]" />}
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2 border-t border-[#38435C]/60">
          {items.map((item) => (
            <div key={item.rank} className="flex gap-2 pt-2">
              <span className="text-[10px] font-bold w-4 flex-shrink-0" style={{ color }}>{item.rank}.</span>
              <div>
                <p className="text-xs font-semibold text-[#EBEBEB]">{item.action}</p>
                <p className="text-[10px] text-[#87919E] mt-0.5">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function KPIDiagnosticCard({ cps, taxaConversao, ticketMedio, cpsPct, taxaPct, ticketPct }: Props) {
  const cpsBenchmark  = cps            !== null ? classifyCPS(cps)                     : null
  const taxaBenchmark = taxaConversao  !== null ? classifyTaxaConversao(taxaConversao) : null

  const hasIssues = (cpsBenchmark && ['baixo', 'critico'].includes(cpsBenchmark.level))
                 || (taxaBenchmark && ['baixo', 'critico'].includes(taxaBenchmark.level))
                 || (ticketPct !== null && ticketPct < -5)

  const diagnoses: string[] = []
  if (cpsBenchmark && cpsBenchmark.level === 'critico')  diagnoses.push('CPS muito alto — tráfego caro demais.')
  if (cpsBenchmark && cpsBenchmark.level === 'baixo')    diagnoses.push('CPS acima da média — custo por visita elevado.')
  if (taxaBenchmark && taxaBenchmark.level === 'critico') diagnoses.push('Taxa de conversão crítica — o site não está convertendo.')
  if (taxaBenchmark && taxaBenchmark.level === 'baixo')   diagnoses.push('Taxa de conversão abaixo da média — oportunidade de CRO.')
  if (ticketPct !== null && ticketPct < -10)              diagnoses.push(`Ticket médio caiu ${Math.abs(Math.round(ticketPct))}% vs período anterior.`)
  if (cpsPct !== null && cpsPct > 10)                     diagnoses.push(`CPS aumentou ${Math.round(cpsPct)}% vs período anterior.`)
  if (taxaPct !== null && taxaPct < -10)                  diagnoses.push(`Taxa de conversão caiu ${Math.abs(Math.round(taxaPct))}% vs período anterior.`)

  if (!cps && !taxaConversao && !ticketMedio) return null

  return (
    <div className="bg-[#0A1E2C] border border-[#38435C] rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        {hasIssues
          ? <AlertTriangle size={15} className="text-[#EAB308]" />
          : <CheckCircle2 size={15} className="text-[#22C55E]" />}
        <h3 className="text-sm font-semibold text-[#EBEBEB]">Diagnóstico de KPIs</h3>
        <span className="text-[10px] text-[#87919E] ml-auto">benchmarks de mercado</span>
      </div>

      {/* KPI status vs benchmark */}
      <div className="grid grid-cols-3 gap-3">
        {/* CPS */}
        <div className="bg-[#1B2B3A] rounded-lg p-3 space-y-1.5">
          <p className="text-[10px] text-[#87919E] uppercase tracking-wide">CPS</p>
          {cps !== null ? (
            <>
              <p className="text-lg font-bold text-[#EBEBEB]">R${cps.toFixed(2)}</p>
              {cpsBenchmark && <LevelBadge {...cpsBenchmark} />}
              <p className="text-[10px] text-[#87919E]">Média: R$0,35–0,75</p>
            </>
          ) : <p className="text-sm text-[#87919E]">—</p>}
        </div>

        {/* Taxa de Conversão */}
        <div className="bg-[#1B2B3A] rounded-lg p-3 space-y-1.5">
          <p className="text-[10px] text-[#87919E] uppercase tracking-wide">TX. Conversão</p>
          {taxaConversao !== null ? (
            <>
              <p className="text-lg font-bold text-[#EBEBEB]">{taxaConversao.toFixed(2)}%</p>
              {taxaBenchmark && <LevelBadge {...taxaBenchmark} />}
              <p className="text-[10px] text-[#87919E]">Média: 0,5%–1,5%</p>
            </>
          ) : <p className="text-sm text-[#87919E]">—</p>}
        </div>

        {/* Ticket Médio */}
        <div className="bg-[#1B2B3A] rounded-lg p-3 space-y-1.5">
          <p className="text-[10px] text-[#87919E] uppercase tracking-wide">Ticket Médio</p>
          {ticketMedio !== null ? (
            <>
              <p className="text-lg font-bold text-[#EBEBEB]">
                R${ticketMedio.toFixed(2)}
              </p>
              {ticketPct !== null && (
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                  ticketPct >= 0 ? 'text-[#22C55E] bg-[#22C55E]/10' : 'text-[#EF4444] bg-[#EF4444]/10'
                }`}>
                  {ticketPct >= 0 ? '+' : ''}{Math.round(ticketPct)}% vs ant.
                </span>
              )}
            </>
          ) : <p className="text-sm text-[#87919E]">—</p>}
        </div>
      </div>

      {/* Diagnóstico automático */}
      {diagnoses.length > 0 && (
        <div className="bg-[#EAB308]/10 border border-[#EAB308]/20 rounded-lg p-3 space-y-1">
          <p className="text-[10px] font-semibold text-[#EAB308] uppercase tracking-wide flex items-center gap-1.5">
            <TrendingDown size={11} /> Pontos de atenção
          </p>
          {diagnoses.map((d, i) => (
            <p key={i} className="text-xs text-[#EBEBEB]">• {d}</p>
          ))}
        </div>
      )}

      {/* Improvement lists */}
      <div className="space-y-2">
        {cpsBenchmark && ['baixo', 'critico'].includes(cpsBenchmark.level) && (
          <ImprovementList
            title="Como melhorar o CPS"
            items={CPS_IMPROVEMENTS}
            color={cpsBenchmark.color}
          />
        )}
        {taxaBenchmark && ['baixo', 'critico'].includes(taxaBenchmark.level) && (
          <ImprovementList
            title="Como melhorar a Taxa de Conversão"
            items={TAXA_CONVERSAO_IMPROVEMENTS}
            color={taxaBenchmark.color}
          />
        )}
        {ticketPct !== null && ticketPct < -5 && (
          <ImprovementList
            title="Como aumentar o Ticket Médio"
            items={TICKET_MEDIO_IMPROVEMENTS}
            color="#F97316"
          />
        )}
        {!hasIssues && (
          <p className="text-xs text-[#22C55E] text-center py-1">
            Todos os KPIs principais dentro ou acima da média de mercado ✓
          </p>
        )}
      </div>
    </div>
  )
}
