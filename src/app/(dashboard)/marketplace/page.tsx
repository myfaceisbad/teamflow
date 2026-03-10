'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ShoppingBag, Clock, Star, Users, Send } from 'lucide-react'
import { toast } from 'sonner'

const priorityColors: Record<string, string> = { URGENT: 'bg-red-100 text-red-700', HIGH: 'bg-orange-100 text-orange-700', MEDIUM: 'bg-blue-100 text-blue-700', LOW: 'bg-slate-100 text-slate-600' }
const priorityLabels: Record<string, string> = { URGENT: '緊急', HIGH: '高', MEDIUM: '中', LOW: '低' }

export default function MarketplacePage() {
  const { data: session } = useSession()
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [applyTask, setApplyTask] = useState<any>(null)
  const [desire, setDesire] = useState(3)
  const [confidence, setConfidence] = useState(3)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchTasks = async () => { setLoading(true); const r = await fetch('/api/marketplace'); setTasks(await r.json()); setLoading(false) }
  useEffect(() => { fetchTasks() }, [])

  const handleApply = async () => {
    if (!applyTask) return; setSubmitting(true)
    try {
      await fetch(`/api/tasks/${applyTask.id}/apply`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ desireLevel: desire, confidenceLevel: confidence, message }) })
      toast.success('応募しました！'); setApplyTask(null); setDesire(3); setConfidence(3); setMessage(''); fetchTasks()
    } catch { toast.error('応募に失敗しました') }
    finally { setSubmitting(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold flex items-center gap-2"><ShoppingBag className="text-indigo-600" />タスクマーケットプレイス</h1><p className="text-sm text-slate-500 mt-1">興味のあるタスクに応募できます</p></div>
        <Badge variant="secondary" className="text-sm">{tasks.length} 件の公募</Badge>
      </div>
      <div className="grid gap-4">
        {tasks.map(task => {
          const skills = JSON.parse(task.requiredSkills || '[]')
          return (
            <Card key={task.id} className="hover:shadow-md transition-shadow border-l-4 border-l-indigo-400">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{task.title}</h3>
                      <Badge variant="outline" className={priorityColors[task.priority]}>{priorityLabels[task.priority]}</Badge>
                    </div>
                    {task.description && <p className="text-sm text-slate-600 mt-1">{task.description}</p>}
                    <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: task.project?.color }} />{task.project?.name}</span>
                      {task.estimatedHours && <span className="flex items-center gap-1"><Clock size={14} />{task.estimatedHours}h</span>}
                      {task.dueDate && <span>期限: {new Date(task.dueDate).toLocaleDateString('ja-JP')}</span>}
                      <span className="flex items-center gap-1"><Users size={14} />{task._count?.applications ?? 0} 応募</span>
                    </div>
                    {skills.length > 0 && <div className="flex gap-1 mt-2 flex-wrap">{skills.map((s: string) => <Badge key={s} variant="secondary" className="text-xs bg-indigo-50 text-indigo-700">{s}</Badge>)}</div>}
                  </div>
                  <Button onClick={() => setApplyTask(task)} className="ml-4 shrink-0"><Send size={14} className="mr-1" />応募する</Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {tasks.length === 0 && <Card><CardContent className="py-12 text-center text-slate-400">現在公募中のタスクはありません</CardContent></Card>}
      </div>

      <Dialog open={!!applyTask} onOpenChange={(o) => !o && setApplyTask(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-800">タスクに応募</DialogTitle>
            <p className="text-sm text-slate-500 mt-1">「{applyTask?.title}」</p>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">希望度 (担当したい度合い)</Label>
              <div className="flex gap-2">{[1,2,3,4,5].map(n => <button key={n} onClick={() => setDesire(n)} className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-lg transition-all ${desire >= n ? 'border-yellow-400 bg-yellow-50 shadow-sm' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}><Star size={16} className={desire >= n ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'} /></button>)}</div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">自信度 (スキルの自信)</Label>
              <div className="flex gap-2">{[1,2,3,4,5].map(n => <button key={n} onClick={() => setConfidence(n)} className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-lg transition-all ${confidence >= n ? 'border-blue-400 bg-blue-50 shadow-sm' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}><Star size={16} className={confidence >= n ? 'fill-blue-400 text-blue-400' : 'text-slate-300'} /></button>)}</div>
            </div>
            <div className="space-y-2"><Label className="text-sm font-semibold text-slate-700">コメント (任意)</Label><Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="このタスクに応募する理由..." rows={3} /></div>
            <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
              <Button variant="outline" onClick={() => setApplyTask(null)}>キャンセル</Button>
              <Button onClick={handleApply} disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">{submitting ? '送信中...' : '応募する'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
