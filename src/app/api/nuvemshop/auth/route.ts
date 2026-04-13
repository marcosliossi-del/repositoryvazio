import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getNuvemshopAuthUrl } from '@/services/nuvemshop/client'

/**
 * GET /api/nuvemshop/auth?clientId=xxx
 *
 * Inicia o fluxo OAuth da Nuvemshop.
 * Redireciona o usuário para a tela de autorização do app na Nuvemshop.
 *
 * O `clientId` do Performli é passado no state para vincular a loja após callback.
 */
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const clientId = request.nextUrl.searchParams.get('clientId')
  if (!clientId) {
    return NextResponse.json(
      { error: 'clientId é obrigatório' },
      { status: 400 }
    )
  }

  try {
    // Encode state com clientId e userId para usar no callback
    const state = Buffer.from(
      JSON.stringify({ clientId, userId: session.userId })
    ).toString('base64url')

    const authUrl = getNuvemshopAuthUrl(state)
    return NextResponse.redirect(authUrl)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
