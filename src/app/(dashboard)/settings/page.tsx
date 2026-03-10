import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Settings, Star, TrendingUp } from 'lucide-react'

export default async function SettingsPage() {
  const session = await auth(); if (!session?.user?.email) redirect('/login')
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { skills: { orderBy: { level: 'desc' } } } })
  if (!user) redirect('/login')
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Settings className="text-slate-600" />設定</h1>
      <Card><CardHeader><CardTitle className="text-base">プロフィール</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-slate-500">名前:</span> <span className="font-medium">{user.name}</span></div>
            <div><span className="text-slate-500">メール:</span> <span>{user.email}</span></div>
            <div><span className="text-slate-500">ロール:</span> <Badge variant="secondary">{user.role === 'ADMIN' ? '管理者' : user.role === 'MANAGER' ? 'マネージャー' : 'メンバー'}</Badge></div>
            <div><span className="text-slate-500">週キャパシティ:</span> <span>{user.capacityHours}h/週</span></div>
          </div>
        </CardContent>
      </Card>
      <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><Star size={16} className="text-yellow-500" />スキルプロファイル</CardTitle></CardHeader>
        <CardContent>
          {user.skills.length === 0 ? <p className="text-sm text-slate-400">スキルが登録されていません</p> :
          <div className="space-y-2">{user.skills.map(skill => (
            <div key={skill.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
              <span className="text-sm font-medium w-32">{skill.skillName}</span>
              <div className="flex gap-1">{[1,2,3,4,5].map(n => <div key={n} className={`w-5 h-5 rounded flex items-center justify-center text-xs ${n <= skill.level ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400'}`}>{n}</div>)}</div>
              <Badge variant="secondary" className="text-xs">{skill.category === 'technical' ? '技術' : 'ビジネス'}</Badge>
              {skill.isGrowthTarget && <Badge className="text-xs bg-green-100 text-green-700"><TrendingUp size={10} className="mr-1" />成長目標</Badge>}
            </div>
          ))}</div>}
        </CardContent>
      </Card>
    </div>
  )
}
