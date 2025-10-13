'use client'

import { useAuth } from '@/contexts/AuthContext'
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

    // 30초마다 알림 개수 새로고침
    const interval = setInterval(fetchUnreadCount, 30000)

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
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* 로고 */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-sm">
                <span className="text-sm font-bold text-white">B</span>
              </div>
              <span className="text-xl font-bold text-neutral-900">Bid</span>
            </Link>
          </div>

          {/* 데스크탑 네비게이션 */}
          <nav className="hidden items-center space-x-8 md:flex">
            <Link
              href="/"
              className="hover:text-primary-500 text-neutral-600 transition-colors"
            >
              홈
            </Link>
            {/* <Link
              href="/posts"
              className="hover:text-primary-500 text-neutral-600 transition-colors"
            >
              게시판
            </Link> */}
            {isLoggedIn && (
              <>
                <Link
                  href="/my-products"
                  className="hover:text-primary-500 text-neutral-600 transition-colors"
                >
                  내 상품
                </Link>
                <Link
                  href="/bid-status"
                  className="hover:text-primary-500 text-neutral-600 transition-colors"
                >
                  입찰 현황
                </Link>
                <Link
                  href="/purchase-history"
                  className="hover:text-primary-500 text-neutral-600 transition-colors"
                >
                  구매 내역
                </Link>
                <Link
                  href="/wallet"
                  className="hover:text-primary-500 text-neutral-600 transition-colors"
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
                  className="bg-primary-500 hover:bg-primary-600 hidden items-center rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors sm:inline-flex"
                >
                  상품 등록
                </Link>

                {/* 결제 관리 버튼 */}
                <Link
                  href="/payments-methods"
                  className="hover:text-primary-500 hidden items-center px-4 py-2 text-neutral-600 transition-colors sm:inline-flex"
                >
                  결제 관리
                </Link>

                {/* 알림 */}
                <Link
                  href="/notifications"
                  className="hover:text-primary-500 relative p-2 text-neutral-600 transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-xs font-bold text-white shadow-lg ring-2 ring-white">
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
                    className="flex items-center space-x-2 rounded-lg p-2 transition-colors hover:bg-neutral-100"
                  >
                    <div className="bg-primary-100 flex h-8 w-8 items-center justify-center rounded-full">
                      <span className="text-primary-600 text-sm font-medium">
                        {(user?.nickname || user?.email || 'U')
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden text-sm font-medium text-neutral-900 sm:block">
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
                      <div className="fixed top-16 right-4 z-50 w-48 rounded-lg border border-neutral-200 bg-white py-2 shadow-lg md:absolute md:top-full md:right-0 md:mt-2">
                        <Link
                          href="/my-info"
                          className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          내 정보
                        </Link>
                        <Link
                          href="/notifications"
                          className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          알림
                        </Link>
                        <hr className="my-2" />
                        <button
                          onClick={() => {
                            console.log('🔓 로그아웃 버튼 클릭됨')
                            setIsProfileOpen(false)
                            logout()
                          }}
                          className="block w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100"
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
                className="bg-primary-500 hover:bg-primary-600 inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
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
                      href="/purchase-history"
                      className="rounded-lg px-3 py-3 text-neutral-700 transition-colors hover:bg-neutral-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      구매 내역
                    </Link>
                    <Link
                      href="/wallet"
                      className="rounded-lg px-3 py-3 text-neutral-700 transition-colors hover:bg-neutral-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      지갑
                    </Link>
                    <Link
                      href="/payment-methods"
                      className="rounded-lg px-3 py-3 text-neutral-700 transition-colors hover:bg-neutral-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      결제 수단
                    </Link>
                    <Link
                      href="/my-reviews"
                      className="rounded-lg px-3 py-3 text-neutral-700 transition-colors hover:bg-neutral-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      내 리뷰
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
