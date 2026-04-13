'use client'

import { useState } from 'react'
import { Trash2, AlertTriangle, X } from 'lucide-react'
import { deletePlatformAccount } from '@/app/actions/platformAccounts'

interface Props {
  platformAccountId: string
  platformName: string
  accountName: string
}

export function RemovePlatformButton({ platformAccountId, platformName, accountName }: Props) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setLoading(true)
    const result = await deletePlatformAccount(platformAccountId)
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      window.location.reload()
    }
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        title="Remover plataforma"
        className="p-1 text-[#87919E] hover:text-[#EF4444] transition-colors opacity-0 group-hover:opacity-100"
      >
        <Trash2 size={13} />
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1.5 bg-[#1B2B3A] border border-[#EF4444]/40 rounded-lg px-2 py-1">
      <AlertTriangle size={11} className="text-[#EF4444] flex-shrink-0" />
      <span className="text-[10px] text-[#87919E]">
        Excluir <span className="text-[#EBEBEB]">{platformName}</span> e todos os dados de sync?
      </span>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-[10px] font-semibold text-[#EF4444] hover:text-[#EF4444]/80 disabled:opacity-50 ml-1"
      >
        {loading ? '...' : 'Excluir'}
      </button>
      <button
        onClick={() => { setConfirming(false); setError(null) }}
        className="text-[#87919E] hover:text-[#EBEBEB] ml-0.5"
      >
        <X size={11} />
      </button>
      {error && <span className="text-[10px] text-[#EF4444]">{error}</span>}
    </div>
  )
}
