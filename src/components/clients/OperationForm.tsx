'use client'

import { useRef, useState, useTransition } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BookOpen, Plus, Loader2 } from 'lucide-react'
import { createOperation } from '@/app/actions/operations'

interface Props {
  clients: { id: string; name: string }[]
}

export function OperationForm({ clients }: Props) {
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    const data = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await createOperation(data)
        formRef.current?.reset()
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao salvar')
      }
    })
  }

  return (
    <Card>
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-[#95BBE2]/15 flex items-center justify-center">
          <BookOpen size={14} className="text-[#95BBE2]" />
        </div>
        <h2 className="text-sm font-semibold text-[#EBEBEB]">Nova Entrada</h2>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#95BBE2] uppercase tracking-wider">
            Assunto *
          </label>
          <Input name="subject" placeholder="Título ou assunto da anotação" required />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#95BBE2] uppercase tracking-wider">
            Cliente *
          </label>
          <select
            name="clientId"
            required
            className="w-full h-10 px-3 rounded-lg bg-[#0A1E2C] border border-[#38435C] text-sm text-[#EBEBEB] focus:outline-none focus:border-[#95BBE2] transition-colors"
          >
            <option value="">Selecionar cliente</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#95BBE2] uppercase tracking-wider">
            O que foi solicitado *
          </label>
          <textarea
            name="requested"
            placeholder="Descreva o que o cliente solicitou..."
            required
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-[#0A1E2C] border border-[#38435C] text-sm text-[#EBEBEB] placeholder-[#87919E] focus:outline-none focus:border-[#95BBE2] transition-colors resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#95BBE2] uppercase tracking-wider">
            O que foi feito *
          </label>
          <textarea
            name="done"
            placeholder="Descreva as ações realizadas..."
            required
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-[#0A1E2C] border border-[#38435C] text-sm text-[#EBEBEB] placeholder-[#87919E] focus:outline-none focus:border-[#95BBE2] transition-colors resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#87919E] uppercase tracking-wider">
            Observações
          </label>
          <textarea
            name="notes"
            placeholder="Observações adicionais..."
            rows={2}
            className="w-full px-3 py-2 rounded-lg bg-[#0A1E2C] border border-[#38435C] text-sm text-[#EBEBEB] placeholder-[#87919E] focus:outline-none focus:border-[#95BBE2] transition-colors resize-none"
          />
        </div>

        {error && (
          <p className="text-xs text-[#EF4444] bg-[#EF4444]/10 rounded-lg px-3 py-2">{error}</p>
        )}
        {success && (
          <p className="text-xs text-[#22C55E] bg-[#22C55E]/10 rounded-lg px-3 py-2">Operação registrada com sucesso!</p>
        )}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          {isPending ? 'Salvando...' : 'Registrar Operação'}
        </Button>
      </form>
    </Card>
  )
}
