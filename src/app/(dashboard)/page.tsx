import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Clock, ShoppingBag, FolderKanban, AlertCircle } from 'lucide-react'

const statusLabels: Record<string, string> = { TODO: '未着手', IN_PROGRESS: '進行中', IN_REVIEW: 'レビュー中', DONE: '完了', BACKLOG: 'バックログ' }
const statusColors: Record<string, string> = { TODO: 'bg-blue-100 text-blue-700', IN_PROGRESS: 'bg-yellow-100 text-yellow-700', IN_REVIEW: 'bg-purple-100 text-purple-700', DONE: 'bg-green-100 text-green-700', BACKLOG: 'bg-slate-100 text-slate-600' }

export default async function HomePage() {
  const session = await auth()
  if (!session?.user?.email) redirect('/login')
  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!dbUser) redirect('/login')

  const now = new Date()
  const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

  const [myTasks, marketplaceTasks, myProjects] = await Promise.all([
    prisma.task.findMany({ where: { assigneeId: dbUser.id, status: { not: 'DONE' } }, include: { project: true }, orderBy: { dueDate: 'asc' }, take: 5 }),
    prisma.task.findMany({ where: { isMarketplace: true, assigneeId: null }, include: { project: true }, take: 3 }),
    prisma.projectMember.findMany({ where: { userId: dbUser.id }, include: { project: { include: { tasks: true } } }, take: 4 }),
  ])

  const hour = now.getHours()
  const greeting = hour < 12 ? 'おはようございます' : hour < 18 ? 'こんにちは' : 'お疲れ様です'

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{greeting}、{dbUser.name}さん</h1>
        <p className="text-slate-500 mt-1">{now.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center"><CheckCircle2 size={20} className="text-blue-600" /></div><div><p className="text-2xl font-bold">{myTasks.length}</p><p className="text-xs text-slate-500">進行中タスク</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center"><AlertCircle size={20} className="text-orange-600" /></div><div><p className="text-2xl font-bold">{myTasks.filter(t => t.dueDate && new Date(t.dueDate) <= threeDays).length}</p><p className="text-xs text-slate-500">期限間近</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center"><ShoppingBag size={20} className="text-indigo-600" /></div><div><p className="text-2xl font-bold">{marketplaceTasks.length}</p><p className="text-xs text-slate-500">公募タスク</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center"><FolderKanban size={20} className="text-green-600" /></div><div><p className="text-2xl font-bold">{myProjects.length}</p><p className="text-xs text-slate-500">参加プロジェクト</p></div></div></CardContent></Card>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-600" />自分のタスク</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {myTasks.length === 0 ? <p className="text-sm text-slate-400 py-4 text-center">タスクはありません</p> : myTasks.map(task => (
              <div key={task.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50">
                <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{task.title}</p><p className="text-xs text-slate-400">{task.project.name}</p></div>
                <Badge className={`text-xs ${statusColors[task.status] ?? ''}`} variant="secondary">{statusLabels[task.status] ?? task.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><ShoppingBag size={16} className="text-indigo-600" />新着公募タスク</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {marketplaceTasks.map(task => (
              <div key={task.id} className="p-2 rounded-lg hover:bg-slate-50 border border-indigo-100">
                <p className="text-sm font-medium">{task.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-slate-400">{task.project.name}</p>
                  {task.estimatedHours && <Badge variant="secondary" className="text-xs"><Clock size={10} className="mr-1" />{task.estimatedHours}h</Badge>}
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full mt-2" asChild><Link href="/marketplace">すべて見る</Link></Button>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><FolderKanban size={16} className="text-green-600" />参加プロジェクト</CardTitle></CardHeader>
        <CardContent><div className="grid grid-cols-2 gap-3">
          {myProjects.map(({ project }) => {
            const total = project.tasks.length; const done = project.tasks.filter(t => t.status === 'DONE').length
            const progress = total > 0 ? Math.round((done / total) * 100) : 0
            return (
              <Link key={project.id} href={`/projects/${project.id}/board`}>
                <div className="p-3 rounded-lg border hover:border-indigo-300 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2 mb-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} /><p className="text-sm font-medium">{project.name}</p></div>
                  <div className="flex items-center gap-2"><div className="flex-1 h-1.5 bg-slate-200 rounded-full"><div className="h-full bg-indigo-500 rounded-full" style={{ width: `${progress}%` }} /></div><span className="text-xs text-slate-400">{progress}%</span></div>
                  <p className="text-xs text-slate-400 mt-1">{done}/{total} タスク完了</p>
                </div>
              </Link>
            )
          })}
        </div></CardContent>
      </Card>
    </div>
  )
}
