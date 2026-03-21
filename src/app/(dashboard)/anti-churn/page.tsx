import { requireSession, getAtRiskClients } from '@/lib/dal'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShieldAlert, CheckCircle, TrendingDown } from 'lucide-react'
import Link from 'next/link'

export default async function AntiChurnPage() {
  const { userId, role } = await requireSession()
  const clients = await getAtRiskClients(userId, role)

  const alto  = clients.filter((c) => c.riskLevel === 'ALTO').length
  const medio = clients.filter((c) => c.riskLevel === 'MÉDIO').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#EBEBEB]">Anti Churn & Retenção</h1>
        <p className="text-[#87919E] text-sm mt-0.5">
          Clientes com performance Ruim em semanas consecutivas
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-[#EF4444]">
          <p className="text-xs text-[#87919E] uppercase tracking-wider mb-1">Risco Alto</p>
          <p className="text-3xl font-bold text-[#EF4444]">{alto}</p>
          <p className="text-xs text-[#87919E] mt-1">3+ semanas em Ruim</p>
        </Card>
        <Card className="border-l-4 border-l-[#EAB308]">
          <p className="text-xs text-[#87919E] uppercase tracking-wider mb-1">Risco Médio</p>
          <p className="text-3xl font-bold text-[#EAB308]">{medio}</p>
          <p className="text-xs text-[#87919E] mt-1">1–2 semanas em Ruim</p>
        </Card>
        <Card className="border-l-4 border-l-[#22C55E]">
          <p className="text-xs text-[#87919E] uppercase tracking-wider mb-1">Em Risco Total</p>
          <p className="text-3xl font-bold text-[#EBEBEB]">{clients.length}</p>
          <p className="text-xs text-[#87919E] mt-1">de todos os clientes</p>
        </Card>
      </div>

      {/* At-risk clients */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-[#EBEBEB]">Clientes em Risco</h2>

        {clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CheckCircle size={32} className="text-[#22C55E] mb-3" />
            <p className="text-[#EBEBEB] font-medium">Nenhum cliente em risco</p>
            <p className="text-[#87919E] text-sm mt-1">
              Todos os clientes estão com performance estável.
            </p>
          </div>
        ) : (
          clients.map((client) => {
            const isAlto  = client.riskLevel === 'ALTO'
            const isMedio = client.riskLevel === 'MÉDIO'
            const borderColor = isAlto ? 'border-l-[#EF4444]' : isMedio ? 'border-l-[#EAB308]' : 'border-l-[#22C55E]'
            const iconColor   = isAlto ? 'text-[#EF4444]' : 'text-[#EAB308]'
            const variant     = isAlto ? 'ruim' : isMedio ? 'regular' : 'otimo'

            return (
              <Card key={client.id} className={`p-5 border-l-4 ${borderColor}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#0A1E2C] flex items-center justify-center flex-shrink-0">
                      <ShieldAlert size={18} className={iconColor} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-[#EBEBEB]">{client.name}</h3>
                        <Badge variant={variant as 'otimo' | 'regular' | 'ruim'}>
                          Risco {client.riskLevel}
                        </Badge>
                      </div>
                      {client.primaryManager && (
                        <p className="text-xs text-[#87919E] mb-1">Gestor: {client.primaryManager}</p>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-[#87919E]">
                        <TrendingDown size={12} className={iconColor} />
                        <span>
                          <span className={`font-semibold ${iconColor}`}>{client.consecutiveRuimWeeks}</span>{' '}
                          semana{client.consecutiveRuimWeeks !== 1 ? 's' : ''} consecutiva{client.consecutiveRuimWeeks !== 1 ? 's' : ''} em Ruim
                        </span>
                        {client.worstMetric && (
                          <>
                            <span className="text-[#38435C]">·</span>
                            <span>Pior métrica: <span className="text-[#EBEBEB]">{client.worstMetric}</span> ({client.worstPct}%)</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Link
                      href="/ai-agents"
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#95BBE2]/10 text-[#95BBE2] text-xs font-medium hover:bg-[#95BBE2]/20 transition-colors border border-[#95BBE2]/20"
                    >
                      Script IA
                    </Link>
                    <Link
                      href={`/clients/${client.slug}`}
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#38435C]/50 text-[#EBEBEB] text-xs font-medium hover:bg-[#38435C] transition-colors border border-[#38435C]"
                    >
                      Ver cliente →
                    </Link>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
