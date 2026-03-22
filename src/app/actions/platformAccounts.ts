'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/dal'
import { MetaAdsClient } from '@/services/meta-ads/client'
import { GA4Client } from '@/services/ga4/client'

export interface LinkAccountState {
  error?: string
  success?: boolean
  accountName?: string
}

/**
 * Links a Meta Ads account to a client.
 * Validates the access token before saving.
 */
export async function linkMetaAccount(
  clientId: string,
  adAccountId: string,
  accessToken: string,
  accountName?: string
): Promise<LinkAccountState> {
  const session = await requireSession()

  // Non-admins must be assigned to this client
  if (session.role !== 'ADMIN') {
    const assignment = await prisma.clientAssignment.findFirst({
      where: { clientId, userId: session.userId },
    })
    if (!assignment) {
      return { error: 'Você não tem permissão para vincular contas a este cliente.' }
    }
  }

  // Normalize: Meta returns "act_1234", store as-is
  const externalId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`

  // Check for duplicates
  const existing = await prisma.platformAccount.findUnique({
    where: { clientId_platform_externalId: { clientId, platform: 'META_ADS', externalId } },
  })
  if (existing) {
    if (existing.active) {
      return { error: 'Esta conta já está vinculada a este cliente.' }
    }
    // Reactivate if previously deactivated
    await prisma.platformAccount.update({
      where: { id: existing.id },
      data: { accessToken, active: true, name: accountName ?? existing.name },
    })
    revalidatePath(`/clients`)
    return { success: true, accountName: accountName ?? existing.name ?? externalId }
  }

  await prisma.platformAccount.create({
    data: {
      clientId,
      platform: 'META_ADS',
      externalId,
      name: accountName,
      accessToken,
    },
  })

  revalidatePath(`/clients`)
  return { success: true, accountName: accountName ?? externalId }
}

/**
 * Validates a Meta access token and returns accessible ad accounts.
 */
export async function validateMetaToken(
  accessToken: string
): Promise<{ valid: boolean; accounts: { id: string; name: string; currency: string }[]; error?: string }> {
  await requireSession()

  try {
    const client = new MetaAdsClient(accessToken)
    const { valid } = await client.validateToken()
    if (!valid) return { valid: false, accounts: [], error: 'Token inválido ou expirado.' }

    const accounts = await client.getAdAccounts()
    return { valid: true, accounts }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { valid: false, accounts: [], error: msg }
  }
}

/**
 * Validates a GA4 property ID using the service account key from env.
 */
export async function validateGA4Property(
  propertyId: string
): Promise<{ valid: boolean; error?: string }> {
  await requireSession()

  try {
    const client = new GA4Client()
    return await client.validateProperty(propertyId)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { valid: false, error: msg }
  }
}

/**
 * Links a GA4 property to a client.
 * Uses the shared service account key configured in env vars.
 */
export async function linkGA4Account(
  clientId: string,
  propertyId: string,
  name?: string
): Promise<LinkAccountState> {
  const session = await requireSession()

  if (session.role !== 'ADMIN') {
    const assignment = await prisma.clientAssignment.findFirst({
      where: { clientId, userId: session.userId },
    })
    if (!assignment) {
      return { error: 'Você não tem permissão para vincular contas a este cliente.' }
    }
  }

  // Normalize: store without "properties/" prefix
  const externalId = propertyId.replace(/^properties\//, '')

  const existing = await prisma.platformAccount.findUnique({
    where: { clientId_platform_externalId: { clientId, platform: 'GA4', externalId } },
  })

  if (existing) {
    if (existing.active) {
      return { error: 'Esta propriedade GA4 já está vinculada a este cliente.' }
    }
    await prisma.platformAccount.update({
      where: { id: existing.id },
      data: { active: true, name: name ?? existing.name },
    })
    revalidatePath('/clients')
    return { success: true, accountName: name ?? existing.name ?? externalId }
  }

  await prisma.platformAccount.create({
    data: {
      clientId,
      platform: 'GA4',
      externalId,
      name: name ?? `GA4 — ${externalId}`,
    },
  })

  revalidatePath('/clients')
  return { success: true, accountName: name ?? `GA4 — ${externalId}` }
}

/**
 * Deactivates (soft-deletes) a platform account.
 */
export async function unlinkPlatformAccount(platformAccountId: string): Promise<{ error?: string }> {
  const session = await requireSession()

  const account = await prisma.platformAccount.findUnique({
    where: { id: platformAccountId },
    select: { clientId: true },
  })
  if (!account) return { error: 'Conta não encontrada.' }

  if (session.role !== 'ADMIN') {
    const assignment = await prisma.clientAssignment.findFirst({
      where: { clientId: account.clientId, userId: session.userId },
    })
    if (!assignment) return { error: 'Sem permissão.' }
  }

  await prisma.platformAccount.update({
    where: { id: platformAccountId },
    data: { active: false },
  })

  revalidatePath(`/clients`)
  return {}
}
