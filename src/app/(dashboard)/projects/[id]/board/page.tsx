'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Plus, GripVertical, Clock, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { AddTaskDialog } from '@/components/tasks/AddTaskDialog'

const COLUMNS = [
  { id: 'BACKLOG', label: 'バックログ', color: 'bg-slate-100', ring: 'ring-slate-300' },
  { id: 'TODO', label: '未着手', color: 'bg-blue-50', ring: 'ring-blue-300' },
  { id: 'IN_PROGRESS', label: '進行中', color: 'bg-yellow-50', ring: 'ring-yellow-300' },
  { id: 'IN_REVIEW', label: 'レビュー', color: 'bg-purple-50', ring: 'ring-purple-300' },
  { id: 'DONE', label: '完了', color: 'bg-green-50', ring: 'ring-green-300' },
]
const priorityColors: Record<string, string> = { URGENT: 'bg-red-100 text-red-700', HIGH: 'bg-orange-100 text-orange-700', MEDIUM: 'bg-blue-100 text-blue-700', LOW: 'bg-slate-100 text-slate-600' }
const priorityLabels: Record<string, string> = { URGENT: '緊急', HIGH: '高', MEDIUM: '中', LOW: '低' }

interface TaskData {
  id: string
  title: string
  description?: string | null
  status: string
  priority: string
  dueDate?: string | null
  estimatedHours?: number | null
  assignee?: { name: string } | null
  [key: string]: any
}

export default function BoardPage() {
  const params = useParams()
  const projectId = params.id as string
  const [tasks, setTasks] = useState<TaskData[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [addStatus, setAddStatus] = useState('TODO')
  const [project, setProject] = useState<any>(null)

  // Drag state
  const [dragTask, setDragTask] = useState<TaskData | null>(null)
  const [hoverColumn, setHoverColumn] = useState<string | null>(null)
  const dragGhostRef = useRef<HTMLDivElement>(null)
  const columnRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const fetchTasks = useCallback(async () => {
    const res = await fetch(`/api/tasks?projectId=${projectId}`)
    setTasks(await res.json()); setLoading(false)
  }, [projectId])

  useEffect(() => {
    fetchTasks()
    fetch('/api/projects').then(r => r.json()).then(ps => setProject(ps.find((p: any) => p.id === projectId)))
  }, [fetchTasks, projectId])

  // Find which column the pointer is over
  const getColumnAtPoint = (x: number, y: number): string | null => {
    for (const col of COLUMNS) {
      const el = columnRefs.current[col.id]
      if (!el) continue
      const rect = el.getBoundingClientRect()
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return col.id
      }
    }
    return null
  }

  const handlePointerDown = (e: React.PointerEvent, task: TaskData) => {
    e.preventDefault()
    const startX = e.clientX
    const startY = e.clientY
    let started = false

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY

      // Start drag after 5px threshold
      if (!started && Math.abs(dx) + Math.abs(dy) < 5) return
      if (!started) {
        started = true
        setDragTask(task)
        document.body.style.userSelect = 'none'
        document.body.style.cursor = 'grabbing'
      }

      // Move ghost
      if (dragGhostRef.current) {
        dragGhostRef.current.style.left = `${ev.clientX - 120}px`
        dragGhostRef.current.style.top = `${ev.clientY - 20}px`
      }

      // Highlight column
      const col = getColumnAtPoint(ev.clientX, ev.clientY)
      setHoverColumn(col)
    }

    const onUp = async (ev: PointerEvent) => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''

      if (!started) return

      const targetCol = getColumnAtPoint(ev.clientX, ev.clientY)
      setDragTask(null)
      setHoverColumn(null)

      if (targetCol && targetCol !== task.status) {
        // Optimistic update
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: targetCol } : t))
        try {
          await fetch(`/api/tasks/${task.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: targetCol }),
          })
          const label = COLUMNS.find(c => c.id === targetCol)?.label ?? targetCol
          toast.success(`「${task.title}」→ ${label}`)
        } catch {
          setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: task.status } : t))
          toast.error('移動に失敗しました')
        }
      }
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {project && <div className="w-4 h-4 rounded-full" style={{ backgroundColor: project.color }} />}
          <h1 className="text-xl font-bold">{project?.name ?? 'プロジェクト'}</h1>
        </div>
        <Button onClick={() => { setAddStatus('TODO'); setAddOpen(true) }}><Plus size={16} className="mr-1" />タスク追加</Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 200px)' }}>
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id)
          const isHover = hoverColumn === col.id
          return (
            <div
              key={col.id}
              ref={(el) => { columnRefs.current[col.id] = el }}
              className={`flex-shrink-0 w-64 rounded-xl p-3 transition-all duration-150 ${col.color} ${isHover ? `ring-2 ${col.ring} scale-[1.02]` : ''}`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-700">{col.label}</h3>
                <span className="text-xs bg-white text-slate-500 rounded-full px-2 py-0.5">{colTasks.length}</span>
              </div>
              <div className="space-y-2 min-h-[100px]">
                {colTasks.map(task => {
                  const isDragging = dragTask?.id === task.id
                  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'
                  return (
                    <div key={task.id} style={{ opacity: isDragging ? 0.3 : 1 }} className="transition-opacity">
                      <Card className="p-3 hover:shadow-md bg-white transition-shadow cursor-grab active:cursor-grabbing">
                        <div className="flex items-start gap-2">
                          <div
                            className="mt-0.5 text-slate-300 hover:text-slate-500 touch-none"
                            onPointerDown={(e) => handlePointerDown(e, task)}
                          >
                            <GripVertical size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800">{task.title}</p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <Badge variant="outline" className={`text-xs ${priorityColors[task.priority] ?? ''}`}>{priorityLabels[task.priority] ?? task.priority}</Badge>
                              {task.dueDate && <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>{isOverdue && <AlertCircle size={10} />}<Clock size={10} />{new Date(task.dueDate).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}</span>}
                              {task.estimatedHours && <span className="text-xs text-slate-400">{task.estimatedHours}h</span>}
                            </div>
                            {task.assignee && <div className="flex items-center gap-1 mt-2"><Avatar className="h-5 w-5"><AvatarFallback className="text-xs bg-indigo-100 text-indigo-700">{task.assignee.name.charAt(0)}</AvatarFallback></Avatar><span className="text-xs text-slate-500">{task.assignee.name}</span></div>}
                          </div>
                        </div>
                      </Card>
                    </div>
                  )
                })}
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-2 text-slate-500" onClick={() => { setAddStatus(col.id); setAddOpen(true) }}><Plus size={14} className="mr-1" />追加</Button>
            </div>
          )
        })}
      </div>

      {/* Drag ghost */}
      {dragTask && (
        <div
          ref={dragGhostRef}
          className="fixed z-50 pointer-events-none"
          style={{ left: -9999, top: -9999 }}
        >
          <Card className="p-3 shadow-2xl bg-white w-56 rotate-2 border-indigo-200 border-2">
            <p className="text-sm font-medium text-slate-800">{dragTask.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={`text-xs ${priorityColors[dragTask.priority] ?? ''}`}>{priorityLabels[dragTask.priority]}</Badge>
            </div>
          </Card>
        </div>
      )}

      <AddTaskDialog open={addOpen} onOpenChange={setAddOpen} projectId={projectId} defaultStatus={addStatus} onSuccess={fetchTasks} />
    </div>
  )
}
