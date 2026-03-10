import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const tasks = await prisma.task.findMany({
    where: projectId ? { projectId } : {},
    include: { assignee: true, creator: true, project: true, _count: { select: { comments: true, subtasks: true } } },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }]
  })
  return NextResponse.json(tasks)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  const body = await req.json()
  const task = await prisma.task.create({
    data: {
      title: body.title, description: body.description, status: body.status ?? 'TODO',
      priority: body.priority ?? 'MEDIUM', projectId: body.projectId, assigneeId: body.assigneeId ?? null,
      creatorId: user.id, dueDate: body.dueDate ? new Date(body.dueDate) : null,
      estimatedHours: body.estimatedHours ? parseFloat(body.estimatedHours) : null,
      requiredSkills: JSON.stringify(body.requiredSkills ?? []), isMarketplace: body.isMarketplace ?? false,
    },
    include: { assignee: true, creator: true, project: true }
  })
  return NextResponse.json(task)
}
