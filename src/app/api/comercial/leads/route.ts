import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { z } from 'zod'

const createSchema = z.object({
  name:            z.string().min(1),
  email:           z.string().email().optional().or(z.literal('')),
  phone:           z.string().optional(),
  company:         z.string().optional(),
  source:          z.string().optional(),
  value:           z.number().positive().optional(),
  probability:     z.number().min(0).max(100).optional(),
  expectedCloseAt: z.string().optional(),
  notes:           z.string().optional(),
})

/** GET /api/comercial/leads — list all active leads */
export async function GET(_request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const leads = await prisma.agencyLead.findMany({
    where: { deletedAt: null },
    include: {
      activities: {
        orderBy: { occurredAt: 'desc' },
        take: 1,
        include: { user: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(leads)
}

/** POST /api/comercial/leads — create a new lead */
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { name, email, phone, company, source, value, probability, expectedCloseAt, notes } = parsed.data

  const lead = await prisma.agencyLead.create({
    data: {
      name,
      email:           email || null,
      phone:           phone || null,
      company:         company || null,
      source:          source || null,
      value:           value ?? null,
      probability:     probability ?? null,
      expectedCloseAt: expectedCloseAt ? new Date(expectedCloseAt) : null,
      notes:           notes || null,
    },
    include: { activities: true },
  })

  // Log activity
  await prisma.agencyActivity.create({
    data: {
      type:   'NOTA',
      title:  'Lead criado',
      body:   `Lead ${name} adicionado ao pipeline`,
      userId: session.userId,
      leadId: lead.id,
    },
  })

  return NextResponse.json(lead, { status: 201 })
}
