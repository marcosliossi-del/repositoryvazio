'use client'

import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import type { CampaignRow } from '@/lib/dal'
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'

type SortKey = 'spend' | 'roas' | 'conversions' | 'conversionValue' | 'cpl' | 'spendShare'
type SortDir = 'asc' | 'desc'

function roasColor(roas: number | null, avgRoas: number | null): string {
  if (roas === null) return '#87919E'
  if (avgRoas === null) return '#EBEBEB'
  if (roas >= avgRoas * 0.9) return '#22C55E'
  if (roas >= avgRoas * 0.6) return '#EAB308'
  return '#EF4444'
}

function RoasBadge({ roas, avg }: { roas: number | null; avg: number | null }) {
  const color = roasColor(roas, avg)
  if (roas === null) return <span className="text-[#87919E] text-xs">—</span>
  return (
    <span className="text-xs font-semibold" style={{ color }}>
      {roas.toFixed(2)}x
    </span>
  )
}

type Props = {
  campaigns: CampaignRow[]
  periodDays: number
}

export function CampaignBreakdownTable({ campaigns, periodDays }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('spend')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [showAdSets, setShowAdSets] = useState(false)

  if (campaigns.length === 0) {
    return (
      <div className="bg-[#0A1E2C] border border-[#38435C] rounded-xl p-6 text-center">
        <p className="text-[#87919E] text-sm">
          Nenhum dado de campanha disponível. Sincronize o Meta Ads para ver o breakdown.
        </p>
      </div>
    )
  }

  const totalSpend = campaigns.reduce((s, r) => s + r.spend, 0)
  const totalRevenue = campaigns.reduce((s, r) => s + r.conversionValue, 0)
  const avgRoas = totalSpend > 0 && totalRevenue > 0 ? totalRevenue / totalSpend : null

  // Optionally group at campaign level (merge adsets)
  const rows = showAdSets
    ? campaigns
    : (() => {
        const byCampaign = new Map<string, CampaignRow>()
        for (const r of campaigns) {
          const existing = byCampaign.get(r.campaignId)
          if (!existing) {
            byCampaign.set(r.campaignId, { ...r })
          } else {
            existing.spend           += r.spend
            existing.impressions     += r.impressions
            existing.clicks          += r.clicks
            existing.conversions     += r.conversions
            existing.conversionValue += r.conversionValue
            existing.spendShare      += r.spendShare
          }
        }
        return [...byCampaign.values()].map((r) => ({
          ...r,
          roas: r.spend > 0 && r.conversionValue > 0 ? r.conversionValue / r.spend : null,
          cpl:  r.spend > 0 && r.conversions > 0 ? r.spend / r.conversions : null,
        }))
      })()

  const sorted = [...rows].sort((a, b) => {
    const va = a[sortKey] ?? -1
    const vb = b[sortKey] ?? -1
    return sortDir === 'desc' ? (vb as number) - (va as number) : (va as number) - (vb as number)
  })

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ChevronsUpDown size={10} className="text-[#38435C]" />
    return sortDir === 'desc'
      ? <ChevronDown size={10} className="text-[#95BBE2]" />
      : <ChevronUp size={10} className="text-[#95BBE2]" />
  }

  const Th = ({ label, k }: { label: string; k: SortKey }) => (
    <th
      className="text-left text-[10px] font-semibold text-[#87919E] uppercase tracking-wide py-2 px-3 cursor-pointer hover:text-[#EBEBEB] whitespace-nowrap select-none"
      onClick={() => toggleSort(k)}
    >
      <span className="flex items-center gap-1">
        {label}
        <SortIcon k={k} />
      </span>
    </th>
  )

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-[#87919E]">
          <span>Últimos {periodDays} dias</span>
          <span>·</span>
          <span>
            ROAS blend conta:{' '}
            <span className="font-semibold text-[#EBEBEB]">
              {avgRoas !== null ? `${avgRoas.toFixed(2)}x` : '—'}
            </span>
          </span>
          <span>·</span>
          <span>
            Total investido:{' '}
            <span className="font-semibold text-[#EBEBEB]">{formatCurrency(totalSpend)}</span>
          </span>
        </div>
        <button
          onClick={() => setShowAdSets((v) => !v)}
          className="text-[10px] px-2 py-1 rounded border border-[#38435C] text-[#87919E] hover:text-[#EBEBEB] hover:border-[#95BBE2] transition-colors"
        >
          {showAdSets ? 'Agrupar por campanha' : 'Ver por conjunto'}
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#0A1E2C] border border-[#38435C] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#38435C]">
                <th className="text-left text-[10px] font-semibold text-[#87919E] uppercase tracking-wide py-2 px-3">
                  {showAdSets ? 'Campanha / Conjunto' : 'Campanha'}
                </th>
                <Th label="Invest." k="spend" />
                <Th label="Share" k="spendShare" />
                <Th label="Compras" k="conversions" />
                <Th label="Receita" k="conversionValue" />
                <Th label="ROAS" k="roas" />
                <Th label="CPA" k="cpl" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, i) => {
                const isBelow = row.roas !== null && avgRoas !== null && row.roas < avgRoas * 0.6
                return (
                  <tr
                    key={`${row.campaignId}-${row.adSetId}-${i}`}
                    className={`border-b border-[#38435C]/50 last:border-0 hover:bg-[#38435C]/20 transition-colors ${isBelow ? 'bg-[#EF4444]/5' : ''}`}
                  >
                    <td className="py-2.5 px-3 max-w-[220px]">
                      <p className="text-[#EBEBEB] font-medium truncate">{row.campaignName}</p>
                      {showAdSets && row.adSetName && (
                        <p className="text-[#87919E] text-[10px] truncate mt-0.5">↳ {row.adSetName}</p>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-[#EBEBEB] whitespace-nowrap">
                      {formatCurrency(row.spend)}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 bg-[#38435C] rounded-full h-1 flex-shrink-0">
                          <div
                            className="h-1 rounded-full bg-[#95BBE2]"
                            style={{ width: `${Math.min(100, row.spendShare)}%` }}
                          />
                        </div>
                        <span className="text-[#87919E] text-[10px] whitespace-nowrap">
                          {row.spendShare.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-[#EBEBEB]">
                      {row.conversions > 0 ? row.conversions.toLocaleString('pt-BR') : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-[#EBEBEB] whitespace-nowrap">
                      {row.conversionValue > 0 ? formatCurrency(row.conversionValue) : '—'}
                    </td>
                    <td className="py-2.5 px-3">
                      <RoasBadge roas={row.roas} avg={avgRoas} />
                    </td>
                    <td className="py-2.5 px-3 text-[#87919E] whitespace-nowrap">
                      {row.cpl !== null ? formatCurrency(row.cpl) : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            {/* Totals footer */}
            <tfoot>
              <tr className="border-t-2 border-[#38435C] bg-[#38435C]/20">
                <td className="py-2 px-3 text-[10px] font-semibold text-[#87919E] uppercase">
                  Total ({sorted.length} {showAdSets ? 'conjuntos' : 'campanhas'})
                </td>
                <td className="py-2 px-3 text-[#EBEBEB] font-semibold whitespace-nowrap">
                  {formatCurrency(totalSpend)}
                </td>
                <td className="py-2 px-3 text-[#87919E] text-[10px]">100%</td>
                <td className="py-2 px-3 text-[#EBEBEB] font-semibold">
                  {sorted.reduce((s, r) => s + r.conversions, 0).toLocaleString('pt-BR')}
                </td>
                <td className="py-2 px-3 text-[#EBEBEB] font-semibold whitespace-nowrap">
                  {formatCurrency(totalRevenue)}
                </td>
                <td className="py-2 px-3">
                  <RoasBadge roas={avgRoas} avg={avgRoas} />
                </td>
                <td className="py-2 px-3 text-[#87919E]">—</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-[#87919E]">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#22C55E]" /> ROAS ≥ 90% da média
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#EAB308]" /> ROAS 60–89%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#EF4444]" /> ROAS abaixo de 60% — puxando a média pra baixo
        </span>
      </div>
    </div>
  )
}
