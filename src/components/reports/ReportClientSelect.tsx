'use client'

import { useRouter } from 'next/navigation'

interface Props {
  clients: { id: string; name: string }[]
  defaultClientId: string
  weekOffset: number
}

export function ReportClientSelect({ clients, defaultClientId, weekOffset }: Props) {
  const router = useRouter()
  return (
    <select
      defaultValue={defaultClientId}
      onChange={(e) => router.push(`/reports?clientId=${e.target.value}&weekOffset=${weekOffset}`)}
      className="w-full h-10 px-3 rounded-lg bg-[#0A1E2C] border border-[#38435C] text-sm text-[#EBEBEB] focus:outline-none focus:border-[#95BBE2] appearance-none transition-colors"
    >
      <option value="">Selecionar cliente...</option>
      {clients.map((c) => (
        <option key={c.id} value={c.id}>{c.name}</option>
      ))}
    </select>
  )
}
