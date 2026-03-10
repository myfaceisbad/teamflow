import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Users, CheckCircle2, Clock } from 'lucide-react'

export default async function ReportsPage() {
  const session = await auth(); if (!session?.user?.email) redirect('/login')
  const [projects, users, tasks, checkins] = await Promise.all([
    prisma.project.findMany({ include: { tasks: true } }),
    prisma.user.findMany({ include: { assignedTasks: { where: { status: { not: 'DONE' } } } } }),
    prisma.task.findMany(),
    prisma.wellbeingCheckin.findMany({ orderBy: { weekStart: 'desc' }, take: 20 })
  ])
  const totalTasks = tasks.length; const doneTasks = tasks.filter(t => t.status === 'DONE').length
  const avgStress = checkins.length > 0 ? (checkins.reduce((s, c) => s + c.stressLevel, 0) / checkins.length).toFixed(1) : '—'
  const avgSatisfaction = checkins.length > 0 ? (checkins.reduce((s, c) => s + c.satisfactionLevel, 0) / checkins.length).toFixed(1) : '—'
  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="text-indigo-600" />レポート</h1>
      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="pt-4 text-center"><p className="text-3xl font-bold text-indigo-600">{totalTasks}</p><p className="text-xs text-slate-500">全タスク</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-3xl font-bold text-green-600">{doneTasks}</p><p className="text-xs text-slate-500">完了タスク</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-3xl font-bold text-orange-600">{avgStress}</p><p className="text-xs text-slate-500">平均ストレス</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-3xl font-bold text-blue-600">{avgSatisfaction}</p><p className="text-xs text-slate-500">平均満足度</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle className="text-base">プロジェクト進捗</CardTitle></CardHeader>
        <CardContent><div className="space-y-3">{projects.map(p => {
          const total = p.tasks.length; const done = p.tasks.filter(t => t.status === 'DONE').length; const pct = total > 0 ? Math.round((done / total) * 100) : 0
          return (<div key={p.id} className="flex items-center gap-3"><div className="w-3 h-3 rounded-full" style={{backgroundColor:p.color}} /><span className="text-sm font-medium w-48">{p.name}</span><div className="flex-1 h-2 bg-slate-200 rounded-full"><div className="h-full rounded-full" style={{width:`${pct}%`,backgroundColor:p.color}} /></div><span className="text-xs text-slate-500 w-16 text-right">{done}/{total} ({pct}%)</span></div>)
        })}</div></CardContent>
      </Card>
      <Card><CardHeader><CardTitle className="text-base">メンバー負荷一覧</CardTitle></CardHeader>
        <CardContent><div className="space-y-2">{users.map(u => {
          const hours = u.assignedTasks.reduce((s, t) => s + (t.estimatedHours ?? 0), 0); const pct = Math.round((hours / u.capacityHours) * 100)
          return (<div key={u.id} className="flex items-center gap-3"><span className="text-sm w-24">{u.name}</span><div className="flex-1 h-2 bg-slate-200 rounded-full"><div className={`h-full rounded-full ${pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{width:`${Math.min(pct,100)}%`}} /></div><span className="text-xs text-slate-500 w-20 text-right">{hours}h / {u.capacityHours}h ({pct}%)</span></div>)
        })}</div></CardContent>
      </Card>
    </div>
  )
}
