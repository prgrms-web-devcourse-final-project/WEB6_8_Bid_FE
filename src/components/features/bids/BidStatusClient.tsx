'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Bid } from '@/types'
import { useState } from 'react'

interface BidStatusClientProps {
  initialBids: Bid[]
}

// 임시 입찰 데이터
const mockBids = [
  {
    id: '1',
    productId: '1',
    productName: 'Sony WH-1000XM4 헤드폰',
    productImage: '/images/sony-headphone.jpg',
    bidAmount: 180000,
    currentPrice: 180000,
    status: 'won',
    bidTime: '2024-01-12T15:30:00Z',
    endTime: '2024-01-12T18:00:00Z',
    sellerName: '오디오매니아',
    sellerTrustScore: 98,
    isHighestBid: true,
  },
  {
    id: '2',
    productId: '2',
    productName: 'iPad Pro 11인치 3세대',
    productImage: '/images/ipad-pro.jpg',
    bidAmount: 650000,
    currentPrice: 650000,
    status: 'completed',
    bidTime: '2024-01-08T14:20:00Z',
    endTime: '2024-01-08T16:00:00Z',
    sellerName: '애플전문가',
    sellerTrustScore: 94,
    isHighestBid: true,
  },
  {
    id: '3',
    productId: '3',
    productName: 'iPhone 14 Pro 128GB',
    productImage: '/images/iphone-14.jpg',
    bidAmount: 950000,
    currentPrice: 950000,
    status: 'active',
    bidTime: '2024-01-15T19:30:00Z',
    endTime: '2024-01-20T20:00:00Z',
    sellerName: '스마트폰전문가',
    sellerTrustScore: 92,
    isHighestBid: true,
  },
  {
    id: '4',
    productId: '4',
    productName: 'MacBook Air M2 13인치',
    productImage: '/images/macbook-air.jpg',
    bidAmount: 1300000,
    currentPrice: 1350000,
    status: 'active',
    bidTime: '2024-01-15T18:45:00Z',
    endTime: '2024-01-20T20:00:00Z',
    sellerName: '애플전문가',
    sellerTrustScore: 94,
    isHighestBid: false,
  },
  {
    id: '5',
    productId: '5',
    productName: 'Nintendo Switch OLED',
    productImage: '/images/switch-oled.jpg',
    bidAmount: 280000,
    currentPrice: 295000,
    status: 'lost',
    bidTime: '2024-01-10T16:00:00Z',
    endTime: '2024-01-10T18:00:00Z',
    sellerName: '게임전문가',
    sellerTrustScore: 89,
    isHighestBid: false,
  },
  {
    id: '6',
    productId: '6',
    productName: '에어팟 프로 2세대',
    productImage: '/images/airpods-pro.jpg',
    bidAmount: 220000,
    currentPrice: 235000,
    status: 'lost',
    bidTime: '2024-01-05T14:30:00Z',
    endTime: '2024-01-05T16:00:00Z',
    sellerName: '오디오매니아',
    sellerTrustScore: 98,
    isHighestBid: false,
  },
]

const statusTabs = [
  { id: 'active', label: '진행중', count: 2 },
  { id: 'won', label: '낙찰', count: 2 },
  { id: 'lost', label: '낙찰실패', count: 2 },
  { id: 'watchlist', label: '관심목록', count: 0 },
]

