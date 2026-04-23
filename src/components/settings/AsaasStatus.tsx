'use client'

import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, XCircle, Loader2, RefreshCw, Trash2, ExternalLink } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Info {
  hasKey:  boolean
  sandbox: boolean
  masked:  string
}

export function AsaasStatus() {
  const [info,    setInfo]    = useState<Info | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [result,  setResult]  = useState<{ ok: boolean; balance?: number; error?: string } | null>(null)
  const [form,    setForm]    = useState({ apiKey: '', sandbox: false })

  const fetchInfo = useCallback(async () => {
    const res = await fetch('/api/settings/asaas')
    if (res.ok) {
      const data = await res.json()
      setInfo(data)
      setForm(f => ({ ...f, sandbox: data.sandbox }))
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchInfo() }, [fetchInfo])

  async function handleSave() {
    if (!form.apiKey.trim()) return
    setSaving(true)
    setResult(null)
    try {
      const res  = await fetch('/api/settings/asaas', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ apiKey: form.apiKey.trim(), sandbox: form.sandbox }),
      })
      const data = await res.json()
      setResult(data)
      if (data.ok) {
        setForm(f => ({ ...f, apiKey: '' }))
        await fetchInfo()
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove() {
    await fetch('/api/settings/asaas', { method: 'DELETE' })
    setInfo(null)
    setResult(null)
    setLoading(true)
    await fetchInfo()
  }

  const inputCls = 'w-full h-9 px-3 rounded-lg bg-[#0A1E2C] border border-[#38435C] text-sm text-[#EBEBEB] placeholder-[#87919E] focus:outline-none focus:border-[#95BBE2] transition-colors'

  if (loading) return (
    <div className="flex items-center gap-2 text-sm text-[#87919E] py-2">
      <Loader2 size={14} className="animate-spin" /> Carregando...
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Status */}
      <div className="flex items-center gap-2 flex-wrap">
        {info?.hasKey ? (
          <>
            <CheckCircle size={15} className="text-[#22C55E]" />
            <span className="text-sm text-[#22C55E] font-medium">Conectado</span>
            {info.masked && <span className="text-xs text-[#87919E] font-mono">{info.masked}</span>}
            {info.sandbox && (
              <span className="text-[10px] border border-[#F59E0B]/40 text-[#F59E0B] px-1.5 py-0.5 rounded-full">
                Sandbox
              </span>
            )}
          </>
        ) : (
          <>
            <XCircle size={15} className="text-[#87919E]" />
            <span className="text-sm text-[#87919E]">Não configurado</span>
          </>
        )}
        {result?.ok     && result.balance !== undefined && (
          <span className="text-xs text-[#22C55E]">· Saldo: {formatCurrency(result.balance)}</span>
        )}
        {result?.ok === false && (
          <span className="text-xs text-[#EF4444]">· {result.error}</span>
        )}
      </div>

      {/* Form */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs text-[#87919E]">
              {info?.hasKey ? 'Nova API Key (deixe em branco para manter a atual)' : 'API Key do Asaas'}
            </label>
            <a
              href="https://app.asaas.com/customerConfig/index"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-[#95BBE2] hover:underline flex items-center gap-1"
            >
              Painel Asaas <ExternalLink size={10} />
            </a>
          </div>
          <input
            value={form.apiKey}
            onChange={e => setForm(f => ({ ...f, apiKey: e.target.value }))}
            placeholder={info?.hasKey ? '••••••••••••••••••••' : '$aact_...'}
            type="password"
            className={inputCls}
          />
        </div>

        {/* Sandbox toggle */}
        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            onClick={() => setForm(f => ({ ...f, sandbox: !f.sandbox }))}
            className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${
              form.sandbox ? 'bg-[#F59E0B]' : 'bg-[#38435C]'
            }`}
          >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
              form.sandbox ? 'translate-x-4' : 'translate-x-0.5'
            }`} />
          </div>
          <span className="text-xs text-[#87919E] group-hover:text-[#EBEBEB] transition-colors">
            Modo sandbox (testes)
          </span>
        </label>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving || (!form.apiKey.trim() && info?.hasKey)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[#95BBE2] text-[#0A1E2C] hover:bg-[#95BBE2]/90 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
            {saving ? 'Salvando...' : info?.hasKey ? 'Atualizar e testar' : 'Salvar e testar'}
          </button>

          {info?.hasKey && (
            <button
              onClick={handleRemove}
              className="flex items-center gap-1.5 text-xs text-[#EF4444]/70 hover:text-[#EF4444] transition-colors px-3 py-2"
            >
              <Trash2 size={12} /> Remover
            </button>
          )}
        </div>
      </div>

      <p className="text-[11px] text-[#87919E] leading-relaxed">
        Encontre sua API Key em: Painel Asaas → Configurações → Integrações → Chave de API.
        A sincronização financeira ocorre diariamente de forma automática.
      </p>
    </div>
  )
}
