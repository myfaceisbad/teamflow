import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const { date, declaredLevel } = await req.json()
  const targetDate = new Date(date); targetDate.setHours(0, 0, 0, 0)
  const record = await prisma.workloadRecord.upsert({
    where: { userId_date: { userId: user.id, date: targetDate } },
    update: { declaredLevel },
    create: { userId: user.id, date: targetDate, calculatedHours: 0, declaredLevel }
  })
  return NextResponse.json(record)
}
