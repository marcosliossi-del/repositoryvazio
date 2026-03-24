import { NextRequest, NextResponse } from 'next/server'
import { syncAllMetaAccounts } from '@/services/meta-ads/sync'
import { syncAllGA4Accounts } from '@/services/ga4/sync'
import { recalculateAllClientsHealth } from '@/services/health-scorer'
import { detectOscillationsForAll } from '@/services/oscillation-detector'

/**
 * POST /api/cron/daily
 *
 * Master daily cron job. Runs at 12:00 UTC (09:00 BRT).
 * Auth: x-cron-secret header only (no session required).
 *
 * Steps (each runs independently — one failing won't stop the others):
 *   1. Sync all Meta Ads accounts
 *   2. Sync all GA4 accounts
 *   3. Recalculate health scores for all active clients
 *   4. Run oscillation detection for all active clients
 *
 * Returns a JSON summary: { synced, healthScores, alerts }
 */
export async function POST(request: NextRequest) {
  // Auth: only x-cron-secret, no session
  const cronSecret = request.headers.get('x-cron-secret')
  if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const summary: {
    synced: {
      meta: { ok: boolean; accounts?: number; error?: string }
      ga4: { ok: boolean; accounts?: number; error?: string }
    }
    healthScores: {
      ok: boolean
      clientsProcessed?: number
      created?: number
      updated?: number
      error?: string
    }
    alerts: {
      ok: boolean
      clientsProcessed?: number
      totalAlerts?: number
      error?: string
    }
  } = {
    synced: {
      meta: { ok: false },
      ga4: { ok: false },
    },
    healthScores: { ok: false },
    alerts: { ok: false },
  }

  // ── Step 1: Sync Meta Ads ──────────────────────────────────────────────────
  try {
    const metaResults = await syncAllMetaAccounts()
    summary.synced.meta = { ok: true, accounts: metaResults.length }
  } catch (err) {
    summary.synced.meta = {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }

  // ── Step 2: Sync GA4 ───────────────────────────────────────────────────────
  try {
    const ga4Results = await syncAllGA4Accounts()
    summary.synced.ga4 = { ok: true, accounts: ga4Results.length }
  } catch (err) {
    summary.synced.ga4 = {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }

  // ── Step 3: Recalculate health scores ─────────────────────────────────────
  try {
    const healthResult = await recalculateAllClientsHealth()
    summary.healthScores = {
      ok: true,
      clientsProcessed: healthResult.clientsProcessed,
      created: healthResult.totalCreated,
      updated: healthResult.totalUpdated,
    }
  } catch (err) {
    summary.healthScores = {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }

  // ── Step 4: Oscillation detection ─────────────────────────────────────────
  try {
    const oscillationResult = await detectOscillationsForAll()
    summary.alerts = {
      ok: true,
      clientsProcessed: oscillationResult.clientsProcessed,
      totalAlerts: oscillationResult.totalAlerts,
    }
  } catch (err) {
    summary.alerts = {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }

  return NextResponse.json({ ok: true, ...summary })
}
