/**
 * Transforma linhas da Windsor API em objetos compatíveis com MetricSnapshot.
 */

import { toNum, type WindsorMetaRow, type WindsorGA4Row, type WindsorMetaCampaignRow } from './client'

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

// ── Meta Ads ──────────────────────────────────────────────────────────────────

export function transformWindsorMeta(row: WindsorMetaRow): WindsorTransformedSnapshot {
  const spend = toNum(row.spend)

  // Compras específicas (actions_purchase) — se indisponível usa conversions genérico como fallback
  // para clientes de lead-gen que não têm pixel de compra
  const allConversions = toNum(row.conversions) || null
  const purchaseCount = toNum(row.actions_purchase) || allConversions

  // Receita de compras
  const conversionValue = toNum(row.action_values_purchase) || null

  const roas: number | null = conversionValue && spend > 0
    ? Math.round((conversionValue / spend) * 10000) / 10000
    : null

  // CPL: custo por lead (purchase ou fallback)
  const cpl: number | null = purchaseCount && spend > 0
    ? Math.round((spend / purchaseCount) * 100) / 100
    : null

  return {
    date: new Date(row.date + 'T00:00:00'),
    spend,
    impressions: Math.round(toNum(row.impressions)),
    clicks:      Math.round(toNum(row.clicks)),
    reach:       Math.round(toNum(row.reach)),
    frequency:   Math.round(toNum(row.frequency) * 10000) / 10000,
    ctr:         Math.round(toNum(row.ctr) * 100) / 100,
    cpc:         Math.round(toNum(row.cpc) * 10000) / 10000,
    // ← agora armazena compras específicas (actions_purchase), não todas as conversões
    conversions: purchaseCount ? Math.round(purchaseCount) : null,
    conversionValue,
    roas,
    cpl,
    rawData: row,
  }
}

// ── Meta Ads — nível de campanha / conjunto ───────────────────────────────────

export interface WindsorCampaignSnapshot {
  date: Date
  campaignId: string
  campaignName: string
  adSetId: string | null
  adSetName: string | null
  spend: number
  impressions: number
  clicks: number
  reach: number
  ctr: number
  cpc: number
  conversions: number | null
  conversionValue: number | null
  roas: number | null
  cpl: number | null
}

export function transformWindsorMetaCampaign(row: WindsorMetaCampaignRow): WindsorCampaignSnapshot {
  const spend = toNum(row.spend)
  const purchases = toNum(row.actions_purchase) || null
  const revenue = toNum(row.action_values_purchase) || null
  const roas = revenue && spend > 0 ? Math.round((revenue / spend) * 10000) / 10000 : null
  const cpl  = purchases && spend > 0 ? Math.round((spend / purchases) * 100) / 100 : null

  return {
    date:         new Date(row.date + 'T00:00:00'),
    campaignId:   row.campaign_id   ?? 'unknown',
    campaignName: row.campaign_name ?? 'Campanha sem nome',
    adSetId:      row.adset_id   ?? null,
    adSetName:    row.adset_name ?? null,
    spend,
    impressions:     Math.round(toNum(row.impressions)),
    clicks:          Math.round(toNum(row.clicks)),
    reach:           Math.round(toNum(row.reach)),
    ctr:             Math.round(toNum(row.ctr) * 100) / 100,
    cpc:             Math.round(toNum(row.cpc) * 10000) / 10000,
    conversions:     purchases ? Math.round(purchases) : null,
    conversionValue: revenue,
    roas,
    cpl,
  }
}

// ── GA4 ───────────────────────────────────────────────────────────────────────
// Mapeamento:
//   impressions     → screen_page_views
//   clicks          → sessions  (sessões do site — denominador da taxa de conversão)
//   reach           → active_users
//   frequency       → páginas por sessão
//   ctr             → engagement_rate em %
//   spend / cpc     → 0 (GA4 não tem custo de mídia)
//   conversions     → ecommerce_purchases  (compras reais, não todos os eventos de conversão)
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

  const revenue      = toNum(row.totalRevenue) || null
  const newUsersRaw  = Math.round(toNum(row.newUsers)) || null

  // Usa ecommerce_purchases (compras reais) — evita inflar com page_view/scroll events.
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
