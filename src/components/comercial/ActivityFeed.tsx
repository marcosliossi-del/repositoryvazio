'use client'

import { useState } from 'react'
import { MessageSquare, Phone, Mail, Users, Send, FileText, ArrowRight, Plus } from 'lucide-react'
import type { Activity, ActivityType, Lead } from './types'

const ACTIVITY_ICONS: Record<ActivityType, React.ReactNode> = {
  NOTA:          <FileText size={12} />,
  LIGACAO:       <Phone size={12} />,
  EMAIL:         <Mail size={12} />,
  REUNIAO:       <Users size={12} />,
  WHATSAPP:      <MessageSquare size={12} />,
  STATUS_CHANGE: <ArrowRight size={12} />,
}

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  NOTA: 'Nota', LIGACAO: 'Ligação', EMAIL: 'E-mail',
  REUNIAO: 'Reunião', WHATSAPP: 'WhatsApp', STATUS_CHANGE: 'Status',
}

interface Props {
  lead:       Lead
  onActivity: (activity: Activity) => void
}

export function ActivityFeed({ lead, onActivity }: Props) {
  const [type,  setType]  = useState<ActivityType>('NOTA')
  const [title, setTitle] = useState('')
  const [body,  setBody]  = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/comercial/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead.id, type, title, body: body || undefined }),
      })
      if (res.ok) {
        const act = await res.json()
        onActivity(act)
        setTitle('')
        setBody('')
      }
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full bg-[#0A1E2C] border border-[#38435C] rounded-lg px-3 py-2 text-sm text-[#EBEBEB] placeholder-[#87919E] outline-none focus:border-[#95BBE2] transition-colors'

  return (
    <div className="space-y-4">
      {/* Add activity */}
      <form onSubmit={submit} className="bg-[#38435C]/20 border border-[#38435C] rounded-xl p-3 space-y-2">
        <div className="flex gap-2">
          <select
            value={type}
            onChange={e => setType(e.target.value as ActivityType)}
            className="bg-[#0A1E2C] border border-[#38435C] rounded-lg px-2 py-1.5 text-xs text-[#EBEBEB] outline-none focus:border-[#95BBE2]"
          >
            {(Object.keys(ACTIVITY_LABELS) as ActivityType[])
              .filter(t => t !== 'STATUS_CHANGE')
              .map(t => (
                <option key={t} value={t}>{ACTIVITY_LABELS[t]}</option>
              ))
            }
          </select>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Título da atividade..."
            className={inputCls}
            required
          />
        </div>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Detalhes (opcional)..."
          rows={2}
          className={inputCls + ' resize-none text-xs'}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || !title.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#22C55E] text-white hover:bg-[#16A34A] transition-colors disabled:opacity-50"
          >
            <Plus size={12} />
            {saving ? 'Salvando...' : 'Registrar'}
          </button>
        </div>
      </form>

      {/* Timeline */}
      <div className="space-y-2">
        {lead.activities.length === 0 && (
          <p className="text-xs text-[#87919E] text-center py-4">Nenhuma atividade registrada</p>
        )}
        {lead.activities.map(act => (
          <div key={act.id} className="flex gap-2.5">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#38435C]/60 flex items-center justify-center text-[#87919E] mt-0.5">
              {ACTIVITY_ICONS[act.type]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-[#EBEBEB]">{act.title}</span>
                <span className="text-[10px] text-[#87919E]">
                  {new Date(act.occurredAt).toLocaleDateString('pt-BR', {
                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                  })}
                </span>
                {act.user && (
                  <span className="text-[10px] text-[#87919E]">· {act.user.name}</span>
                )}
              </div>
              {act.body && (
                <p className="text-xs text-[#87919E] mt-0.5 leading-relaxed">{act.body}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
