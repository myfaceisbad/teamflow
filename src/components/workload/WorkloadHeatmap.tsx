'use client'
import { useState } from 'react'
import { getHeatmapColor } from '@/lib/workload'
import { toast } from 'sonner'

const DAY_LABELS = ['月', '火', '水', '木', '金', '土', '日']
const EMOJIS = ['😌', '🙂', '😐', '😓', '😤']

interface Props {
  weekDates: string[]
  users: Array<{ userId: string; userName: string; role: string; weeklyHours: number; weeklyUtilization: number; dailyData: Array<{ date: string; calculatedHours: number; declaredLevel: number | null; utilizationRate: number; dailyCapacity: number }> }>
  currentUserId: string
  onRefresh: () => void
}

export function WorkloadHeatmap({ weekDates, users, currentUserId, onRefresh }: Props) {
  const [declaringDate, setDeclaringDate] = useState<string | null>(null)
  const today = new Date().toISOString().split('T')[0]

  const handleDeclare = async (date: string, level: number) => {
    await fetch('/api/workload/declare', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date, declaredLevel: level }) })
    toast.success('体感負荷を記録しました')
    setDeclaringDate(null); onRefresh()
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead><tr>
          <th className="text-left p-2 text-sm font-medium text-slate-600 w-32">メンバー</th>
          {weekDates.map((d, i) => <th key={d} className={`p-2 text-center text-xs font-medium w-16 ${d === today ? 'text-indigo-600 font-bold' : 'text-slate-600'}`}><div>{DAY_LABELS[i]}</div><div className="font-normal text-slate-400">{d.slice(5).replace('-', '/')}</div></th>)}
          <th className="p-2 text-center text-xs font-medium text-slate-600 w-20">週合計</th>
        </tr></thead>
        <tbody>{users.map(user => (
          <tr key={user.userId}>
            <td className="p-2"><div className="text-sm font-medium">{user.userName}</div><div className="text-xs text-slate-400">{user.role === 'MANAGER' ? 'マネージャー' : user.role === 'ADMIN' ? '管理者' : 'メンバー'}</div></td>
            {user.dailyData.map(day => {
              const isToday = day.date === today; const isCurrent = user.userId === currentUserId
              return (
                <td key={day.date} className="p-1 relative">
                  <div className={`h-12 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all ${isToday && isCurrent ? 'ring-2 ring-indigo-300' : ''}`}
                    style={{ backgroundColor: getHeatmapColor(day.utilizationRate) }}
                    onClick={() => isCurrent && isToday ? setDeclaringDate(declaringDate === day.date ? null : day.date) : null}
                    title={`${day.calculatedHours}h / ${day.dailyCapacity}h (${day.utilizationRate}%)`}>
                    <span className="text-xs font-bold">{day.utilizationRate}%</span>
                    <span className="text-xs text-slate-500">{day.calculatedHours}h</span>
                    {day.declaredLevel !== null && <span className="absolute -top-1 -right-1 text-xs">{EMOJIS[day.declaredLevel - 1]}</span>}
                  </div>
                  {declaringDate === day.date && isCurrent && (
                    <div className="absolute z-10 bg-white border rounded-lg shadow-lg p-2 flex gap-1 mt-1 left-0">
                      {EMOJIS.map((e, i) => <button key={i} onClick={() => handleDeclare(day.date, i + 1)} className="text-lg hover:scale-125 transition-transform p-1">{e}</button>)}
                    </div>
                  )}
                </td>
              )
            })}
            <td className="p-2 text-center">
              <div className={`inline-flex flex-col items-center px-2 py-1 rounded-lg text-xs font-medium ${user.weeklyUtilization >= 100 ? 'bg-red-100 text-red-700' : user.weeklyUtilization >= 80 ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                <span>{user.weeklyHours}h</span><span>{user.weeklyUtilization}%</span>
              </div>
            </td>
          </tr>
        ))}</tbody>
      </table>
      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
        <span className="font-medium">稼働率:</span>
        {[['#f8fafc','0%'],['#dbeafe','~50%'],['#93c5fd','~80%'],['#fbbf24','~100%'],['#ef4444','超過']].map(([c,l]) => <div key={l} className="flex items-center gap-1"><div className="w-4 h-4 rounded border" style={{backgroundColor:c}} /><span>{l}</span></div>)}
      </div>
    </div>
  )
}
