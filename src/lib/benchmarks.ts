/**
 * Benchmarks de mercado para e-commerce (Brasil)
 * e sugestões de melhoria por KPI.
 */

export type BenchmarkLevel = 'otimo' | 'medio' | 'baixo' | 'critico'

export interface BenchmarkResult {
  level: BenchmarkLevel
  label: string
  color: string
  description: string
}

// ── CPS — Custo por Sessão (menor = melhor) ───────────────────────────────────
export function classifyCPS(cps: number): BenchmarkResult {
  if (cps <= 0.35) return { level: 'otimo',   label: 'Ótimo',   color: '#22C55E', description: `R$${cps.toFixed(2)} — abaixo da média de mercado` }
  if (cps <= 0.58) return { level: 'medio',   label: 'Médio',   color: '#EAB308', description: `R$${cps.toFixed(2)} — dentro da média de mercado` }
  if (cps <= 0.75) return { level: 'baixo',   label: 'Alto',    color: '#F97316', description: `R$${cps.toFixed(2)} — acima da média, precisa atenção` }
  return                  { level: 'critico', label: 'Crítico', color: '#EF4444', description: `R$${cps.toFixed(2)} — muito acima da média de mercado` }
}

// ── Taxa de Conversão (maior = melhor) ────────────────────────────────────────
export function classifyTaxaConversao(taxa: number): BenchmarkResult {
  if (taxa >= 1.5) return { level: 'otimo',   label: 'Ótimo',   color: '#22C55E', description: `${taxa.toFixed(2)}% — acima da média de mercado` }
  if (taxa >= 1.0) return { level: 'medio',   label: 'Médio',   color: '#EAB308', description: `${taxa.toFixed(2)}% — dentro da média de mercado` }
  if (taxa >= 0.5) return { level: 'baixo',   label: 'Baixo',   color: '#F97316', description: `${taxa.toFixed(2)}% — abaixo da média, precisa atenção` }
  return                  { level: 'critico', label: 'Crítico', color: '#EF4444', description: `${taxa.toFixed(2)}% — muito abaixo da média de mercado` }
}

// ── Sugestões de melhoria por KPI ─────────────────────────────────────────────

export const CPS_IMPROVEMENTS = [
  { rank: 1, action: 'Criativo',             detail: 'Testar novos criativos com maior CTR para reduzir custo por clique' },
  { rank: 2, action: 'Copy',                 detail: 'Revisar títulos e descrições dos anúncios para aumentar relevância' },
  { rank: 3, action: 'Produto',              detail: 'Destacar produtos com maior demanda e menor custo de tráfego' },
  { rank: 4, action: 'Oferta',               detail: 'Testar ofertas mais atrativas para melhorar CTR e reduzir CPS' },
  { rank: 5, action: 'Otimização',           detail: 'Ajustar segmentação e lances nas campanhas' },
  { rank: 6, action: 'Qualidade da Página',  detail: 'Melhorar score de qualidade das landing pages' },
  { rank: 7, action: 'Número de Eventos',    detail: 'Aumentar eventos rastreados para melhorar otimização do pixel' },
]

export const TAXA_CONVERSAO_IMPROVEMENTS = [
  { rank: 1, action: 'Página do Produto',         detail: 'Melhorar fotos, descrição e provas sociais na página' },
  { rank: 2, action: 'Objeções',                  detail: 'Identificar e quebrar as principais objeções de compra' },
  { rank: 3, action: 'Gatilhos',                  detail: 'Adicionar urgência, escassez e prova social' },
  { rank: 4, action: 'Oferta (Preço/Frete/Prazo)', detail: 'Revisar preço, frete e prazo de entrega frente à concorrência' },
  { rank: 5, action: 'UX',                        detail: 'Simplificar navegação e reduzir fricção no fluxo de compra' },
  { rank: 6, action: 'Checkout',                  detail: 'Reduzir abandono com checkout simplificado e 1 clique' },
  { rank: 7, action: 'Velocidade do Site',         detail: 'Otimizar tempo de carregamento — cada 1s a mais reduz conversão' },
]

export const TICKET_MEDIO_IMPROVEMENTS = [
  { rank: 1, action: 'Frete fixo acima de X',      detail: 'Definir frete fixo atrativo para pedidos maiores' },
  { rank: 2, action: 'Frete grátis acima de X',    detail: 'Oferecer frete grátis para pedidos acima de um valor mínimo' },
  { rank: 3, action: 'Cupom progressivo',          detail: 'Desconto maior quanto maior o valor do carrinho' },
  { rank: 4, action: 'Produtos relacionados',      detail: 'Exibir sugestões de produtos complementares no carrinho' },
  { rank: 5, action: 'Compre 2, Leve 3',           detail: 'Promoções de kit para aumentar itens por pedido' },
  { rank: 6, action: 'Público de retenção',        detail: 'Campanhas para recompra de clientes com maior LTV' },
  { rank: 7, action: 'Canal com maior TM',         detail: 'Identificar e escalar o canal de aquisição com maior ticket médio' },
]
