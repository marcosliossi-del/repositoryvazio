'use client'

import { useRef, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Save } from 'lucide-react'
import { updateProfile } from '@/app/actions/profile'

export function ProfileForm({ defaultName }: { defaultName: string }) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus(null)
    const data = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await updateProfile(data)
        setStatus({ type: 'success', msg: 'Perfil atualizado!' })
      } catch (err) {
        setStatus({ type: 'error', msg: err instanceof Error ? err.message : 'Erro' })
      }
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#95BBE2] uppercase tracking-wider">Nome completo</label>
        <Input name="name" defaultValue={defaultName} required />
      </div>

      {status && (
        <p className={`text-xs rounded-lg px-3 py-2 ${status.type === 'success' ? 'text-[#22C55E] bg-[#22C55E]/10' : 'text-[#EF4444] bg-[#EF4444]/10'}`}>
          {status.msg}
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
        {isPending ? 'Salvando...' : 'Salvar Perfil'}
      </Button>
    </form>
  )
}
