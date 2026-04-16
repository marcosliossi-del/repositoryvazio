'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'

type SyncState = 'idle' | 'running' | 'done' | 'error'

export function RecalcHealthButton() {
  const [state,    setState]    = useState<SyncState>('idle')
  const [label,    setLabel]    = useState<string | null>(null)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)

  async function handleClick() {
    setState('running')
    setProgress(null)

    try {
      const res = await fetch('/api/sync/stream', { method: 'GET' })
      if (!res.ok || !res.body) {
        setState('error')
        setLabel('Erro ao iniciar sync')
        return
      }

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let   buffer  = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // SSE messages are separated by double newlines
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
            } else if (event.type === 'done' || event.type === 'error') {
              setLabel(event.name)
              setProgress({ done: event.done, total: event.total })
            } else if (event.type === 'complete') {
              setState('done')
              setLabel(`✓ ${event.total} clientes sincronizados`)
              setProgress(null)
              setTimeout(() => {
                setState('idle')
                setLabel(null)
                window.location.reload()
              }, 1500)
            }
          } catch {
            // malformed event — ignore
          }
        }
      }
    } catch (e) {
      setState('error')
      setLabel('Erro de conexão')
      console.error('[RecalcHealth]', e)
    }
  }

  const isRunning = state === 'running'

  return (
    <button
      onClick={handleClick}
      disabled={isRunning || state === 'done'}
      className="flex items-center gap-1.5 text-xs text-[#87919E] hover:text-[#EBEBEB] transition-colors disabled:opacity-60"
      title="Sincronizar dados e recalcular saúde de todos os clientes"
    >
      <RefreshCw size={12} className={isRunning ? 'animate-spin' : ''} />
      <span>
        {isRunning && label && progress
          ? `${label} (${progress.done}/${progress.total})`
          : isRunning && label
          ? label
          : label ?? 'Recalcular saúde'}
      </span>
    </button>
  )
}
