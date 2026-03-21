'use server'

import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/dal'
import { createSession } from '@/lib/session'

const profileSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual obrigatória'),
  newPassword:     z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
})

export async function updateProfile(formData: FormData) {
  const session = await requireSession()

  const parsed = profileSchema.safeParse({ name: formData.get('name') })
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  await prisma.user.update({
    where: { id: session.userId },
    data: { name: parsed.data.name },
  })

  // Refresh session with new name
  await createSession({
    userId: session.userId,
    name: parsed.data.name,
    email: session.email,
    role: session.role,
  })
}

export async function changePassword(formData: FormData) {
  const session = await requireSession()

  const parsed = passwordSchema.safeParse({
    currentPassword: formData.get('currentPassword'),
    newPassword:     formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  })
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { passwordHash: true },
  })
  if (!user) throw new Error('Usuário não encontrado')

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash)
  if (!valid) throw new Error('Senha atual incorreta')

  const newHash = await bcrypt.hash(parsed.data.newPassword, 12)
  await prisma.user.update({ where: { id: session.userId }, data: { passwordHash: newHash } })
}
