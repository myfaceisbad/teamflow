import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const userCount = await prisma.user.count()
    const taskCount = await prisma.task.count()
    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      users: userCount,
      tasks: taskCount,
      cwd: process.cwd(),
      dbUrl: process.env.DATABASE_URL || '(not set)',
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      stack: error.stack,
    }, { status: 500 })
  }
}
