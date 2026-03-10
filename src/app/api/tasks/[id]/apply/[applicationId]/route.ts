import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; applicationId: string }> }) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id: taskId, applicationId } = await params
  const body = await req.json()
  const app = await prisma.taskApplication.update({
    where: { id: applicationId }, data: { status: body.status, reviewNote: body.reviewNote, reviewedAt: new Date(), reviewedById: session.user.email }
  })
  if (body.status === 'APPROVED') {
    await prisma.task.update({ where: { id: taskId }, data: { assigneeId: app.applicantId, isMarketplace: false } })
    await prisma.taskApplication.updateMany({ where: { taskId, id: { not: applicationId } }, data: { status: 'REJECTED' } })
  }
  return NextResponse.json(app)
}
