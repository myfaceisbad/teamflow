'use client'
import { useSession, signOut } from 'next-auth/react'
import { Bell, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export function Header() {
  const { data: session } = useSession()
  const user = session?.user

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
      <div />
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative"><Bell size={18} /></Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 h-9">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs">{user?.name?.charAt(0) ?? 'U'}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{user?.name ?? 'ユーザー'}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
            <DropdownMenuLabel className="text-xs font-normal text-slate-500">{user?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem><User size={14} className="mr-2" />設定</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })} className="text-red-600">
              <LogOut size={14} className="mr-2" />ログアウト
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
