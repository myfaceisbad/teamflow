export function getWeekDates(weekOffset: number = 0): Date[] {
  const today = new Date()
  const monday = new Date(today)
  monday.setDate(today.getDate() - today.getDay() + 1 + weekOffset * 7)
  monday.setHours(0, 0, 0, 0)
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(monday); d.setDate(monday.getDate() + i); return d })
}

export function calculateDailyHours(tasks: Array<{ startDate: Date | null; dueDate: Date | null; estimatedHours: number | null }>, targetDate: Date): number {
  let total = 0
  for (const task of tasks) {
    if (!task.estimatedHours) continue
    const start = task.startDate ?? task.dueDate; const end = task.dueDate ?? task.startDate
    if (!start || !end) continue
    const s = new Date(start); s.setHours(0,0,0,0); const e = new Date(end); e.setHours(0,0,0,0)
    const t = new Date(targetDate); t.setHours(0,0,0,0)
    if (t >= s && t <= e) { const days = Math.max(1, Math.ceil((e.getTime() - s.getTime()) / 86400000) + 1); total += task.estimatedHours / days }
  }
  return Math.round(total * 10) / 10
}

export function getHeatmapColor(rate: number): string {
  if (rate === 0) return '#f8fafc'; if (rate < 50) return '#dbeafe'; if (rate < 80) return '#93c5fd'; if (rate < 100) return '#fbbf24'; return '#ef4444'
}
