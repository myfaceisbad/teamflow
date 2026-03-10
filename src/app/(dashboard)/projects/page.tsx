import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FolderKanban, Users, CheckCircle2 } from 'lucide-react'

export default async function ProjectsPage() {
  const session = await auth()
  if (!session?.user?.email) redirect('/login')
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) redirect('/login')
  const members = await prisma.projectMember.findMany({
    where: { userId: user.id },
    include: { project: { include: { tasks: true, members: { include: { user: true } } } } }
  })
  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-bold text-slate-900">プロジェクト</h1>
      <div className="grid grid-cols-2 gap-4">
        {members.map(({ project }) => {
          const total = project.tasks.length
          const done = project.tasks.filter(t => t.status === 'DONE').length
          const inProgress = project.tasks.filter(t => t.status === 'IN_PROGRESS').length
          const progress = total > 0 ? Math.round((done / total) * 100) : 0
          return (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: project.color }} />
                  <CardTitle className="text-base">{project.name}</CardTitle>
                </div>
                {project.description && <p className="text-sm text-slate-500 mt-1">{project.description}</p>}
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1"><span>進捗</span><span>{done}/{total}</span></div>
                  <div className="h-2 bg-slate-200 rounded-full"><div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: project.color }} /></div>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500" />{done} 完了</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-400 rounded-full" />{inProgress} 進行中</span>
                  <span className="flex items-center gap-1"><Users size={12} />{project.members.length} 名</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" asChild className="flex-1"><Link href={`/projects/${project.id}/board`}><FolderKanban size={14} className="mr-1" />カンバン</Link></Button>
                  <Button size="sm" variant="outline" asChild className="flex-1"><Link href={`/projects/${project.id}/list`}>リスト</Link></Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
