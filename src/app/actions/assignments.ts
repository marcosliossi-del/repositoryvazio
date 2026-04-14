'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/dal'

export async function updateClientPrimaryManager(
  clientId: string,
  managerId: string,
): Promise<{ error?: string }> {
  const session = await requireSession()
  if (session.role !== 'ADMIN') return { error: 'Sem permissão.' }

  if (!clientId || !managerId) return { error: 'Dados inválidos.' }

  // Verify manager exists and is active
  const manager = await prisma.user.findFirst({
    where: { id: managerId, active: true },
    select: { id: true },
  })
  if (!manager) return { error: 'Gestor não encontrado.' }

  // Remove primary flag from all existing assignments for this client
  await prisma.clientAssignment.updateMany({
    where: { clientId, isPrimary: true },
    data: { isPrimary: false },
  })

  // Upsert the new primary assignment
  await prisma.clientAssignment.upsert({
    where: { clientId_userId: { clientId, userId: managerId } },
    create: { clientId, userId: managerId, isPrimary: true },
    update: { isPrimary: true },
  })

  // Revalidate all pages that show manager/assignment data
  revalidatePath('/managers')
  revalidatePath('/managers/assignments')
  revalidatePath('/dashboard')
  revalidatePath('/clients')
  revalidatePath('/team')

  return {}
}
