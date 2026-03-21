'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/dal'
import { TaskPriority, TaskStatus } from '@prisma/client'

const createSchema = z.object({
  title:       z.string().min(3, 'Título obrigatório'),
  description: z.string().optional(),
  priority:    z.nativeEnum(TaskPriority).default('MEDIUM'),
  dueDate:     z.string().optional(),
  clientId:    z.string().optional(),
})

export async function createTask(formData: FormData) {
  const { userId } = await requireSession()

  const raw = {
    title:       formData.get('title'),
    description: formData.get('description') ?? undefined,
    priority:    formData.get('priority') ?? 'MEDIUM',
    dueDate:     formData.get('dueDate') ?? undefined,
    clientId:    formData.get('clientId') ?? undefined,
  }

  const parsed = createSchema.safeParse(raw)
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(', '))
  }

  const { title, description, priority, dueDate, clientId } = parsed.data

  await prisma.task.create({
    data: {
      title,
      description: description || null,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      clientId: clientId || null,
      assignedTo: userId,
    },
  })

  revalidatePath('/tasks')
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  await requireSession()

  await prisma.task.update({
    where: { id: taskId },
    data: { status },
  })

  revalidatePath('/tasks')
}
