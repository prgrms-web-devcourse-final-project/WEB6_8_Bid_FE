'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { authApi } from '@/lib/api'
import { Edit } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface MyInfoClientProps {
  user: {
    id?: number
    email?: string
    nickname?: string
    phone?: string
    phoneNumber?: string
    address?: string
    profileImage?: string
    profileImageUrl?: string
    creditScore?: number
    createDate?: string
    modifyDate?: string
  }
}

export function MyInfoClient({ user: propUser }: MyInfoClientProps) {
  const router = useRouter()
  const { user: authUser, updateUser } = useAuth()
  const [userInfo, setUserInfo] = useState(propUser || authUser)
  const [isLoading, setIsLoading] = useState(false)

  // 디버깅용 로그 (필요시 주석 해제)
  // console.log('🔍 MyInfoClient 데이터 확인:', {
  //   propUser,
  //   authUser,
  //   userInfo,
  //   hasPropUser: !!propUser,
  //   hasAuthUser: !!authUser,
  //   hasUserInfo: !!userInfo,
  // })

  // 사용자 정보 새로고침
  const refreshUserInfo = async () => {
    setIsLoading(true)
    try {
      const response = await authApi.getMyInfo()
      if (response.success && response.data) {
        setUserInfo(response.data)
        updateUser(response.data)
      }
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error)
    }
    setIsLoading(false)
  }

  // 컴포넌트 마운트 시 사용자 정보 새로고침
  useEffect(() => {
    if (!userInfo || !userInfo.id) {
      refreshUserInfo()
    }
  }, [])

  // 실제 사용자 데이터에서 통계 계산 (현재는 0으로 표시, 추후 API 연동)
  const stats = {
    totalSales: 0,
    totalPurchases: 0,
    activeBids: 0,
  }

  const formatDisplayValue = (value: any, fallback: string = '') => {
    if (
      value === null ||
      value === undefined ||
      value === '' ||
      value === 'Invalid Date'
    ) {
      return fallback
    }
    return value
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString || dateString === 'Invalid Date' || dateString === '') {
      return ''
    }
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return ''
      }
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    } catch {
      return ''
    }
  }

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 프로필 헤더 */}
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative flex flex-col items-center space-y-6 text-center lg:flex-row lg:items-start lg:space-y-0 lg:space-x-8 lg:text-left">
          {/* 프로필 아바타 */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="h-24 w-24 overflow-hidden rounded-full bg-white/20 ring-4 ring-white/30 backdrop-blur-sm">
                <div className="flex h-24 w-24 items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {formatDisplayValue(userInfo.nickname, 'U')
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="absolute -right-2 -bottom-2 rounded-full bg-green-500 p-2 shadow-lg">
                <span className="text-xs text-white">✓</span>
              </div>
            </div>
          </div>

          {/* 사용자 정보 */}
          <div className="min-w-0 flex-1">
            <div className="mb-6">
              <h1 className="mb-2 text-4xl font-bold text-white">
                {formatDisplayValue(userInfo.nickname, '사용자')}
              </h1>
              <div className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
                <span className="mr-1">✓</span>
                인증된 사용자
              </div>
            </div>

            {/* 통계 카드들 */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {stats.totalSales}
                  </div>
                  <div className="text-sm text-white/80">판매 완료</div>
                </div>
              </div>
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {stats.totalPurchases}
                  </div>
                  <div className="text-sm text-white/80">낙찰 성공</div>
                </div>
              </div>
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {stats.activeBids}
                  </div>
                  <div className="text-sm text-white/80">진행 중</div>
                </div>
              </div>
            </div>
          </div>

          {/* 수정 버튼 */}
          <div className="flex-shrink-0">
            <Button
              className="border-white/30 bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
              onClick={() => router.push('/my-info/edit')}
            >
              <Edit className="mr-2 h-4 w-4" />
              프로필 수정
            </Button>
          </div>
        </div>
      </div>

      {/* 상세 정보 */}
      <Card className="mb-8 overflow-hidden border-0 bg-white shadow-lg">
        <CardContent className="p-8">
          <h2 className="mb-6 text-xl font-semibold text-neutral-900">
            상세 정보
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              {userInfo.email && (
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
                    <span className="text-sm text-neutral-600">📧</span>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500">이메일</div>
                    <div className="font-medium text-neutral-900">
                      {userInfo.email}
                    </div>
                  </div>
                </div>
              )}
              {(userInfo.phone || userInfo.phoneNumber) && (
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
                    <span className="text-sm text-neutral-600">📱</span>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500">전화번호</div>
                    <div className="font-medium text-neutral-900">
                      {userInfo.phone || userInfo.phoneNumber}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-4">
              {userInfo.creditScore && userInfo.creditScore > 0 ? (
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
                    <span className="text-sm text-neutral-600">⭐</span>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500">신뢰도</div>
                    <div
                      className={`font-medium ${getTrustScoreColor(userInfo.creditScore)}`}
                    >
                      {userInfo.creditScore}점
                    </div>
                  </div>
                </div>
              ) : null}
              {formatDate(userInfo.createDate) && (
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
                    <span className="text-sm text-neutral-600">📅</span>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500">가입일</div>
                    <div className="font-medium text-neutral-900">
                      {formatDate(userInfo.createDate)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
