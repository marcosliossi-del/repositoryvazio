'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/dal'

export type ChatMessageState = {
  error?: string
  success?: boolean
}

export async function sendChatMessage(
  prevState: ChatMessageState,
  formData: FormData
): Promise<ChatMessageState> {
  const session = await requireSession()

  const chatId = formData.get('chatId') as string
  const content = (formData.get('content') as string)?.trim()
  const clientSlug = formData.get('clientSlug') as string

  if (!chatId || !content) return { error: 'Mensagem não pode estar vazia.' }

  // Verify chat exists and user has access
  const chat = await prisma.clientChat.findUnique({
    where: { id: chatId },
    include: {
      client: {
        select: {
          assignments: { where: { userId: session.userId } },
        },
      },
    },
  })

  if (!chat) return { error: 'Chat não encontrado.' }

  // ADMIN can always post; others must be assigned
  if (session.role !== 'ADMIN' && chat.client.assignments.length === 0) {
    return { error: 'Sem permissão para este chat.' }
  }

  await prisma.clientChatMessage.create({
    data: {
      chatId,
      userId: session.userId,
      content,
    },
  })

  revalidatePath(`/clients/${clientSlug}`)
  return { success: true }
}

export async function ensureClientChat(clientId: string): Promise<string | null> {
  const chat = await prisma.clientChat.upsert({
    where: { clientId },
    create: { clientId },
    update: {},
    select: { id: true },
  })
  return chat.id
}
