'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { FolderKanban, GripVertical } from 'lucide-react'
import { toast } from 'sonner'

const statusOptions = [
  { id: 'BACKLOG', label: 'バックログ', color: 'bg-slate-100 text-slate-600' },
  { id: 'TODO', label: '未着手', color: 'bg-blue-100 text-blue-700' },
  { id: 'IN_PROGRESS', label: '進行中', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'IN_REVIEW', label: 'レビュー', color: 'bg-purple-100 text-purple-700' },
  { id: 'DONE', label: '完了', color: 'bg-green-100 text-green-700' },
]
const statusColors: Record<string, string> = Object.fromEntries(statusOptions.map(s => [s.id, s.color]))
const statusLabels: Record<string, string> = Object.fromEntries(statusOptions.map(s => [s.id, s.label]))
const priorityColors: Record<string, string> = { URGENT: 'bg-red-100 text-red-700', HIGH: 'bg-orange-100 text-orange-700', MEDIUM: 'bg-blue-100 text-blue-700', LOW: 'bg-slate-100 text-slate-600' }
const priorityLabels: Record<string, string> = { URGENT: '緊急', HIGH: '高', MEDIUM: '中', LOW: '低' }

function SortableRow({ task, onStatusChange }: { task: any; onStatusChange: (taskId: string, status: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }

  return (
    <tr ref={setNodeRef} style={style} {...attributes} className="border-b hover:bg-slate-50 group">
      <td className="p-3 w-8">
        <div {...listeners} className="cursor-grab active:cursor-grabbing text-slate-300 group-hover:text-slate-500 transition-colors">
          <GripVertical size={16} />
        </div>
      </td>
      <td className="p-3">
        <p className="font-medium">{task.title}</p>
        {task.description && <p className="text-xs text-slate-400 truncate max-w-xs">{task.description}</p>}
      </td>
      <td className="p-3">
        {task.assignee ? (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700">{task.assignee.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm">{task.assignee.name}</span>
          </div>
        ) : (
          <span className="text-slate-300">未割当</span>
        )}
      </td>
      <td className="p-3">
        <Badge variant="secondary" className={priorityColors[task.priority]}>{priorityLabels[task.priority]}</Badge>
      </td>
      <td className="p-3">
        <Select value={task.status} onValueChange={(v) => onStatusChange(task.id, v)}>
          <SelectTrigger className="h-7 w-28 text-xs border-0 bg-transparent hover:bg-slate-100 transition-colors">
            <Badge variant="secondary" className={statusColors[task.status]}>{statusLabels[task.status]}</Badge>
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map(s => (
              <SelectItem key={s.id} value={s.id}>
                <Badge variant="secondary" className={s.color}>{s.label}</Badge>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="p-3 text-slate-600 text-sm">{task.dueDate ? new Date(task.dueDate).toLocaleDateString('ja-JP') : '—'}</td>
      <td className="p-3 text-slate-600 text-sm">{task.estimatedHours ? `${task.estimatedHours}h` : '—'}</td>
    </tr>
  )
}

export default function ListPage() {
  const params = useParams()
  const projectId = params.id as string
  const [tasks, setTasks] = useState<any[]>([])
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTask, setActiveTask] = useState<any>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const fetchTasks = useCallback(async () => {
    const res = await fetch(`/api/tasks?projectId=${projectId}`)
    setTasks(await res.json())
    setLoading(false)
  }, [projectId])

  useEffect(() => {
    fetchTasks()
    fetch('/api/projects').then(r => r.json()).then(ps => setProject(ps.find((p: any) => p.id === projectId)))
  }, [fetchTasks, projectId])

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task || task.status === newStatus) return
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    toast.success(`「${task.title}」を${statusLabels[newStatus]}に変更しました`)
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTask(tasks.find(t => t.id === event.active.id))
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)
    if (!over || active.id === over.id) return

    // Reorder tasks in the list
    const oldIndex = tasks.findIndex(t => t.id === active.id)
    const newIndex = tasks.findIndex(t => t.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const newTasks = [...tasks]
    const [removed] = newTasks.splice(oldIndex, 1)
    newTasks.splice(newIndex, 0, removed)
    setTasks(newTasks)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: project?.color ?? '#6366f1' }} />
          <h1 className="text-xl font-bold">{project?.name ?? 'プロジェクト'} - リスト</h1>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/projects/${projectId}/board`}><FolderKanban size={14} className="mr-1" />カンバン</Link>
        </Button>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-3 w-8"></th>
                <th className="text-left p-3 font-medium text-slate-600">タスク</th>
                <th className="text-left p-3 font-medium text-slate-600">担当者</th>
                <th className="text-left p-3 font-medium text-slate-600">優先度</th>
                <th className="text-left p-3 font-medium text-slate-600">ステータス</th>
                <th className="text-left p-3 font-medium text-slate-600">期限</th>
                <th className="text-left p-3 font-medium text-slate-600">見積</th>
              </tr>
            </thead>
            <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
              <tbody>
                {tasks.map(task => (
                  <SortableRow key={task.id} task={task} onStatusChange={handleStatusChange} />
                ))}
              </tbody>
            </SortableContext>
          </table>
          <DragOverlay>
            {activeTask && (
              <table className="w-full text-sm bg-white shadow-lg rounded-lg">
                <tbody>
                  <tr className="bg-indigo-50">
                    <td className="p-3 w-8"><GripVertical size={16} className="text-indigo-400" /></td>
                    <td className="p-3 font-medium">{activeTask.title}</td>
                    <td className="p-3">{activeTask.assignee?.name ?? '—'}</td>
                    <td className="p-3"><Badge variant="secondary" className={priorityColors[activeTask.priority]}>{priorityLabels[activeTask.priority]}</Badge></td>
                    <td className="p-3"><Badge variant="secondary" className={statusColors[activeTask.status]}>{statusLabels[activeTask.status]}</Badge></td>
                    <td className="p-3 text-slate-600">{activeTask.dueDate ? new Date(activeTask.dueDate).toLocaleDateString('ja-JP') : '—'}</td>
                    <td className="p-3 text-slate-600">{activeTask.estimatedHours ? `${activeTask.estimatedHours}h` : '—'}</td>
                  </tr>
                </tbody>
              </table>
            )}
          </DragOverlay>
        </DndContext>
        {tasks.length === 0 && <div className="text-center py-12 text-slate-400">タスクがありません</div>}
      </div>
    </div>
  )
}
