'use client'

import { Bell, Home, MessageSquare, Plus, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface BottomNavigationProps {
  notificationCount?: number
}

export function BottomNavigation({
  notificationCount = 0,
}: BottomNavigationProps) {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/',
      icon: Home,
      label: '홈',
      isActive: pathname === '/',
    },
    {
      href: '/posts',
      icon: MessageSquare,
      label: '게시판',
      isActive: pathname.startsWith('/posts'),
    },
    {
      href: '/register-product',
      icon: Plus,
      label: '판매',
      isActive: pathname === '/register-product',
      isPrimary: true,
    },
    {
      href: '/notifications',
      icon: Bell,
      label: '알림',
      isActive: pathname === '/notifications',
      badge: notificationCount,
    },
    {
      href: '/my-info',
      icon: User,
      label: '내정보',
      isActive: pathname === '/my-info',
    },
  ]

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-50 border-t border-neutral-200 bg-white">
      <div className="flex h-16 items-center justify-around px-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.isActive

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center space-y-1 rounded-lg px-3 py-2 transition-colors ${
                isActive
                  ? 'text-primary-500'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.badge && item.badge > 0 && (
                  <span className="bg-error-500 absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full text-xs text-white">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
