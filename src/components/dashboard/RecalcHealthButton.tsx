'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'

type SyncState = 'idle' | 'running' | 'done'

export function RecalcHealthButton() {
  const [state,    setState]    = useState<SyncState>('idle')
  const [label,    setLabel]    = useState<string | null>(null)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)

  async function handleClick() {
    setState('running')
    setProgress(null)
    setLabel(null)

    try {
      const res = await fetch('/api/sync/stream', { method: 'GET' })
      if (!res.ok || !res.body) {
        setState('idle')
        setLabel('Erro ao iniciar')
        return
      }

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let   buffer  = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''

        for (const part of parts) {
          const line = part.split('\n').find(l => l.startsWith('data:'))
          if (!line) continue
          try {
            const event = JSON.parse(line.slice(5).trim())

            if (event.type === 'start') {
              setLabel(event.name)
              setProgress({ done: event.done, total: event.total })
              // Tell the table which row is currently syncing
              window.dispatchEvent(new CustomEvent('sync-client-start', { detail: { clientId: event.clientId } }))
            }

            if (event.type === 'done' && event.row) {
              setLabel(event.name)
              setProgress({ done: event.done, total: event.total })
              // Push updated row data to the operational table in real-time
              window.dispatchEvent(new CustomEvent('sync-row-update', { detail: event.row }))
            }

            if (event.type === 'complete') {
              setState('done')
              setLabel(`✓ ${event.total} clientes`)
              setProgress(null)
              window.dispatchEvent(new CustomEvent('sync-complete', { detail: {} }))
              // Reload to refresh health summary, manager cards, alerts, checklist
              setTimeout(() => {
                setState('idle')
                setLabel(null)
                window.location.reload()
              }, 1800)
            }
          } catch { /* malformed SSE event */ }
        }
      }
    } catch (e) {
      setState('idle')
      setLabel('Erro de conexão')
      console.error('[RecalcHealth]', e)
    }
  }

  const isRunning = state === 'running'

  const displayLabel =
    isRunning && label && progress
      ? `${label} (${progress.done}/${progress.total})`
      : label ?? 'Recalcular saúde'

  return (
    <button
      onClick={handleClick}
      disabled={isRunning || state === 'done'}
      className="flex items-center gap-1.5 text-xs text-[#87919E] hover:text-[#EBEBEB] transition-colors disabled:opacity-60"
      title="Sincronizar todos os clientes e recalcular saúde"
    >
      <RefreshCw size={12} className={isRunning ? 'animate-spin' : ''} />
      <span className="max-w-[200px] truncate">{displayLabel}</span>
    </button>
  )
}
