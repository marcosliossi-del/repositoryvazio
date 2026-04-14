export const revalidate = 0

import { requireSession, getAssignmentsData } from '@/lib/dal'
import { redirect } from 'next/navigation'
import { ArrowLeft, Users } from 'lucide-react'
import Link from 'next/link'
import { AssignmentsClient } from '@/components/managers/AssignmentsClient'

export default async function AssignmentsPage() {
  const session = await requireSession()
  if (session.role !== 'ADMIN') redirect('/managers')

  const { clients, managers } = await getAssignmentsData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/managers"
          className="w-9 h-9 rounded-lg bg-[#0A1E2C] border border-[#38435C] flex items-center justify-center hover:border-[#95BBE2] transition-colors"
        >
          <ArrowLeft size={15} className="text-[#87919E]" />
        </Link>
        <div className="w-10 h-10 rounded-xl bg-[#0A1E2C] border border-[#38435C] flex items-center justify-center">
          <Users size={18} className="text-[#95BBE2]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#EBEBEB]">Atribuição de Clientes</h1>
          <p className="text-[#87919E] text-sm">
            {clients.length} clientes ativos · altere o gestor principal por cliente
          </p>
        </div>
      </div>

      <AssignmentsClient clients={clients} managers={managers} />
    </div>
  )
}
