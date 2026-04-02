import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { sendDailyDigest } from '@/services/notifications/daily-digest'

/**
 * POST /api/whatsapp/test-digest
 * Admin only — dispara o digest manualmente para testar.
 */
export async function POST() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const debug = {
    ZAPI_INSTANCE_ID: !!process.env.ZAPI_INSTANCE_ID,
    ZAPI_TOKEN: !!process.env.ZAPI_TOKEN,
    WHATSAPP_GROUP_ID: !!process.env.WHATSAPP_GROUP_ID,
    WHATSAPP_NOTIFY_NUMBERS: !!process.env.WHATSAPP_NOTIFY_NUMBERS,
  }
  const result = await sendDailyDigest()
  return NextResponse.json({ ...result, debug })
}
