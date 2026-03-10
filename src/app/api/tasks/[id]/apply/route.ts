import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateMatchScore } from '@/lib/matching'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { skills: true, assignedTasks: { where: { status: { not: 'DONE' } } } } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const { id: taskId } = await params
  const task = await prisma.task.findUnique({ where: { id: taskId } })
  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  const body = await req.json()
  const requiredSkills = JSON.parse(task.requiredSkills || '[]')
  const totalHours = user.assignedTasks.reduce((s, t) => s + (t.estimatedHours ?? 0), 0)
  const utilization = Math.round((totalHours / user.capacityHours) * 100)
  const { score } = calculateMatchScore(user.skills, requiredSkills, utilization)
  const application = await prisma.taskApplication.create({
    data: { taskId, applicantId: user.id, desireLevel: body.desireLevel, confidenceLevel: body.confidenceLevel, message: body.message, aiMatchScore: score / 100 },
    include: { applicant: { include: { skills: true } } }
  })
  return NextResponse.json(application)
}
