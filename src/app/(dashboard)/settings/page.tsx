import { requireSession } from '@/lib/dal'
import { ProfileForm } from '@/components/settings/ProfileForm'
import { PasswordForm } from '@/components/settings/PasswordForm'
import { User, Lock } from 'lucide-react'

export default async function SettingsPage() {
  const session = await requireSession()

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-[#EBEBEB]">Configurações</h1>
        <p className="text-[#87919E] text-sm mt-0.5">Gerencie seu perfil e segurança</p>
      </div>

      {/* Profile */}
      <div className="bg-[#0A1E2C] border border-[#38435C] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <User size={16} className="text-[#95BBE2]" />
          <h2 className="text-sm font-semibold text-[#EBEBEB]">Perfil</h2>
        </div>

        {/* Avatar initials */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-[#38435C] flex items-center justify-center text-[#95BBE2] text-xl font-bold">
            {session.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-[#EBEBEB]">{session.name}</p>
            <p className="text-xs text-[#87919E]">{session.email}</p>
          </div>
        </div>

        <ProfileForm defaultName={session.name} />
      </div>

      {/* Password */}
      <div className="bg-[#0A1E2C] border border-[#38435C] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Lock size={16} className="text-[#95BBE2]" />
          <h2 className="text-sm font-semibold text-[#EBEBEB]">Alterar Senha</h2>
        </div>
        <PasswordForm />
      </div>
    </div>
  )
}
