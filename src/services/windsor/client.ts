/**
 * Cliente para a Windsor.ai Connector API.
 * Usado exclusivamente para GA4 — Meta Ads usa agora a Meta Marketing API direta.
 *
 * Documentação: https://windsor.ai/api-documentation/
 *
 * Endpoint base:  https://connectors.windsor.ai/{connector}
 * Auth:           ?api_key=WINDSOR_API_KEY
 * Conector:       googleanalytics4
 */

const WINDSOR_BASE = 'https://connectors.windsor.ai'

// ── GA4 (googleanalytics4) ────────────────────────────────────────────────────
// Windsor GA4 usa camelCase para métricas nativas do GA4.
const GA4_FIELDS = [
  'date',
  'account_id',
  'sessions',
  'screen_page_views',   // page views
  'active_users',        // usuários ativos
  'engagement_rate',     // taxa de engajamento (decimal)
  'ecommerce_purchases', // compras de e-commerce
  'totalRevenue',        // camelCase GA4 nativo — único nome aceito pelo Windsor
  'newUsers',            // novos usuários únicos — base para CAC
].join(',')

// ── Tipos de resposta ─────────────────────────────────────────────────────────

export interface WindsorGA4Row {
  date: string
  account_id?: string
  sessions?: number | string
  screen_page_views?: number | string
  active_users?: number | string
  engagement_rate?: number | string
  ecommerce_purchases?: number | string
  ecommercePurchases?: number | string   // camelCase fallback
  totalRevenue?: number | string
  newUsers?: number | string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Converte campo Windsor (string ou number) para number. */
export function toNum(val: number | string | undefined | null): number {
  if (val === undefined || val === null || val === '') return 0
  return typeof val === 'number' ? val : parseFloat(val) || 0
}

// ── Cliente Windsor ───────────────────────────────────────────────────────────

export class WindsorClient {
  private readonly apiKey: string

  constructor() {
    const key = process.env.WINDSOR_API_KEY
    if (!key) throw new Error('WINDSOR_API_KEY não configurada')
    this.apiKey = key
  }

  private async query<T>(
    connector: 'googleanalytics4',
    fields: string,
    accountId: string,
    since: string,
    until: string
  ): Promise<T[]> {
    const params = new URLSearchParams({
      api_key: this.apiKey,
      fields,
      date_from: since,
      date_to: until,
      account_id: accountId,
      _renderer: 'json',
    })

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 25_000)

    let res: Response
    try {
      res = await fetch(`${WINDSOR_BASE}/${connector}?${params}`, {
        next: { revalidate: 0 },
        signal: controller.signal,
      })
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        throw new Error(`Windsor API timeout (${connector}) — sem resposta em 25s`)
      }
      throw err
    } finally {
      clearTimeout(timeout)
    }

    if (!res.ok) {
      const body = await res.text()
      throw new Error(
        `Windsor API error ${res.status} (${connector}): ${body.slice(0, 300)}`
      )
    }

    const json = await res.json()
    return Array.isArray(json) ? json : ((json as { data?: T[] }).data ?? [])
  }

  /**
   * Busca relatório diário do GA4 para uma propriedade.
   * propertyId: ID ou nome da propriedade conforme configurado no Windsor.
   */
  async getGA4Report(
    propertyId: string,
    since: string,
    until: string
  ): Promise<WindsorGA4Row[]> {
    return this.query<WindsorGA4Row>('googleanalytics4', GA4_FIELDS, propertyId, since, until)
  }
}
