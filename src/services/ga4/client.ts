/**
 * Cliente para a Google Analytics Data API v1beta.
 * Autenticação via OAuth2 (refresh token → access token).
 * Sem SDK externo — usa fetch nativo.
 *
 * Variáveis de ambiente necessárias:
 *   GOOGLE_CLIENT_ID      — OAuth2 client ID
 *   GOOGLE_CLIENT_SECRET  — OAuth2 client secret
 *   GOOGLE_REFRESH_TOKEN  — refresh token obtido via OAuth Playground
 */

export interface GA4Row {
  date: string           // "YYYYMMDD"
  sessions: string
  screenPageViews: string
  activeUsers: string
  engagementRate: string  // decimal, ex: "0.6523"
  ecommercePurchases: string  // compras de e-commerce (evento purchase)
  purchaseRevenue: string     // receita de compras (purchase events)
  totalRevenue: string        // receita total (purchase + ads + subscriptions)
  newUsers: string
}

export interface GA4ItemRow {
  itemName: string
  itemCategory: string
  itemRevenue: string
  itemsPurchased: string
}

const GA4_BASE = 'https://analyticsdata.googleapis.com/v1beta'
const TOKEN_URI = 'https://oauth2.googleapis.com/token'

const METRIC_NAMES = [
  'sessions',
  'screenPageViews',
  'activeUsers',
  'engagementRate',
  'ecommercePurchases',
  'purchaseRevenue',
  'totalRevenue',
  'newUsers',
]

async function getAccessToken(clientId: string, clientSecret: string, refreshToken: string): Promise<string> {
  const res = await fetch(TOKEN_URI, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Falha ao obter token GA4: ${err}`)
  }

  const json = await res.json()
  return json.access_token as string
}

function normalizePropertyId(propertyId: string): string {
  return propertyId.startsWith('properties/') ? propertyId : `properties/${propertyId}`
}

export class GA4Client {
  private clientId: string
  private clientSecret: string
  private refreshToken: string

  constructor() {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN

    if (!clientId || !clientSecret || !refreshToken) {
      throw new Error(
        'Credenciais GA4 não configuradas. Configure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET e GOOGLE_REFRESH_TOKEN.'
      )
    }

    this.clientId = clientId
    this.clientSecret = clientSecret
    this.refreshToken = refreshToken
  }

  private async token(): Promise<string> {
    return getAccessToken(this.clientId, this.clientSecret, this.refreshToken)
  }

  /**
   * Valida acesso a uma propriedade GA4 chamando o endpoint de metadata.
   */
  async validateProperty(
    propertyId: string
  ): Promise<{ valid: boolean; error?: string }> {
    try {
      const token = await this.token()
      const normalized = normalizePropertyId(propertyId)

      const res = await fetch(`${GA4_BASE}/${normalized}/metadata`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        const msg =
          (err as { error?: { message?: string } })?.error?.message ??
          `Propriedade não encontrada ou sem acesso (HTTP ${res.status})`
        return { valid: false, error: msg }
      }

      return { valid: true }
    } catch (err) {
      return { valid: false, error: err instanceof Error ? err.message : String(err) }
    }
  }

  /**
   * Busca o relatório de itens (produtos) de e-commerce para um período.
   */
  async getItemReport(
    propertyId: string,
    since: string,
    until: string,
    limit = 10
  ): Promise<GA4ItemRow[]> {
    const token = await this.token()
    const normalized = normalizePropertyId(propertyId)

    const body = {
      dateRanges: [{ startDate: since, endDate: until }],
      dimensions: [
        { name: 'itemName' },
        { name: 'itemCategory' },
      ],
      metrics: [
        { name: 'itemRevenue' },
        { name: 'itemsPurchased' },
      ],
      orderBys: [{ metric: { metricName: 'itemRevenue' }, desc: true }],
      limit,
    }

    const res = await fetch(`${GA4_BASE}/${normalized}:runReport`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      next: { revalidate: 0 },
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(
        `GA4 item report error ${res.status}: ${(err as { error?: { message?: string } })?.error?.message ?? res.statusText}`
      )
    }

    const json = await res.json()
    const rows = (
      json.rows ?? []
    ) as Array<{
      dimensionValues: { value: string }[]
      metricValues: { value: string }[]
    }>

    return rows.map((row) => ({
      itemName: row.dimensionValues[0].value,
      itemCategory: row.dimensionValues[1].value,
      itemRevenue: row.metricValues[0].value,
      itemsPurchased: row.metricValues[1].value,
    }))
  }

  /**
   * Busca relatório diário da propriedade GA4 para um intervalo de datas.
   */
  async getReport(
    propertyId: string,
    since: string,
    until: string
  ): Promise<GA4Row[]> {
    const token = await this.token()
    const normalized = normalizePropertyId(propertyId)

    const body = {
      dateRanges: [{ startDate: since, endDate: until }],
      dimensions: [{ name: 'date' }],
      metrics: METRIC_NAMES.map((name) => ({ name })),
      orderBys: [{ dimension: { dimensionName: 'date' } }],
      limit: 100,
    }

    const res = await fetch(`${GA4_BASE}/${normalized}:runReport`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      next: { revalidate: 0 },
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(
        `GA4 API error ${res.status}: ${(err as { error?: { message?: string } })?.error?.message ?? res.statusText}`
      )
    }

    const json = await res.json()
    const rows = (
      json.rows ?? []
    ) as Array<{
      dimensionValues: { value: string }[]
      metricValues: { value: string }[]
    }>

    return rows.map((row) => ({
      date: row.dimensionValues[0].value,
      sessions: row.metricValues[0].value,
      screenPageViews: row.metricValues[1].value,
      activeUsers: row.metricValues[2].value,
      engagementRate: row.metricValues[3].value,
      ecommercePurchases: row.metricValues[4].value,
      purchaseRevenue: row.metricValues[5].value,
      totalRevenue: row.metricValues[6].value,
      newUsers: row.metricValues[7].value,
    }))
  }
}
