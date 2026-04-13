'use client'

import { useActionState, useState } from 'react'
import { FileText, Copy, Check, Loader2, RefreshCw, Calendar } from 'lucide-react'
import { generateClientReport } from '@/app/actions/weeklyReports'

function getDefaultRange() {
  const today = new Date()
  const dow = today.getDay()
  const daysToLastSat = dow === 6 ? 7 : dow + 1
  const lastSat = new Date(today)
  lastSat.setDate(today.getDate() - daysToLastSat)
  const lastSun = new Date(lastSat)
  lastSun.setDate(lastSat.getDate() - 6)
  const fmt = (d: Date) => d.toISOString().split('T')[0]
  return { from: fmt(lastSun), to: fmt(lastSat) }
}

type Props = {
  clientId: string
  clientSlug: string
  existingReport: { content: string; generatedAt: Date | string } | null
}

export function WeeklyReportCard({ clientId, clientSlug, existingReport }: Props) {
  const [copied, setCopied] = useState(false)
  const defaults = getDefaultRange()
  const [from, setFrom] = useState(defaults.from)
  const [to, setTo]     = useState(defaults.to)
  const [state, action, pending] = useActionState(generateClientReport, {
    content: existingReport?.content,
  })

  const reportContent = state.content ?? existingReport?.content
  const reportDate = existingReport?.generatedAt

  async function handleCopy() {
    if (!reportContent) return
    await navigator.clipboard.writeText(reportContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-[#0A1E2C] border border-[#38435C] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#38435C]">
        <div className="flex items-center gap-2">
          <FileText size={15} className="text-[#95BBE2]" />
          <div>
            <h3 className="text-sm font-semibold text-[#EBEBEB]">Relatório Semanal</h3>
            {reportDate && (
              <p className="text-[10px] text-[#87919E]">
                Gerado em {new Date(reportDate).toLocaleDateString('pt-BR', {
                  day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                })}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {reportContent && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#38435C]/50 text-[#87919E] hover:text-[#EBEBEB] text-xs transition-colors border border-[#38435C]"
            >
              {copied ? <Check size={13} className="text-[#22C55E]" /> : <Copy size={13} />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          )}
          <form action={action} className="flex items-center gap-2 flex-wrap justify-end">
            <input type="hidden" name="clientId" value={clientId} />
            <input type="hidden" name="clientSlug" value={clientSlug} />
            <div className="flex items-center gap-1.5 bg-[#1B2B3A] border border-[#38435C] rounded-lg px-2 h-8">
              <Calendar size={11} className="text-[#87919E]" />
              <input
                type="date"
                name="from"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="bg-transparent text-xs text-[#EBEBEB] focus:outline-none w-28"
              />
              <span className="text-[#87919E] text-xs">→</span>
              <input
                type="date"
                name="to"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="bg-transparent text-xs text-[#EBEBEB] focus:outline-none w-28"
              />
            </div>
            <button
              type="submit"
              disabled={pending}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#95BBE2]/10 text-[#95BBE2] hover:bg-[#95BBE2]/20 text-xs transition-colors border border-[#95BBE2]/20 disabled:opacity-50"
            >
              {pending ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
              {reportContent ? 'Regerar' : 'Gerar relatório'}
            </button>
          </form>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        {state.error && (
          <p className="text-sm text-[#EF4444] mb-3">{state.error}</p>
        )}
        {pending && (
          <div className="flex items-center justify-center py-8 gap-2 text-[#87919E]">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm">Gerando relatório com IA...</span>
          </div>
        )}
        {!pending && reportContent ? (
          <pre className="text-sm text-[#EBEBEB] whitespace-pre-wrap font-sans leading-relaxed">
            {reportContent}
          </pre>
        ) : !pending && !reportContent ? (
          <div className="flex flex-col items-center py-8 text-center">
            <FileText size={28} className="text-[#38435C] mb-2" />
            <p className="text-sm text-[#87919E]">
              Nenhum relatório gerado ainda.
            </p>
            <p className="text-xs text-[#87919E] mt-1 max-w-xs">
              Clique em &quot;Gerar relatório&quot; para criar um relatório semanal formatado para envio ao cliente (gerado automaticamente toda segunda-feira).
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
