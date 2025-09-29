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
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 페이지 로드 시 서버에서 로그인 상태 확인
    const checkAuthStatus = async () => {
      const accessToken = localStorage.getItem('accessToken')

      if (!accessToken) {
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
          setUser({
            id: response.data.id || 1,
            email: response.data.email || '',
            nickname: response.data.nickname || response.data.name || '',
            phone: response.data.phone || '',
            address: response.data.address || '',
          })
        } else {
          // 서버에서 로그아웃 상태라고 응답한 경우 - 토큰이 유효하지 않음
          console.log(
            '서버에서 로그아웃 상태 응답, 토큰이 유효하지 않음:',
            response.resultCode,
          )
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

  const logout = () => {
    // 쿠키에서 토큰 제거
    document.cookie =
      'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie =
      'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        login,
        logout,
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
