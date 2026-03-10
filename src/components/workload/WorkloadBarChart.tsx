'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Props { users: Array<{ userName: string; weeklyHours: number; capacityHours: number; weeklyUtilization: number }> }

export function WorkloadBarChart({ users }: Props) {
  const data = users.map(u => ({ name: u.userName.split(' ').pop() ?? u.userName, hours: u.weeklyHours, free: Math.max(0, u.capacityHours - u.weeklyHours), util: u.weeklyUtilization }))
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 11 }} unit="h" />
        <Tooltip formatter={(v: any, name: any) => [`${v}h`, name === 'hours' ? '稼働' : '余力']} />
        <Legend formatter={(v) => v === 'hours' ? '稼働時間' : '余力'} />
        <Bar dataKey="hours" stackId="a" fill="#6366f1" /><Bar dataKey="free" stackId="a" fill="#e2e8f0" radius={[4,4,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
