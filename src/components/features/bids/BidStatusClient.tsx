'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ErrorAlert } from '@/components/ui/error-alert'
import { bidApi } from '@/lib/api'
import { Bid } from '@/types'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface BidStatusClientProps {
  initialBids?: Bid[]
}

export function BidStatusClient({ initialBids }: BidStatusClientProps) {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState('active')
  const [bids, setBids] = useState((initialBids as any) || [])
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  // 내 입찰 내역 조회
  const fetchMyBids = async () => {
    setIsLoading(true)
    setApiError('')
    try {
      const response = await bidApi.getMyBids()
      if (response.success && response.data) {
        // API 응답 데이터 구조에 맞게 변환
        let bidsData = []
        if (Array.isArray(response.data)) {
          bidsData = response.data
        } else if (
          response.data.content &&
          Array.isArray(response.data.content)
        ) {
          bidsData = response.data.content
        }
        setBids(bidsData)
      } else {
        setApiError(response.msg || '입찰 내역을 불러오는데 실패했습니다.')
      }
    } catch (error: any) {
      console.error('내 입찰 내역 조회 실패:', error)
      setApiError(
        error.response?.data?.msg || '입찰 내역을 불러오는데 실패했습니다.',
      )
    }
    setIsLoading(false)
  }

  // 컴포넌트 마운트 시 입찰 내역 조회
  useEffect(() => {
    if (!initialBids || initialBids.length === 0) {
      fetchMyBids()
    }
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { label: '진행중', variant: 'primary' as const }
      case 'won':
        return { label: '낙찰', variant: 'success' as const }
      case 'lost':
        return { label: '유찰', variant: 'warning' as const }
      default:
        return { label: '알 수 없음', variant: 'neutral' as const }
    }
  }

  const filteredBids = bids.filter((bid: any) => {
    if (selectedTab === 'active') return bid.status === 'active'
    if (selectedTab === 'won') return bid.status === 'won'
    if (selectedTab === 'lost') return bid.status === 'lost'
    return true
  })

  const stats = {
    active: bids.filter((b: any) => b.status === 'active').length,
    won: bids.filter((b: any) => b.status === 'won').length,
    lost: bids.filter((b: any) => b.status === 'lost').length,
    successRate:
      Math.round(
        (bids.filter((b: any) => b.status === 'won').length /
          bids.filter((b: any) => b.status !== 'active').length) *
          100,
      ) || 0,
  }

  const statusTabs = [
    { id: 'active', label: '진행중', count: stats.active },
    { id: 'won', label: '낙찰', count: stats.won },
    { id: 'lost', label: '유찰', count: stats.lost },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* API 에러 메시지 */}
      {apiError && (
        <ErrorAlert
          title="오류"
          message={apiError}
          onClose={() => setApiError('')}
        />
      )}

      {/* 입찰 현황 요약 */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card variant="outlined">
          <CardContent className="p-4 text-center">
            <div className="text-primary-500 text-2xl font-bold">
              {stats.active}
            </div>
            <div className="text-sm text-neutral-600">진행중</div>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent className="p-4 text-center">
            <div className="text-success-500 text-2xl font-bold">
              {stats.won}
            </div>
            <div className="text-sm text-neutral-600">낙찰</div>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent className="p-4 text-center">
            <div className="text-warning-500 text-2xl font-bold">
              {stats.lost}
            </div>
            <div className="text-sm text-neutral-600">유찰</div>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent className="p-4 text-center">
            <div className="text-lg font-bold text-neutral-900">
              {stats.successRate}%
            </div>
            <div className="text-sm text-neutral-600">성공률</div>
          </CardContent>
        </Card>
      </div>

      {/* 입찰 목록 탭 */}
      <div className="mb-6">
        <div className="flex space-x-1 rounded-lg bg-neutral-100 p-1">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                selectedTab === tab.id
                  ? 'text-primary-600 bg-white shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* 입찰 목록 */}
      <div className="space-y-4">
        {filteredBids.length === 0 ? (
          <Card variant="outlined">
            <CardContent className="py-12 text-center">
              <div className="mb-4">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-neutral-900">
                  {selectedTab === 'active' && '진행중인 입찰이 없습니다'}
                  {selectedTab === 'won' && '낙찰된 상품이 없습니다'}
                  {selectedTab === 'lost' && '유찰된 상품이 없습니다'}
                </h3>
                <p className="mb-4 text-neutral-600">
                  {selectedTab === 'active' && '새로운 경매에 참여해보세요'}
                  {selectedTab === 'won' && '경매에 참여해보세요'}
                  {selectedTab === 'lost' && '다른 경매에 참여해보세요'}
                </p>
                <Button onClick={() => router.push('/')}>
                  {selectedTab === 'active' && '+ 첫 입찰하기'}
                  {selectedTab === 'won' && '+ 경매 둘러보기'}
                  {selectedTab === 'lost' && '+ 새 경매 참여하기'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredBids.map((bid: any) => {
            const statusBadge = getStatusBadge(bid.status)

            return (
              <Card key={bid.id} variant="outlined">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* 상품 이미지 */}
                    <div className="flex-shrink-0">
                      <div className="h-20 w-20 rounded-lg bg-neutral-200">
                        {bid.productImage ? (
                          <img
                            src={bid.productImage}
                            alt={bid.productName}
                            className="h-20 w-20 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-neutral-200">
                            <span className="text-neutral-400">📦</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 입찰 정보 */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center space-x-2">
                        <Badge variant={statusBadge.variant}>
                          {statusBadge.label}
                        </Badge>
                      </div>

                      <h3 className="mb-2 text-lg font-semibold text-neutral-900">
                        {bid.productName}
                      </h3>

                      <div className="mb-3 space-y-1 text-sm text-neutral-600">
                        <div className="flex items-center justify-between">
                          <span>내 입찰가:</span>
                          <span className="text-primary-600 font-semibold">
                            {formatPrice(bid.bidAmount)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>현재가:</span>
                          <span>{formatPrice(bid.currentPrice)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>입찰 시간:</span>
                          <span>{formatDate(bid.bidTime)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>종료 시간:</span>
                          <span>{formatDate(bid.endTime)}</span>
                        </div>
                      </div>

                      {bid.status === 'won' && (
                        <div className="bg-success-50 mb-4 rounded-lg p-3">
                          <div className="text-success-900 mb-2 text-sm font-medium">
                            🎉 축하합니다! 낙찰되었습니다!
                          </div>
                          <p className="text-success-700 text-sm">
                            판매자와 연락하여 거래를 진행하세요.
                          </p>
                        </div>
                      )}

                      {/* 액션 버튼들 */}
                      <div className="flex flex-wrap gap-2">
                        {bid.status === 'won' && (
                          <>
                            <Button size="sm" variant="outline">
                              판매자 연락처
                            </Button>
                            <Button size="sm" variant="outline">
                              거래 완료 처리
                            </Button>
                            <Button size="sm" variant="outline">
                              리뷰 작성
                            </Button>
                          </>
                        )}
                        {bid.status === 'active' && (
                          <>
                            <Button size="sm">재입찰</Button>
                            <Button size="sm" variant="outline">
                              입찰 취소
                            </Button>
                          </>
                        )}
                        {bid.status === 'lost' && (
                          <>
                            <Button size="sm">비슷한 상품 찾기</Button>
                            <Button size="sm" variant="outline">
                              관심 상품 등록
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