export function BidStatusClient({ initialBids }: BidStatusClientProps) {
  const [selectedTab, setSelectedTab] = useState('won')
  const [bids] = useState(mockBids)

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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { label: '진행중', variant: 'primary' as const }
      case 'won':
        return { label: '연락 대기', variant: 'neutral' as const }
      case 'completed':
        return { label: '거래완료', variant: 'success' as const }
      case 'lost':
        return { label: '낙찰실패', variant: 'warning' as const }
      default:
        return { label: '알 수 없음', variant: 'neutral' as const }
    }
  }

  const filteredBids = bids.filter((bid) => {
    if (selectedTab === 'active') return bid.status === 'active'
    if (selectedTab === 'won') return bid.status === 'won'
    if (selectedTab === 'lost') return bid.status === 'lost'
    if (selectedTab === 'watchlist') return false // 관심목록은 별도 구현
    return true
  })

  const stats = {
    active: bids.filter((b) => b.status === 'active').length,
    won: bids.filter((b) => b.status === 'won').length,
    lost: bids.filter((b) => b.status === 'lost').length,
    successRate:
      Math.round(
        (bids.filter((b) => b.status === 'won').length /
          bids.filter((b) => b.status !== 'active').length) *
          100,
      ) || 0,
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
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
            <div className="text-sm text-neutral-600">낙찰실패</div>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-500">
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
                  {selectedTab === 'lost' && '낙찰실패한 상품이 없습니다'}
                  {selectedTab === 'watchlist' && '관심목록이 없습니다'}
                </h3>
                <p className="mb-4 text-neutral-600">
                  {selectedTab === 'active' && '새로운 경매에 참여해보세요'}
                  {selectedTab === 'won' && '경매에 참여해보세요'}
                  {selectedTab === 'lost' && '다른 경매에 참여해보세요'}
                  {selectedTab === 'watchlist' && '관심있는 상품을 찜해보세요'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredBids.map((bid) => {
            const statusBadge = getStatusBadge(bid.status)

            return (
              <Card key={bid.id} variant="outlined">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* 상품 이미지 */}
                    <div className="flex-shrink-0">
                      <div className="relative">
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
                        {bid.isHighestBid && bid.status === 'active' && (
                          <Badge
                            variant="success"
                            className="absolute -top-1 -right-1"
                          >
                            최고가
                          </Badge>
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
                          <span className="font-semibold text-neutral-900">
                            {formatPrice(bid.bidAmount)}
                          </span>
                        </div>
                        {bid.status === 'active' && (
                          <div className="flex items-center justify-between">
                            <span>현재 최고가:</span>
                            <span className="text-success-600 font-semibold">
                              {formatPrice(bid.currentPrice)}
                            </span>
                          </div>
                        )}
                        {bid.status === 'won' && (
                          <div className="flex items-center justify-between">
                            <span>낙찰가:</span>
                            <span className="text-success-600 font-semibold">
                              {formatPrice(bid.bidAmount)}
                            </span>
                          </div>
                        )}
                        {bid.status === 'lost' && (
                          <div className="flex items-center justify-between">
                            <span>최종 가격:</span>
                            <span className="font-semibold text-neutral-900">
                              {formatPrice(bid.currentPrice)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span>입찰 시간:</span>
                          <span>{formatDateTime(bid.bidTime)}</span>
                        </div>
                        {bid.status === 'won' && (
                          <div className="flex items-center justify-between">
                            <span>판매자:</span>
                            <span>
                              {bid.sellerName} (신뢰도 [{bid.sellerTrustScore}
                              점])
                            </span>
                          </div>
                        )}
                      </div>

                      {/* 낙찰 안내 메시지 */}
                      {bid.status === 'won' && (
                        <div className="border-primary-200 bg-primary-50 mb-4 rounded-lg border p-3">
                          <p className="text-primary-800 text-sm">
                            축하합니다! 경매에서 낙찰되었습니다. 판매자와
                            연락하여 거래를 진행하세요.
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
                          </>
                        )}
                        {bid.status === 'completed' && (
                          <>
                            <Button size="sm" variant="outline">
                              판매자 연락처
                            </Button>
                            <Button size="sm" variant="outline">
                              거래 후기 작성
                            </Button>
                          </>
                        )}
                        {bid.status === 'active' && (
                          <>
                            <Button size="sm" variant="outline">
                              상세보기
                            </Button>
                            {!bid.isHighestBid && (
                              <Button size="sm">재입찰</Button>
                            )}
                          </>
                        )}
                        {bid.status === 'lost' && (
                          <>
                            <Button size="sm" variant="outline">
                              상세보기
                            </Button>
                            <Button size="sm">유사 상품 찾기</Button>
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
