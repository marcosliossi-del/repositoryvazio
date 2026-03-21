'use client'

import { useRef, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Lock } from 'lucide-react'
import { changePassword } from '@/app/actions/profile'

export function PasswordForm() {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus(null)
    const data = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await changePassword(data)
        formRef.current?.reset()
        setStatus({ type: 'success', msg: 'Senha alterada com sucesso!' })
      } catch (err) {
        setStatus({ type: 'error', msg: err instanceof Error ? err.message : 'Erro' })
      }
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#87919E] uppercase tracking-wider">Senha atual</label>
        <Input name="currentPassword" type="password" placeholder="••••••••" required />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#95BBE2] uppercase tracking-wider">Nova senha</label>
        <Input name="newPassword" type="password" placeholder="Mínimo 8 caracteres" required minLength={8} />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#95BBE2] uppercase tracking-wider">Confirmar nova senha</label>
        <Input name="confirmPassword" type="password" placeholder="••••••••" required />
      </div>

      {status && (
        <p className={`text-xs rounded-lg px-3 py-2 ${status.type === 'success' ? 'text-[#22C55E] bg-[#22C55E]/10' : 'text-[#EF4444] bg-[#EF4444]/10'}`}>
          {status.msg}
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
        {isPending ? 'Alterando...' : 'Alterar Senha'}
      </Button>
    </form>
  )
}
