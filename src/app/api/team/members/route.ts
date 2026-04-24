import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const users = await prisma.user.findMany({
    where:   { active: true },
    select:  { id: true, name: true, role: true, avatarUrl: true },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(users)
}
