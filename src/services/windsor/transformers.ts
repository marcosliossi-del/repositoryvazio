/**
 * Transforma linhas da Windsor GA4 API em objetos compatíveis com MetricSnapshot.
 * (Windsor é usado somente para GA4 — Meta Ads usa a Meta Marketing API direta)
 */

import { toNum, type WindsorGA4Row } from './client'

export interface WindsorTransformedSnapshot {
  date: Date
  spend: number
  impressions: number
  clicks: number
  reach: number
  frequency: number
  ctr: number
  cpc: number
  conversions: number | null
  conversionValue: number | null
  roas: number | null
  cpl: number | null
  rawData: object
}

// ── GA4 ───────────────────────────────────────────────────────────────────────
// Mapeamento:
//   impressions     → screen_page_views
//   clicks          → sessions  (denominador da taxa de conversão)
//   reach           → active_users
//   frequency       → páginas por sessão
//   ctr             → engagement_rate em %
//   spend / cpc     → 0 (GA4 não tem custo de mídia)
//   conversions     → ecommerce_purchases
//   conversionValue → totalRevenue

export interface WindsorGA4TransformedSnapshot extends WindsorTransformedSnapshot {
  newUsers: number | null
}

export function transformWindsorGA4(row: WindsorGA4Row): WindsorGA4TransformedSnapshot {
  const sessions   = Math.round(toNum(row.sessions))
  const pageViews  = Math.round(toNum(row.screen_page_views))
  const users      = Math.round(toNum(row.active_users))
  const engagementRate = toNum(row.engagement_rate) * 100 // decimal → %
  const frequency  = sessions > 0 ? pageViews / sessions : 0

  const revenue     = toNum(row.totalRevenue) || null
  const newUsersRaw = Math.round(toNum(row.newUsers)) || null

  const ecommercePurchases = Math.round(toNum(row.ecommerce_purchases ?? row.ecommercePurchases)) || null

  return {
    date:      new Date(row.date + 'T00:00:00'),
    spend:     0,
    impressions: pageViews,
    clicks:    sessions,
    reach:     users,
    frequency: Math.round(frequency * 10000) / 10000,
    ctr:       Math.round(engagementRate * 100) / 100,
    cpc:       0,
    conversions:    ecommercePurchases,
    conversionValue: revenue,
    roas: null,
    cpl:  null,
    rawData: row,
    newUsers: newUsersRaw,
  }
}
