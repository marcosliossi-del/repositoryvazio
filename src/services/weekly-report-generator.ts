/**
 * Weekly Report Generator
 *
 * Gera relatórios semanais automáticos via IA (Claude) para cada cliente ativo,
 * com análise de tráfego (GA4) e performance de e-commerce.
 *
 * Formato: texto corrido, pronto para enviar via WhatsApp/e-mail toda segunda-feira.
 */

import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/prisma'
import { getWeekRange, getMonthRange, formatCurrency } from '@/lib/utils'

const anthropic = new Anthropic()

function getLastWeekRange(): { start: Date; end: Date } {
  const { start } = getWeekRange()
  const end = new Date(start)
  end.setDate(end.getDate() - 1)
  end.setHours(23, 59, 59, 999)

  const startOfLastWeek = new Date(start)
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7)

  return { start: startOfLastWeek, end }
}

export async function generateWeeklyReportForClient(clientId: string): Promise<string | null> {
  const today = new Date()
  const { start: weekStart } = getWeekRange()
  const { start: monthStart } = getMonthRange(today)
  const { start: lastWeekStart, end: lastWeekEnd } = getLastWeekRange()

  const twoWeeksAgo = new Date(lastWeekStart)
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 7)

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { name: true, industry: true },
  })
  if (!client) return null

  // Snapshots da semana passada
  const [lastWeekSnaps, prevWeekSnaps, monthSnaps, goals] = await Promise.all([
    prisma.metricSnapshot.findMany({
      where: { clientId, date: { gte: lastWeekStart, lte: lastWeekEnd } },
    }),
    prisma.metricSnapshot.findMany({
      where: { clientId, date: { gte: twoWeeksAgo, lte: new Date(lastWeekStart.getTime() - 1) } },
    }),
    prisma.metricSnapshot.findMany({
      where: { clientId, date: { gte: monthStart, lte: today } },
    }),
    prisma.goal.findMany({
      where: {
        clientId,
        period: 'MONTHLY',
        startDate: { lte: today },
        endDate: { gte: monthStart },
      },
    }),
  ])

  function computeMetrics(snaps: typeof lastWeekSnaps) {
    const ga4 = snaps.filter((x) => Number(x.spend ?? 0) === 0)
    const ads = snaps.filter((x) => Number(x.spend ?? 0) > 0)
    const spend = ads.reduce((s, x) => s + Number(x.spend ?? 0), 0)
    const sessions = ga4.reduce((s, x) => s + (x.clicks ?? 0), 0)
    const purchases = snaps.reduce((s, x) => s + (x.conversions ?? 0), 0)
    const ga4Rev = ga4.reduce((s, x) => s + Number(x.conversionValue ?? 0), 0)
    const adRev = ads.reduce((s, x) => s + Number(x.conversionValue ?? 0), 0)
    const revenue = ga4Rev > 0 ? ga4Rev : adRev
    return {
      spend,
      sessions,
      purchases,
      revenue,
      roas: spend > 0 && revenue > 0 ? revenue / spend : null,
      cpa: spend > 0 && purchases > 0 ? spend / purchases : null,
      taxaConversao: sessions > 0 && purchases > 0 ? (purchases / sessions) * 100 : null,
      ticketMedio: purchases > 0 && revenue > 0 ? revenue / purchases : null,
    }
  }

  const lw = computeMetrics(lastWeekSnaps)
  const pw = computeMetrics(prevWeekSnaps)
  const month = computeMetrics(monthSnaps)

  const daysElapsed = today.getDate()
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const projecaoMes = daysElapsed > 0 && month.revenue > 0
    ? (month.revenue / daysElapsed) * daysInMonth
    : null

  // Metas mensais
  const faturamentoGoal = goals.find((g) => g.metric === 'FATURAMENTO')
  const roasGoal = goals.find((g) => g.metric === 'ROAS')
  const spendGoal = goals.find((g) => g.metric === 'SPEND' || g.metric === 'INVESTMENT')

  const pctChange = (curr: number, prev: number) =>
    prev > 0 ? ((curr - prev) / prev) * 100 : null

  const prompt = `Você é o analista de performance de uma agência de tráfego pago especializada em e-commerce.
Gere um relatório semanal profissional, objetivo e em texto corrido para ser enviado ao cliente via WhatsApp/e-mail toda segunda-feira de manhã.

DADOS DO CLIENTE:
- Nome: ${client.name}
- Segmento: ${client.industry ?? 'E-commerce'}

PERFORMANCE DA SEMANA PASSADA (${lastWeekStart.toLocaleDateString('pt-BR')} a ${lastWeekEnd.toLocaleDateString('pt-BR')}):
- Faturamento (GA4): ${lw.revenue > 0 ? formatCurrency(lw.revenue) : 'sem dados'}${pw.revenue > 0 ? ` (${pctChange(lw.revenue, pw.revenue)?.toFixed(1)}% vs. semana anterior)` : ''}
- Investimento em Anúncios: ${lw.spend > 0 ? formatCurrency(lw.spend) : 'sem dados'}
- ROAS: ${lw.roas !== null ? `${lw.roas.toFixed(2)}x` : 'sem dados'}
- Sessões (GA4): ${lw.sessions > 0 ? lw.sessions.toLocaleString('pt-BR') : 'sem dados'}
- Compras: ${lw.purchases > 0 ? lw.purchases.toLocaleString('pt-BR') : 'sem dados'}
- Taxa de Conversão: ${lw.taxaConversao !== null ? `${lw.taxaConversao.toFixed(2)}%` : 'sem dados'}
- Ticket Médio: ${lw.ticketMedio !== null ? formatCurrency(lw.ticketMedio) : 'sem dados'}
- CPA: ${lw.cpa !== null ? formatCurrency(lw.cpa) : 'sem dados'}

ACUMULADO DO MÊS:
- Faturamento acumulado: ${month.revenue > 0 ? formatCurrency(month.revenue) : 'sem dados'} (${daysElapsed} de ${daysInMonth} dias)
- Projeção para fechar o mês: ${projecaoMes !== null ? formatCurrency(projecaoMes) : 'insuficiente'}
- Investimento acumulado: ${month.spend > 0 ? formatCurrency(month.spend) : 'sem dados'}

${faturamentoGoal ? `META MENSAL DE FATURAMENTO: ${formatCurrency(Number(faturamentoGoal.targetValue))} (${month.revenue > 0 ? Math.round((month.revenue / Number(faturamentoGoal.targetValue)) * 100) : 0}% atingido até agora)` : ''}
${roasGoal ? `META DE ROAS: ${Number(roasGoal.targetValue).toFixed(2)}x` : ''}
${spendGoal ? `BUDGET MENSAL: ${formatCurrency(Number(spendGoal.targetValue))} (${month.spend > 0 ? Math.round((month.spend / Number(spendGoal.targetValue)) * 100) : 0}% consumido)` : ''}

FORMATO DO RELATÓRIO:
- Comece com uma saudação curta e o nome do cliente
- Destaque os pontos mais relevantes da semana (o que foi bom, o que precisa de atenção)
- Comente sobre o ritmo em relação à meta mensal (se existir)
- Inclua 2–3 insights práticos ou próximos passos
- Tom: profissional mas próximo, objetivo, sem jargões excessivos
- Tamanho: ideal para WhatsApp (não muito longo), máximo 350 palavras
- Use quebras de linha para facilitar leitura no WhatsApp
- NÃO use markdown (sem asteriscos, sem #, sem listas com traço)
- Use emojis com moderação para destaque visual

Gere apenas o texto do relatório, pronto para copiar e enviar.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = response.content[0]
    if (content.type !== 'text') return null

    const reportContent = content.text

    // Salva no banco
    await prisma.weeklyReport.upsert({
      where: { clientId_weekStart: { clientId, weekStart } },
      create: { clientId, weekStart, content: reportContent },
      update: { content: reportContent, generatedAt: new Date() },
    })

    return reportContent
  } catch (err) {
    console.error(`[WeeklyReport] Erro ao gerar relatório para ${clientId}:`, err)
    return null
  }
}

export async function generateAllWeeklyReports(): Promise<{
  clientsProcessed: number
  reportsGenerated: number
}> {
  const clients = await prisma.client.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true },
  })

  let reportsGenerated = 0
  for (const client of clients) {
    const report = await generateWeeklyReportForClient(client.id)
    if (report) reportsGenerated++
  }

  return { clientsProcessed: clients.length, reportsGenerated }
}
