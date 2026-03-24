'use client'

import { useRef, useEffect, useActionState } from 'react'
import { MessageCircle, Send, Loader2 } from 'lucide-react'
import { sendChatMessage } from '@/app/actions/chat'
import { timeAgo } from '@/lib/utils'

type Message = {
  id: string
  content: string
  createdAt: Date | string
  user: {
    id: string
    name: string
    avatarUrl: string | null
    role: string
  }
}

type Props = {
  chatId: string
  clientSlug: string
  messages: Message[]
  currentUserId: string
}

export function ClientChatPanel({ chatId, clientSlug, messages, currentUserId }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const [state, action, pending] = useActionState(sendChatMessage, {})

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset()
    }
  }, [state.success])

  return (
    <div className="flex flex-col bg-[#0A1E2C] border border-[#38435C] rounded-2xl overflow-hidden h-[480px]">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#38435C]">
        <MessageCircle size={16} className="text-[#95BBE2]" />
        <span className="text-sm font-semibold text-[#EBEBEB]">Chat do Cliente</span>
        <span className="ml-auto text-[10px] text-[#87919E]">
          {messages.length} mensage{messages.length !== 1 ? 'ns' : 'm'}
        </span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle size={28} className="text-[#38435C] mb-2" />
            <p className="text-[#87919E] text-sm">Nenhuma mensagem ainda.</p>
            <p className="text-[#87919E] text-xs mt-0.5">
              Use este chat para alinhar a equipe sobre este cliente.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.user.id === currentUserId
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className="w-7 h-7 rounded-full bg-[#38435C] flex items-center justify-center text-[#95BBE2] text-[10px] font-bold flex-shrink-0">
                  {msg.user.name.charAt(0).toUpperCase()}
                </div>

                {/* Bubble */}
                <div className={`max-w-[72%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                  <div className="flex items-baseline gap-1.5">
                    {!isOwn && (
                      <span className="text-[10px] font-semibold text-[#95BBE2]">
                        {msg.user.name}
                      </span>
                    )}
                    <span className="text-[9px] text-[#87919E]">
                      {timeAgo(new Date(msg.createdAt))}
                    </span>
                  </div>
                  <div
                    className={`px-3 py-2 rounded-xl text-sm leading-relaxed ${
                      isOwn
                        ? 'bg-[#95BBE2]/15 text-[#EBEBEB] rounded-tr-sm'
                        : 'bg-[#38435C]/60 text-[#EBEBEB] rounded-tl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Input */}
      <div className="border-t border-[#38435C] px-3 py-2.5">
        {state.error && (
          <p className="text-xs text-[#EF4444] mb-2">{state.error}</p>
        )}
        <form ref={formRef} action={action} className="flex items-center gap-2">
          <input type="hidden" name="chatId" value={chatId} />
          <input type="hidden" name="clientSlug" value={clientSlug} />
          <input
            name="content"
            type="text"
            placeholder="Escreva uma mensagem..."
            disabled={pending}
            className="flex-1 bg-[#38435C]/40 border border-[#38435C] rounded-lg px-3 py-2 text-sm text-[#EBEBEB] placeholder-[#87919E] focus:outline-none focus:border-[#95BBE2]/50 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={pending}
            className="w-9 h-9 rounded-lg bg-[#95BBE2]/15 border border-[#95BBE2]/20 flex items-center justify-center text-[#95BBE2] hover:bg-[#95BBE2]/25 transition-colors disabled:opacity-50"
          >
            {pending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          </button>
        </form>
      </div>
    </div>
  )
}
