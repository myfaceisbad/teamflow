'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { WorkloadHeatmap } from '@/components/workload/WorkloadHeatmap'
import { WorkloadBarChart } from '@/components/workload/WorkloadBarChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, AlertTriangle, TrendingUp, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function WorkloadPage() {
  const { data: session } = useSession()
  const [weekOffset, setWeekOffset] = useState(0)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/workload?week=${weekOffset}`)
    const d = await res.json(); setData(d)
    if (d.users && session?.user?.name) { const u = d.users.find((u: any) => u.userName === session.user?.name); if (u) setCurrentUserId(u.userId) }
    setLoading(false)
  }, [weekOffset, session])

  useEffect(() => { fetchData() }, [fetchData])

  const overloaded = data?.users?.filter((u: any) => u.weeklyUtilization >= 100) ?? []
  const avg = data?.users?.length ? Math.round(data.users.reduce((s: number, u: any) => s + u.weeklyUtilization, 0) / data.users.length) : 0

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">チームワークロード</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setWeekOffset(w => w - 1)}><ChevronLeft size={16} /></Button>
          <span className="text-sm font-medium w-16 text-center">{weekOffset === 0 ? '今週' : weekOffset === -1 ? '先週' : weekOffset === 1 ? '来週' : `${weekOffset > 0 ? '+' : ''}${weekOffset}週`}</span>
          <Button variant="outline" size="icon" onClick={() => setWeekOffset(w => w + 1)}><ChevronRight size={16} /></Button>
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)}>今週</Button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center"><Users size={20} className="text-indigo-600" /></div><div><p className="text-2xl font-bold">{data?.users?.length ?? 0}</p><p className="text-xs text-slate-500">チームメンバー</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-lg flex items-center justify-center ${avg >= 100 ? 'bg-red-50' : avg >= 80 ? 'bg-yellow-50' : 'bg-green-50'}`}><TrendingUp size={20} className={avg >= 100 ? 'text-red-600' : avg >= 80 ? 'text-yellow-600' : 'text-green-600'} /></div><div><p className="text-2xl font-bold">{avg}%</p><p className="text-xs text-slate-500">平均稼働率</p></div></div></CardContent></Card>
        <Card className={overloaded.length > 0 ? 'border-red-200 bg-red-50' : ''}><CardContent className="pt-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center"><AlertTriangle size={20} className={overloaded.length > 0 ? 'text-red-600' : 'text-slate-400'} /></div><div><p className="text-2xl font-bold">{overloaded.length}</p><p className="text-xs text-slate-500">過負荷メンバー</p></div></div>{overloaded.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{overloaded.map((u: any) => <Badge key={u.userId} variant="destructive" className="text-xs">{u.userName}</Badge>)}</div>}</CardContent></Card>
      </div>
      {loading ? <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div> : <>
        <Card><CardHeader className="pb-2"><CardTitle className="text-base">負荷ヒートマップ</CardTitle><p className="text-xs text-slate-500">今日のセルをクリックして体感負荷を申告</p></CardHeader><CardContent>{data && <WorkloadHeatmap weekDates={data.weekDates} users={data.users} currentUserId={currentUserId} onRefresh={fetchData} />}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-base">週間稼働時間</CardTitle></CardHeader><CardContent>{data && <WorkloadBarChart users={data.users} />}</CardContent></Card>
      </>}
    </div>
  )
}
