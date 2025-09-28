'use client'

import { Bell, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface HeaderProps {
  isLoggedIn?: boolean
  user?: {
    name: string
    profileImage?: string
  }
  notificationCount?: number
}

export function Header({
  isLoggedIn = false,
  user,
  notificationCount = 0,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* 로고 */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-primary-500 flex h-8 w-8 items-center justify-center rounded-lg">
                <span className="text-sm font-bold text-white">B</span>
              </div>
              <span className="text-xl font-bold text-neutral-900">비드</span>
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
            <Link
              href="/posts"
              className="hover:text-primary-500 text-neutral-600 transition-colors"
            >
              게시판
            </Link>
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
                  href="/payments"
                  className="hover:text-primary-500 hidden items-center px-4 py-2 text-neutral-600 transition-colors sm:inline-flex"
                >
                  결제 관리
                </Link>

                {/* 알림 */}
                <button className="hover:text-primary-500 relative p-2 text-neutral-600 transition-colors">
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <span className="bg-error-500 absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs text-white">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </button>

                {/* 사용자 프로필 */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 rounded-lg p-2 transition-colors hover:bg-neutral-100"
                  >
                    <div className="bg-primary-100 flex h-8 w-8 items-center justify-center rounded-full">
                      <span className="text-primary-600 text-sm font-medium">
                        {user?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="hidden text-sm font-medium text-neutral-900 sm:block">
                      {user?.name || '사용자'}
                    </span>
                  </button>

                  {/* 프로필 드롭다운 */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-lg border border-neutral-200 bg-white py-2 shadow-lg">
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
                      <button className="block w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100">
                        로그아웃
                      </button>
                    </div>
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
          <div className="border-t border-neutral-200 py-4 md:hidden">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                className="hover:text-primary-500 text-neutral-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                홈
              </Link>
              <Link
                href="/posts"
                className="hover:text-primary-500 text-neutral-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                게시판
              </Link>
              {isLoggedIn && (
                <>
                  <Link
                    href="/my-products"
                    className="hover:text-primary-500 text-neutral-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    내 상품
                  </Link>
                  <Link
                    href="/bid-status"
                    className="hover:text-primary-500 text-neutral-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    입찰 현황
                  </Link>
                  <Link
                    href="/register-product"
                    className="hover:text-primary-500 text-neutral-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    상품 등록
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
