'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface Props { open: boolean; onOpenChange: (open: boolean) => void; projectId: string; defaultStatus?: string; onSuccess?: () => void }

export function AddTaskDialog({ open, onOpenChange, projectId, defaultStatus = 'TODO', onSuccess }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('MEDIUM')
  const [dueDate, setDueDate] = useState('')
  const [estimatedHours, setEstimatedHours] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    try {
      await fetch('/api/tasks', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, priority, projectId, status: defaultStatus, dueDate: dueDate || null, estimatedHours: estimatedHours || null })
      })
      toast.success('タスクを追加しました')
      setTitle(''); setDescription(''); setPriority('MEDIUM'); setDueDate(''); setEstimatedHours('')
      onOpenChange(false)
      onSuccess?.()
    } catch { toast.error('追加に失敗しました') }
    finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-800">タスクを追加</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2"><Label className="text-sm font-semibold text-slate-700">タイトル *</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="タスクのタイトル" required /></div>
          <div className="space-y-2"><Label className="text-sm font-semibold text-slate-700">説明</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="タスクの詳細" rows={3} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label className="text-sm font-semibold text-slate-700">優先度</Label>
              <Select value={priority} onValueChange={setPriority}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                <SelectItem value="URGENT">緊急</SelectItem><SelectItem value="HIGH">高</SelectItem><SelectItem value="MEDIUM">中</SelectItem><SelectItem value="LOW">低</SelectItem>
              </SelectContent></Select>
            </div>
            <div className="space-y-2"><Label className="text-sm font-semibold text-slate-700">見積 (h)</Label><Input type="number" value={estimatedHours} onChange={e => setEstimatedHours(e.target.value)} placeholder="8" min="0" step="0.5" /></div>
          </div>
          <div className="space-y-2"><Label className="text-sm font-semibold text-slate-700">期限</Label><Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} /></div>
          <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>キャンセル</Button>
            <Button type="submit" disabled={loading || !title.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white">{loading ? '追加中...' : '追加'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
