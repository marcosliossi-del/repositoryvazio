'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { CheckCircle, Circle, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react'
import { toggleChecklistItem, regenerateChecklist } from '@/app/actions/weeklyChecklist'
import type { ChecklistItem } from '@/services/weekly-checklist-generator'

type Props = {
  items: ChecklistItem[]
}

export function WeeklyChecklistCard({ items }: Props) {
  const [toggleState, toggleAction, togglePending] = useActionState(toggleChecklistItem, {})
  const [regenState, regenAction, regenPending] = useActionState(regenerateChecklist, {})

  const done = items.filter((i) => i.done).length
  const total = items.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="bg-[#0A1E2C] border border-[#38435C] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#38435C]">
        <div>
          <h3 className="text-sm font-semibold text-[#EBEBEB]">Checklist da Semana</h3>
          <p className="text-[10px] text-[#87919E] mt-0.5">
            {done}/{total} concluído{done !== 1 ? 's' : ''} · {pct}%
          </p>
        </div>
        <form action={regenAction}>
          <button
            type="submit"
            disabled={regenPending}
            title="Regenerar checklist"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#87919E] hover:text-[#95BBE2] hover:bg-[#38435C]/50 transition-colors disabled:opacity-50"
          >
            {regenPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
          </button>
        </form>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-[#38435C]">
        <div
          className="h-1 bg-[#95BBE2] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Items */}
      <div className="divide-y divide-[#38435C]/50">
        {items.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <CheckCircle size={24} className="text-[#22C55E] mb-2" />
            <p className="text-sm text-[#EBEBEB] font-medium">Tudo em ordem!</p>
            <p className="text-xs text-[#87919E] mt-0.5">
              Nenhum cliente crítico ou em atenção esta semana.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.clientId} className={`px-4 py-3 ${item.done ? 'opacity-60' : ''}`}>
              <div className="flex items-start gap-3">
                {/* Toggle button */}
                <form action={toggleAction} className="flex-shrink-0 mt-0.5">
                  <input type="hidden" name="itemClientId" value={item.clientId} />
                  <button
                    type="submit"
                    disabled={togglePending}
                    className="text-[#87919E] hover:text-[#95BBE2] transition-colors disabled:opacity-50"
                  >
                    {item.done ? (
                      <CheckCircle size={16} className="text-[#22C55E]" />
                    ) : (
                      <Circle size={16} />
                    )}
                  </button>
                </form>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      href={`/clients/${item.clientSlug}`}
                      className="text-sm font-medium text-[#EBEBEB] hover:text-[#95BBE2] transition-colors truncate"
                    >
                      {item.clientName}
                    </Link>
                    <span
                      className={`flex-shrink-0 inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        item.status === 'RUIM'
                          ? 'bg-[#EF4444]/15 text-[#EF4444]'
                          : 'bg-[#EAB308]/15 text-[#EAB308]'
                      }`}
                    >
                      <AlertTriangle size={9} />
                      {item.status === 'RUIM' ? 'Crítico' : 'Atenção'}
                    </span>
                  </div>
                  <ul className="space-y-0.5">
                    {item.tasks.map((task, i) => (
                      <li key={i} className="text-xs text-[#87919E] flex items-start gap-1.5">
                        <span className="text-[#38435C] flex-shrink-0 mt-0.5">›</span>
                        <span className={item.done ? 'line-through' : ''}>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <div className="px-4 py-2.5 border-t border-[#38435C]/50">
          <p className="text-[10px] text-[#87919E]">
            Checklist gerado automaticamente toda segunda-feira com base na saúde dos clientes.
          </p>
        </div>
      )}
    </div>
  )
}
