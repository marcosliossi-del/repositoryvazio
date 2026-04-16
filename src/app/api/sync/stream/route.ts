import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { syncGA4Account } from '@/services/ga4/sync'
import { syncMetaAccount } from '@/services/meta-ads/sync'
import { syncGoogleAdsAccount } from '@/services/google-ads/sync'
import { recalculateClientHealth } from '@/services/health-scorer'
import { dispatchAlertsForClient } from '@/services/alert-dispatcher'

/**
 * GET /api/sync/stream
 *
 * Server-Sent Events endpoint. Streams sync progress client-by-client:
 *   1. For each active client, syncs all platforms in parallel
 *   2. Recalculates health scores
 *   3. Sends a SSE event after each client completes
 *
 * Auth: ADMIN session only
 */
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return new Response('Unauthorized', { status: 401 })
  }

  const clients = await prisma.client.findMany({
    where: { status: 'ACTIVE' },
    select: {
      id: true,
      name: true,
      platformAccounts: {
        where: { active: true },
        select: { id: true, platform: true },
      },
    },
    orderBy: { name: 'asc' },
  })

  const total = clients.length
  const enc = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        try {
          controller.enqueue(enc.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch {
          // client disconnected — ignore
        }
      }

      let done = 0

      for (const client of clients) {
        send({ type: 'start', name: client.name, done, total })

        try {
          const ga4Ids     = client.platformAccounts.filter(a => a.platform === 'GA4').map(a => a.id)
          const metaIds    = client.platformAccounts.filter(a => a.platform === 'META_ADS').map(a => a.id)
          const gadsIds    = client.platformAccounts.filter(a => a.platform === 'GOOGLE_ADS').map(a => a.id)

          // All platforms in parallel for this client
          await Promise.allSettled([
            ...ga4Ids.map(id  => syncGA4Account(id)),
            ...metaIds.map(id => syncMetaAccount(id)),
            ...gadsIds.map(id => syncGoogleAdsAccount(id)),
          ])

          // Recalculate health with fresh data
          const { created, updated, scores } = await recalculateClientHealth(client.id)
          await dispatchAlertsForClient(client.id, scores)

          done++
          send({ type: 'done', name: client.name, done, total, scores: created + updated })
        } catch {
          done++
          send({ type: 'error', name: client.name, done, total })
        }
      }

      send({ type: 'complete', done: total, total })
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
      'X-Accel-Buffering': 'no', // disable nginx buffering on Vercel
    },
  })
}
