'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/dal'
import { generateWeeklyReportForClient } from '@/services/weekly-report-generator'

export type ReportState = {
  error?: string
  success?: boolean
  content?: string
}

/** Generate (or regenerate) the weekly report for a specific client */
export async function generateClientReport(
  prevState: ReportState,
  formData: FormData
): Promise<ReportState> {
  await requireSession()

  const clientId   = formData.get('clientId')   as string
  const clientSlug = formData.get('clientSlug') as string
  const fromStr    = formData.get('from')        as string | null
  const toStr      = formData.get('to')          as string | null

  if (!clientId) return { error: 'Cliente não informado.' }

  try {
    const content = await generateWeeklyReportForClient(
      clientId,
      fromStr || undefined,
      toStr   || undefined,
    )
    if (!content) return { error: 'Relatório vazio — cliente não encontrado.' }
    revalidatePath(`/clients/${clientSlug}`)
    return { success: true, content }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { error: msg }
  }
}
