'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useWebSocketNotifications } from '@/hooks/useWebSocketNotifications'
import { notificationApi } from '@/lib/api'
import { User } from '@/types'
import { Bell, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface HeaderProps {
  isLoggedIn?: boolean
  user?: User
  notificationCount?: number
}

export function Header({
  isLoggedIn: propIsLoggedIn,
  user: propUser,
  notificationCount = 0,
}: HeaderProps) {
  const { isLoggedIn: contextIsLoggedIn, user: contextUser, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [unreadNotificationCount, setUnreadNotificationCount] =
    useState(notificationCount)

  // Context 우선, props는 fallback
  const isLoggedIn = contextIsLoggedIn || propIsLoggedIn
  const user = contextUser || propUser

  // WebSocket 실시간 알림 구독 (로그인된 경우에만)
  const { unreadCount: wsUnreadCount } = useWebSocketNotifications(isLoggedIn)

  // WebSocket 실시간 알림 개수와 API 알림 개수 합산
  useEffect(() => {
    if (isLoggedIn) {
      const totalCount = (unreadNotificationCount || 0) + (wsUnreadCount || 0)
      setUnreadNotificationCount(totalCount)
    }
  }, [wsUnreadCount, isLoggedIn])

  // 읽지 않은 알림 개수 가져오기
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (isLoggedIn) {
        try {
          const response = await notificationApi.getUnreadCount()
          if (response.success && response.data) {
            setUnreadNotificationCount(
              response.data.count || response.data || 0,
            )
          }
        } catch (error) {
          console.error('읽지 않은 알림 개수 조회 실패:', error)
        }
      }
    }

    fetchUnreadCount()

    // 5분마다 알림 개수 새로고침 (성능 최적화)
    const interval = setInterval(fetchUnreadCount, 300000)

    // 알림 개수 업데이트 이벤트 리스너
    const handleNotificationCountUpdate = (event: CustomEvent) => {
      setUnreadNotificationCount(event.detail.count)
    }

    window.addEventListener(
      'notificationCountUpdate',
      handleNotificationCountUpdate as EventListener,
    )

    return () => {
      clearInterval(interval)
      window.removeEventListener(
        'notificationCountUpdate',
        handleNotificationCountUpdate as EventListener,
      )
    }
  }, [isLoggedIn])

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200/50 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* 로고 */}
          <div className="flex items-center">
            <Link href="/" className="group flex items-center space-x-3">
              <div className="from-primary-500 via-secondary-500 to-primary-600 shadow-primary-500/25 group-hover:shadow-primary-500/30 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
                <span className="text-lg font-bold text-white">B</span>
              </div>
              <span className="from-primary-600 to-secondary-600 bg-gradient-to-r bg-clip-text text-2xl font-bold text-transparent">
                Bid
              </span>
            </Link>
          </div>

          {/* 데스크탑 네비게이션 */}
          <nav className="hidden items-center space-x-6 md:flex">
            <Link
              href="/"
              className="hover:text-primary-600 hover:bg-primary-50 relative rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 transition-all duration-200"
            >
              홈
            </Link>
            {isLoggedIn && (
              <>
                <Link
                  href="/my-products"
                  className="hover:text-primary-600 hover:bg-primary-50 relative rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 transition-all duration-200"
                >
                  내 상품
                </Link>
                <Link
                  href="/bid-status"
                  className="hover:text-primary-600 hover:bg-primary-50 relative rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 transition-all duration-200"
                >
                  입찰 현황
                </Link>
                <Link
                  href="/wallet"
                  className="hover:text-primary-600 hover:bg-primary-50 relative rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 transition-all duration-200"
                >
                  지갑
                </Link>
              </>
            )}
          </nav>

          {/* 우측 액션 버튼들 */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                {/* 상품 등록 버튼 */}
                <Link
                  href="/register-product"
                  className="from-primary-500 to-primary-600 shadow-primary-500/25 hover:from-primary-600 hover:to-primary-700 hover:shadow-primary-500/30 hidden items-center rounded-xl bg-gradient-to-r px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl sm:inline-flex"
                >
                  상품 등록
                </Link>

                {/* 알림 */}
                <Link
                  href="/notifications"
                  className="hover:text-primary-600 hover:bg-primary-50 relative rounded-lg p-2.5 text-neutral-600 transition-all duration-200"
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotificationCount > 0 && (
                    <span className="from-error-500 to-secondary-500 shadow-error-500/30 absolute -top-1 -right-1 flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-gradient-to-r text-xs font-bold text-white shadow-lg ring-2 ring-white">
                      {unreadNotificationCount > 99
                        ? '99+'
                        : unreadNotificationCount > 9
                          ? '9+'
                          : unreadNotificationCount}
                    </span>
                  )}
                </Link>

                {/* 사용자 프로필 */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="hover:bg-primary-50 flex items-center space-x-3 rounded-xl p-2 transition-all duration-200"
                  >
                    <div className="from-primary-500 to-secondary-500 shadow-primary-500/25 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br shadow-lg">
                      <span className="text-sm font-bold text-white">
                        {(user?.nickname || user?.email || 'U')
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden text-sm font-semibold text-neutral-900 sm:block">
                      {user?.nickname || user?.email?.split('@')[0] || '사용자'}
                    </span>
                  </button>

                  {/* 프로필 드롭다운 */}
                  {isProfileOpen && (
                    <>
                      {/* 배경 오버레이 */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsProfileOpen(false)}
                      />
                      {/* 드롭다운 메뉴 */}
                      <div className="animate-scale-in fixed top-16 right-4 z-50 w-56 rounded-2xl border border-neutral-200/50 bg-white/95 py-3 shadow-xl shadow-neutral-200/50 backdrop-blur-md md:absolute md:top-full md:right-0 md:mt-2">
                        <Link
                          href="/my-info"
                          className="hover:bg-primary-50 hover:text-primary-700 block px-4 py-3 text-sm font-medium text-neutral-700 transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          내 정보
                        </Link>
                        <Link
                          href="/notifications"
                          className="hover:bg-primary-50 hover:text-primary-700 block px-4 py-3 text-sm font-medium text-neutral-700 transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          알림
                        </Link>
                        <hr className="my-2 border-neutral-200/50" />
                        <button
                          onClick={() => {
                            setIsProfileOpen(false)
                            logout()
                          }}
                          className="hover:bg-error-50 hover:text-error-700 block w-full px-4 py-3 text-left text-sm font-medium text-neutral-700 transition-colors"
                        >
                          로그아웃
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="from-primary-500 to-primary-600 shadow-primary-500/25 hover:from-primary-600 hover:to-primary-700 hover:shadow-primary-500/30 inline-flex items-center rounded-xl bg-gradient-to-r px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
              >
                로그인
              </Link>
            )}

            {/* 모바일 메뉴 버튼 */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="hover:text-primary-500 p-2 text-neutral-600 transition-colors md:hidden"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <>
            {/* 배경 오버레이 - 헤더 아래부터 시작 */}
            <div
              className="bg-opacity-50 fixed top-16 right-0 bottom-0 left-0 z-40 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            {/* 메뉴 슬라이드 */}
            <div className="fixed top-16 right-0 left-0 z-50 border-t border-neutral-200 bg-white shadow-lg md:hidden">
              <nav className="flex flex-col px-4 py-4">
                <Link
                  href="/"
                  className="rounded-lg px-3 py-3 text-neutral-700 transition-colors hover:bg-neutral-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  홈
                </Link>
                {/* <Link
                  href="/posts"
                  className="rounded-lg px-3 py-3 text-neutral-700 transition-colors hover:bg-neutral-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  게시판
                </Link> */}
                {isLoggedIn && (
                  <>
                    <Link
                      href="/my-products"
                      className="rounded-lg px-3 py-3 text-neutral-700 transition-colors hover:bg-neutral-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      내 상품
                    </Link>
                    <Link
                      href="/bid-status"
                      className="rounded-lg px-3 py-3 text-neutral-700 transition-colors hover:bg-neutral-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      입찰 현황
                    </Link>
                    <Link
                      href="/register-product"
                      className="rounded-lg px-3 py-3 text-neutral-700 transition-colors hover:bg-neutral-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      상품 등록
                    </Link>

                    <Link
                      href="/wallet"
                      className="rounded-lg px-3 py-3 text-neutral-700 transition-colors hover:bg-neutral-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      결제 관리
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
