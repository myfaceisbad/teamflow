import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getWeekDates, calculateDailyHours } from '@/lib/workload'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const weekOffset = parseInt(searchParams.get('week') ?? '0')
  const weekDates = getWeekDates(weekOffset)

  const users = await prisma.user.findMany({
    include: {
      assignedTasks: { where: { status: { not: 'DONE' } } },
      workloadRecords: { where: { date: { gte: weekDates[0], lte: weekDates[6] } } }
    }
  })

  const data = users.map(user => {
    const dailyData = weekDates.map(date => {
      const hours = calculateDailyHours(user.assignedTasks, date)
      const cap = user.capacityHours / 5
      const record = user.workloadRecords.find(r => new Date(r.date).toISOString().split('T')[0] === date.toISOString().split('T')[0])
      return { date: date.toISOString().split('T')[0], calculatedHours: hours, declaredLevel: record?.declaredLevel ?? null, utilizationRate: cap > 0 ? Math.round((hours / cap) * 100) : 0, dailyCapacity: cap }
    })
    const weeklyHours = dailyData.reduce((s, d) => s + d.calculatedHours, 0)
    return { userId: user.id, userName: user.name, role: user.role, capacityHours: user.capacityHours, weeklyHours: Math.round(weeklyHours * 10) / 10, weeklyUtilization: Math.round((weeklyHours / user.capacityHours) * 100), dailyData }
  })

  return NextResponse.json({ weekDates: weekDates.map(d => d.toISOString().split('T')[0]), users: data })
}
