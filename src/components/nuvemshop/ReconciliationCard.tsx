'use client'

import { useState, useEffect } from 'react'

interface DailyReconciliation {
  date: string
  nuvemshop: { revenue: number; orders: number; avgTicket: number }
  ga4: { revenue: number; transactions: number; avgTicket: number }
  discrepancy: {
    revenueDiff: number
    revenuePct: number
    ordersDiff: number
    ordersPct: number
    status: 'ok' | 'warning' | 'critical'
  }
}

interface ReconciliationData {
  period: { since: string; until: string }
  totals: {
    nuvemshopRevenue: number
    ga4Revenue: number
    revenueDiff: number
    revenueDiffPct: number
    nuvemshopOrders: number
    ga4Transactions: number
    ordersDiff: number
    ordersDiffPct: number
  }
  daily: DailyReconciliation[]
  unmatchedOrders: {
    withoutUtm: number
    withUtm: number
    total: number
  }
  overallStatus: 'ok' | 'warning' | 'critical'
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function formatPct(value: number): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

function statusColor(status: 'ok' | 'warning' | 'critical'): string {
  switch (status) {
    case 'ok': return '#22C55E'
    case 'warning': return '#EAB308'
    case 'critical': return '#EF4444'
  }
}

function statusLabel(status: 'ok' | 'warning' | 'critical'): string {
  switch (status) {
    case 'ok': return 'Dados consistentes'
    case 'warning': return 'Divergência moderada'
    case 'critical': return 'Divergência crítica'
  }
}

export function ReconciliationCard({ clientId }: { clientId: string }) {
  const [data, setData] = useState<ReconciliationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const res = await fetch(`/api/nuvemshop/reconciliation?clientId=${clientId}`)
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Erro ao buscar reconciliação')
        }
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [clientId])

  if (loading) {
    return (
      <div
        style={{
          background: '#0A1E2C',
          border: '1px solid #38435C',
          borderRadius: 12,
          padding: 24,
        }}
      >
        <p style={{ color: '#87919E' }}>Carregando reconciliação...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div
        style={{
          background: '#0A1E2C',
          border: '1px solid #38435C',
          borderRadius: 12,
          padding: 24,
        }}
      >
        <p style={{ color: '#EF4444' }}>{error ?? 'Sem dados de reconciliação'}</p>
      </div>
    )
  }

  const { totals, daily, unmatchedOrders, overallStatus } = data

  return (
    <div
      style={{
        background: '#0A1E2C',
        border: '1px solid #38435C',
        borderRadius: 12,
        padding: 24,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <div>
          <h3 style={{ color: '#EBEBEB', fontSize: 16, fontWeight: 600, margin: 0 }}>
            Reconciliação Nuvemshop vs GA4
          </h3>
          <p style={{ color: '#87919E', fontSize: 13, marginTop: 4 }}>
            {data.period.since} — {data.period.until}
          </p>
        </div>
        <span
          style={{
            background: statusColor(overallStatus) + '20',
            color: statusColor(overallStatus),
            padding: '4px 12px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {statusLabel(overallStatus)}
        </span>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <div style={{ background: '#05141C', borderRadius: 8, padding: 16 }}>
          <p style={{ color: '#87919E', fontSize: 11, marginBottom: 4 }}>Receita Nuvemshop</p>
          <p style={{ color: '#EBEBEB', fontSize: 18, fontWeight: 700 }}>
            {formatCurrency(totals.nuvemshopRevenue)}
          </p>
        </div>
        <div style={{ background: '#05141C', borderRadius: 8, padding: 16 }}>
          <p style={{ color: '#87919E', fontSize: 11, marginBottom: 4 }}>Receita GA4</p>
          <p style={{ color: '#EBEBEB', fontSize: 18, fontWeight: 700 }}>
            {formatCurrency(totals.ga4Revenue)}
          </p>
        </div>
        <div style={{ background: '#05141C', borderRadius: 8, padding: 16 }}>
          <p style={{ color: '#87919E', fontSize: 11, marginBottom: 4 }}>Diferença</p>
          <p
            style={{
              color: statusColor(overallStatus),
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            {formatCurrency(totals.revenueDiff)}
          </p>
          <p style={{ color: statusColor(overallStatus), fontSize: 12 }}>
            {formatPct(totals.revenueDiffPct)}
          </p>
        </div>
        <div style={{ background: '#05141C', borderRadius: 8, padding: 16 }}>
          <p style={{ color: '#87919E', fontSize: 11, marginBottom: 4 }}>Sem Tracking</p>
          <p style={{ color: '#EAB308', fontSize: 18, fontWeight: 700 }}>
            {unmatchedOrders.withoutUtm}
          </p>
          <p style={{ color: '#87919E', fontSize: 12 }}>
            de {unmatchedOrders.total} pedidos
          </p>
        </div>
      </div>

      {/* Orders Summary */}
      <div
        style={{
          display: 'flex',
          gap: 24,
          marginBottom: 20,
          padding: 16,
          background: '#05141C',
          borderRadius: 8,
        }}
      >
        <div>
          <p style={{ color: '#87919E', fontSize: 11 }}>Pedidos Nuvemshop</p>
          <p style={{ color: '#EBEBEB', fontSize: 24, fontWeight: 700 }}>
            {totals.nuvemshopOrders}
          </p>
        </div>
        <div style={{ borderLeft: '1px solid #38435C', paddingLeft: 24 }}>
          <p style={{ color: '#87919E', fontSize: 11 }}>Transações GA4</p>
          <p style={{ color: '#EBEBEB', fontSize: 24, fontWeight: 700 }}>
            {totals.ga4Transactions}
          </p>
        </div>
        <div style={{ borderLeft: '1px solid #38435C', paddingLeft: 24 }}>
          <p style={{ color: '#87919E', fontSize: 11 }}>Diferença Pedidos</p>
          <p
            style={{
              color: totals.ordersDiff === 0 ? '#22C55E' : '#EAB308',
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            {totals.ordersDiff > 0 ? '+' : ''}{totals.ordersDiff}
          </p>
        </div>
      </div>

      {/* Daily Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #38435C' }}>
              <th style={{ color: '#87919E', padding: '8px 12px', textAlign: 'left', fontWeight: 500 }}>Data</th>
              <th style={{ color: '#87919E', padding: '8px 12px', textAlign: 'right', fontWeight: 500 }}>NS Receita</th>
              <th style={{ color: '#87919E', padding: '8px 12px', textAlign: 'right', fontWeight: 500 }}>GA4 Receita</th>
              <th style={{ color: '#87919E', padding: '8px 12px', textAlign: 'right', fontWeight: 500 }}>Diff</th>
              <th style={{ color: '#87919E', padding: '8px 12px', textAlign: 'center', fontWeight: 500 }}>NS Pedidos</th>
              <th style={{ color: '#87919E', padding: '8px 12px', textAlign: 'center', fontWeight: 500 }}>GA4 Trans.</th>
              <th style={{ color: '#87919E', padding: '8px 12px', textAlign: 'center', fontWeight: 500 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {daily.map((day) => (
              <tr key={day.date} style={{ borderBottom: '1px solid #1a2b3c' }}>
                <td style={{ color: '#EBEBEB', padding: '8px 12px' }}>
                  {new Date(day.date + 'T12:00:00').toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                  })}
                </td>
                <td style={{ color: '#EBEBEB', padding: '8px 12px', textAlign: 'right' }}>
                  {formatCurrency(day.nuvemshop.revenue)}
                </td>
                <td style={{ color: '#EBEBEB', padding: '8px 12px', textAlign: 'right' }}>
                  {formatCurrency(day.ga4.revenue)}
                </td>
                <td
                  style={{
                    color: statusColor(day.discrepancy.status),
                    padding: '8px 12px',
                    textAlign: 'right',
                    fontWeight: 600,
                  }}
                >
                  {formatPct(day.discrepancy.revenuePct)}
                </td>
                <td style={{ color: '#EBEBEB', padding: '8px 12px', textAlign: 'center' }}>
                  {day.nuvemshop.orders}
                </td>
                <td style={{ color: '#EBEBEB', padding: '8px 12px', textAlign: 'center' }}>
                  {day.ga4.transactions}
                </td>
                <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: statusColor(day.discrepancy.status),
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
