import { ReactNode } from 'react'
import { BottomNavigation } from './BottomNavigation'
import { Header } from './Header'

interface HomeLayoutProps {
  children: ReactNode
  isLoggedIn?: boolean
  user?: {
    nickname: string
    profileImage?: string
  }
  notificationCount?: number
}

export function HomeLayout({
  children,
  isLoggedIn = false,
  user,
  notificationCount = 0,
}: HomeLayoutProps) {
  return (
    <div className="bg-background-secondary min-h-screen">
      <Header
        isLoggedIn={isLoggedIn}
        user={user}
        notificationCount={notificationCount}
      />

      <main className="pb-16 md:pb-0">{children}</main>

      <BottomNavigation notificationCount={notificationCount} />
    </div>
  )
}
