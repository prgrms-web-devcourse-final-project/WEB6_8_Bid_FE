'use client'

import { PaymentMethodClient } from '@/components/features/payment/PaymentMethodClient'
import { ReviewManagementClient } from '@/components/features/reviews/ReviewManagementClient'
import { WalletClient } from '@/components/features/wallet/WalletClient'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { authApi } from '@/lib/api'
import {
  Clock,
  CreditCard,
  DollarSign,
  Edit,
  MessageSquare,
  Package,
  TrendingUp,
  Trophy,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface MyInfoClientProps {
  user: {
    id?: number
    email?: string
    nickname?: string
    phone?: string
    address?: string
    profileImage?: string
    creditScore?: number
    createDate?: string
    modifyDate?: string
  }
}

export function MyInfoClient({ user: propUser }: MyInfoClientProps) {
  const router = useRouter()
  const { user: authUser, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState<
    'stats' | 'activity' | 'reviews' | 'wallet' | 'payment' | 'my-reviews'
  >('stats')
  const [userInfo, setUserInfo] = useState(propUser || authUser)
  const [isLoading, setIsLoading] = useState(false)

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

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}년 가입`
  }

  const tabs = [
    { id: 'stats', label: '통계', icon: TrendingUp },
    { id: 'activity', label: '활동', icon: Package },
    { id: 'reviews', label: '리뷰', icon: MessageSquare },
    { id: 'wallet', label: '지갑', icon: DollarSign },
    { id: 'payment', label: '결제수단', icon: CreditCard },
    { id: 'my-reviews', label: '내 리뷰', icon: MessageSquare },
  ]

  // 실제 사용자 데이터에서 통계 계산 (현재는 0으로 표시, 추후 API 연동)
  const stats = {
    totalSales: 0,
    totalPurchases: 0,
    activeBids: 0,
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      {/* 기본 정보 */}
      <Card variant="outlined" className="mb-6">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">
              기본 정보
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/my-info/edit')}
            >
              <Edit className="mr-2 h-4 w-4" />
              편집
            </Button>
          </div>

          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="bg-primary-100 flex h-16 w-16 items-center justify-center rounded-full">
                <span className="text-primary-600 text-xl font-bold">
                  {userInfo.nickname?.charAt(0) || 'U'}
                </span>
              </div>
              <button className="bg-primary-500 absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full">
                <Edit className="h-2.5 w-2.5 text-white" />
              </button>
            </div>

            <div className="flex-1">
              <div className="mb-3 flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-neutral-900">
                  {userInfo.nickname || '사용자'}
                </h3>
                <Badge variant="success">인증됨</Badge>
              </div>

              <div className="space-y-2 text-sm text-neutral-600">
                <p>{userInfo.email}</p>
                <p>{userInfo.phone}</p>
                <p>{userInfo.address}</p>
                <p>신뢰도 {userInfo.creditScore || 0}점</p>
                <p>{formatJoinDate(userInfo.createDate || '')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 신뢰도 점수 */}
      <Card variant="outlined" className="mb-6">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center space-x-2">
            <Trophy className="text-warning-500 h-5 w-5" />
            <h2 className="text-lg font-semibold text-neutral-900">
              신뢰도 점수
            </h2>
          </div>

          <div className="text-center">
            <div className="text-primary-500 mb-2 text-4xl font-bold">
              {userInfo.creditScore ? `${userInfo.creditScore}점` : '-'}
            </div>
            <div className="text-sm text-neutral-600">
              {userInfo.creditScore ? '신뢰도 점수' : '신뢰도 점수가 없습니다'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 탭 네비게이션 */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-1 rounded-lg bg-neutral-100 p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary-600 bg-white shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Icon className="mr-2 h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      {activeTab === 'stats' && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card variant="outlined">
            <CardContent className="py-6 text-center">
              <div className="mb-2 flex items-center justify-center">
                <Package className="text-primary-500 mr-2 h-6 w-6" />
                <span className="text-primary-500 text-2xl font-bold">
                  {stats.totalSales}
                </span>
              </div>
              <div className="text-sm text-neutral-600">판매 완료</div>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent className="py-6 text-center">
              <div className="mb-2 flex items-center justify-center">
                <Trophy className="text-success-500 mr-2 h-6 w-6" />
                <span className="text-success-500 text-2xl font-bold">
                  {stats.totalPurchases}
                </span>
              </div>
              <div className="text-sm text-neutral-600">낙찰 성공</div>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent className="py-6 text-center">
              <div className="mb-2 flex items-center justify-center">
                <Clock className="text-warning-500 mr-2 h-6 w-6" />
                <span className="text-warning-500 text-2xl font-bold">
                  {stats.activeBids}
                </span>
              </div>
              <div className="text-sm text-neutral-600">진행 중</div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'activity' && (
        <Card variant="outlined">
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-neutral-900">
              최근 활동
            </h3>

            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                <Package className="h-8 w-8 text-neutral-400" />
              </div>
              <p className="text-neutral-500">최근 활동이 없습니다.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'reviews' && (
        <Card variant="outlined">
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-neutral-900">
              리뷰
            </h3>

            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                <TrendingUp className="h-8 w-8 text-neutral-400" />
              </div>
              <p className="text-neutral-500">아직 리뷰가 없습니다.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'wallet' && <WalletClient />}

      {activeTab === 'payment' && <PaymentMethodClient />}

      {activeTab === 'my-reviews' && <ReviewManagementClient />}

      {/* 월별 활동 차트 */}
      <Card variant="outlined">
        <CardContent className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-neutral-900">
            월별 활동
          </h3>

          <div className="flex h-48 items-center justify-center rounded-lg bg-neutral-100">
            <div className="text-center">
              <TrendingUp className="mx-auto mb-2 h-12 w-12 text-neutral-400" />
              <p className="text-neutral-500">활동 데이터가 없습니다</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
