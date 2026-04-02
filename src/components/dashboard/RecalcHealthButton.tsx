'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'

export function RecalcHealthButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/sync/health', { method: 'POST', body: '{}', headers: { 'Content-Type': 'application/json' } })
      const data = await res.json()
      if (data.ok) {
        setResult(`✓ ${data.clientsProcessed} clientes recalculados`)
        setTimeout(() => { setResult(null); window.location.reload() }, 1500)
      } else {
        setResult('Erro ao recalcular')
      }
    } catch {
      setResult('Erro ao recalcular')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs text-[#87919E] hover:text-[#EBEBEB] transition-colors disabled:opacity-50"
      title="Recalcular saúde de todos os clientes"
    >
      <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
      <span>{result ?? 'Recalcular saúde'}</span>
    </button>
  )
}
