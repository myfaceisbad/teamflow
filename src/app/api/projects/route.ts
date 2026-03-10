import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  const members = await prisma.projectMember.findMany({
    where: { userId: user.id },
    include: { project: { include: { tasks: true, members: { include: { user: true } } } } }
  })
  return NextResponse.json(members.map(m => m.project))
}
