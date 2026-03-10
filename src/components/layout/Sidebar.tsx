'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Users, ShoppingBag, FolderKanban, BarChart3, Settings, Zap } from 'lucide-react'

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'ホーム' },
  { href: '/workload', icon: Users, label: 'ワークロード' },
  { href: '/marketplace', icon: ShoppingBag, label: 'マーケットプレイス' },
  { href: '/projects', icon: FolderKanban, label: 'プロジェクト' },
  { href: '/reports', icon: BarChart3, label: 'レポート' },
  { href: '/settings', icon: Settings, label: '設定' },
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-56 h-screen bg-slate-900 text-white flex flex-col fixed left-0 top-0 z-50">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center"><Zap size={16} /></div>
          <span className="font-bold text-lg">TeamFlow</span>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href}
              className={cn('flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}>
              <Icon size={18} />{item.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-slate-700"><p className="text-xs text-slate-500 text-center">TeamFlow v1.0</p></div>
    </aside>
  )
}
