import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const tasks = await prisma.task.findMany({
    where: { isMarketplace: true, assigneeId: null },
    include: { project: true, creator: true, applications: { include: { applicant: true } }, _count: { select: { applications: true } } },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(tasks)
}
