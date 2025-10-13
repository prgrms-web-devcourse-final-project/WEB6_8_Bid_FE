'use client'

import { authApi } from '@/lib/api'
import { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: number
  email: string
  nickname: string
  phone: string
  address: string
}

interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  login: (
    user: User,
    tokens: { accessToken: string; refreshToken: string },
  ) => void
  logout: () => void
  updateUser: (user: User) => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 페이지 로드 시 서버에서 로그인 상태 확인
    const checkAuthStatus = async () => {
      // 쿠키 기반 인증만 사용
      const cookies = document.cookie.split(';')
      const accessTokenCookie = cookies.find((cookie) =>
        cookie.trim().startsWith('accessToken='),
      )
      const cookieToken = accessTokenCookie?.split('=')[1]

      console.log('🔍 AuthContext - 쿠키 기반 인증 확인:', {
        cookie: cookieToken ? '존재' : '없음',
        cookieLength: cookieToken?.length || 0,
        allCookies: document.cookie,
      })

      if (!cookieToken) {
        console.log('⚠️ AuthContext - 쿠키에 토큰이 없음, 로그인 필요')
        setLoading(false)
        return
      }

      try {
        // API 클라이언트를 통한 로그인 상태 확인
        const response = await authApi.check()
        console.log('✅ 로그인 상태 확인 성공:', response)

        // 서버에서 받은 사용자 정보로 상태 업데이트
        if (
          response.resultCode === '200-1' &&
          response.data &&
          response.data !== null
        ) {
          console.log('🔍 서버 응답 데이터 구조:', response.data)

          // 로그인 상태 확인 후 사용자 정보 API 호출
          try {
            const userResponse = await authApi.getProfile()
            console.log('👤 사용자 정보 API 응답:', userResponse)

            if (userResponse.success && userResponse.data) {
              const userInfo = {
                id: userResponse.data.id || 1,
                email: userResponse.data.email || '',
                nickname:
                  userResponse.data.nickname || userResponse.data.name || '',
                phone: userResponse.data.phone || '',
                address: userResponse.data.address || '',
              }
              setUser(userInfo)
            } else {
              // 사용자 정보 API 실패 시 기본값 설정
              const userInfo = {
                id: 1,
                email: typeof response.data === 'string' ? response.data : '',
                nickname:
                  typeof response.data === 'string'
                    ? response.data.split('@')[0]
                    : '',
                phone: '',
                address: '',
              }
              setUser(userInfo)
            }
          } catch (userError) {}
        } else if (response.resultCode === '200-2') {
          // 이미 토큰 재발급을 시도했는지 확인
          const lastRefreshAttempt = localStorage.getItem('lastRefreshAttempt')
          const now = Date.now()
          const REFRESH_COOLDOWN = 30000 // 30초 쿨다운

          if (
            lastRefreshAttempt &&
            now - parseInt(lastRefreshAttempt) < REFRESH_COOLDOWN
          ) {
            logout()
            return
          }

          // 재발급 시도 시간 기록
          localStorage.setItem('lastRefreshAttempt', now.toString())

          try {
            const refreshToken =
              localStorage.getItem('refreshToken') ||
              document.cookie
                .split(';')
                .find((cookie) => cookie.trim().startsWith('refreshToken='))
                ?.split('=')[1]

            if (refreshToken) {
              const reissueResponse = await authApi.reissue(refreshToken)

              if (reissueResponse.success && reissueResponse.data) {
                // 새로운 토큰으로 사용자 정보 다시 조회
                const newUserResponse = await authApi.check()
                if (
                  newUserResponse.resultCode === '200-1' &&
                  newUserResponse.data
                ) {
                  // 토큰 재발급 후 사용자 정보 API 호출
                  try {
                    const userResponse = await authApi.getProfile()

                    if (userResponse.success && userResponse.data) {
                      const userInfo = {
                        id: userResponse.data.id || 1,
                        email: userResponse.data.email || '',
                        nickname:
                          userResponse.data.nickname ||
                          userResponse.data.name ||
                          '',
                        phone: userResponse.data.phone || '',
                        address: userResponse.data.address || '',
                      }
                      setUser(userInfo)
                    } else {
                    }
                  } catch (userError) {
                    console.error(
                      '❌ 토큰 재발급 후 사용자 정보 API 호출 실패:',
                      userError,
                    )
                  }

                  // 새로운 토큰 저장
                  localStorage.setItem(
                    'accessToken',
                    reissueResponse.data.accessToken,
                  )
                  localStorage.setItem(
                    'refreshToken',
                    reissueResponse.data.refreshToken,
                  )

                  // 재발급 성공 시 쿨다운 제거
                  localStorage.removeItem('lastRefreshAttempt')

                  return
                }
              } else {
                console.log(
                  '❌ Refresh Token이 유효하지 않음:',
                  reissueResponse.msg,
                )
                console.log('🔄 로그아웃 처리 진행')
              }
            }

            // 토큰 재발급 실패 시 로그아웃
            console.log('❌ 토큰 재발급 실패, 로그아웃 처리')
            logout()
          } catch (reissueError) {
            console.error('❌ 토큰 재발급 에러:', reissueError)
            logout()
          }
        } else {
          // 기타 에러 - 로그아웃 처리
          console.log('서버에서 에러 응답:', response.resultCode)
          logout()
        }
      } catch (error) {
        console.error('로그인 상태 확인 에러:', error)
        // API 호출 실패 시 로그아웃 처리
        logout()
      } finally {
        setLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  const login = (
    user: User,
    tokens: { accessToken: string; refreshToken: string },
  ) => {
    // 쿠키에 토큰 저장 (이미 LoginClient에서 처리됨)
    setUser(user)
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
  }

  const logout = () => {
    console.log('🔓 로그아웃 함수 호출됨')

    // 로컬 스토리지 정리
    localStorage.removeItem('auth_state')
    localStorage.removeItem('user')
    localStorage.removeItem('last_login_time')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')

    // 쿠키에서 토큰 제거
    document.cookie =
      'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie =
      'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'

    console.log('🧹 로그아웃 완료 - 토큰 및 사용자 정보 삭제됨')
    setUser(null)

    // 로그인 페이지로 리다이렉트
    if (typeof window !== 'undefined') {
      console.log('🔄 로그인 페이지로 리다이렉트')
      window.location.href = '/login'
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        login,
        logout,
        updateUser,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
