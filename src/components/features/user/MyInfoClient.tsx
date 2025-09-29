'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, Edit, Package, TrendingUp, Trophy } from 'lucide-react'
import { useState } from 'react'

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

export function MyInfoClient({ user }: MyInfoClientProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'activity' | 'reviews'>(
    'stats',
  )

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}년 가입`
  }

  const tabs = [
    { id: 'stats', label: '통계' },
    { id: 'activity', label: '활동' },
    { id: 'reviews', label: '리뷰' },
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
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              편집
            </Button>
          </div>

          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="bg-primary-100 flex h-16 w-16 items-center justify-center rounded-full">
                <span className="text-primary-600 text-xl font-bold">
                  {user.nickname?.charAt(0) || 'U'}
                </span>
              </div>
              <button className="bg-primary-500 absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full">
                <Edit className="h-2.5 w-2.5 text-white" />
              </button>
            </div>

            <div className="flex-1">
              <div className="mb-3 flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-neutral-900">
                  {user.nickname || '사용자'}
                </h3>
                <Badge variant="success">인증됨</Badge>
              </div>

              <div className="space-y-2 text-sm text-neutral-600">
                <p>{user.email}</p>
                <p>{user.phone}</p>
                <p>{user.address}</p>
                <p>신뢰도 {user.creditScore || 0}점</p>
                <p>{formatJoinDate(user.createDate || '')}</p>
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
              {user.creditScore ? `${user.creditScore}점` : '-'}
            </div>
            <div className="text-sm text-neutral-600">
              {user.creditScore ? '신뢰도 점수' : '신뢰도 점수가 없습니다'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 탭 네비게이션 */}
      <div className="mb-6 flex space-x-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-500 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
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
