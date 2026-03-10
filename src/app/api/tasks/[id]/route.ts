import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const updateData: any = {}
  if (body.title !== undefined) updateData.title = body.title
  if (body.description !== undefined) updateData.description = body.description
  if (body.status !== undefined) { updateData.status = body.status; if (body.status === 'DONE') updateData.completedAt = new Date() }
  if (body.priority !== undefined) updateData.priority = body.priority
  if (body.assigneeId !== undefined) updateData.assigneeId = body.assigneeId
  if (body.dueDate !== undefined) updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null
  if (body.estimatedHours !== undefined) updateData.estimatedHours = body.estimatedHours ? parseFloat(body.estimatedHours) : null
  if (body.isMarketplace !== undefined) updateData.isMarketplace = body.isMarketplace
  if (body.order !== undefined) updateData.order = body.order
  const task = await prisma.task.update({ where: { id }, data: updateData, include: { assignee: true, creator: true, project: true } })
  return NextResponse.json(task)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await prisma.task.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
