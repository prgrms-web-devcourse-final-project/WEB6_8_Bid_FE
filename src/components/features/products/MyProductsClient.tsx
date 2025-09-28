'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Product } from '@/types'
import { useState } from 'react'

interface MyProductsClientProps {
  initialProducts: Product[]
}

// 임시 내 상품 데이터
const mockMyProducts = [
  {
    id: '1',
    name: '갤럭시 S23 Ultra 256GB',
    description:
      '갤럭시 S23 Ultra 256GB 스마트폰입니다. 상태 양호하며 박스와 액세서리 포함입니다.',
    startingPrice: 800000,
    currentPrice: 850000,
    images: ['/images/galaxy-s23.jpg'],
    category: 'electronics',
    status: 'sold',
    endTime: '2024-01-10T18:00:00Z',
    bidCount: 18,
    winner: '낙찰자A',
    createdAt: '2024-01-05T00:00:00Z',
  },
  {
    id: '2',
    name: '애플워치 SE 2세대',
    description:
      '애플워치 SE 2세대 44mm GPS 모델입니다. 사용감 적고 상태 양호합니다.',
    startingPrice: 250000,
    currentPrice: 280000,
    images: ['/images/apple-watch-se.jpg'],
    category: 'electronics',
    status: 'sold',
    endTime: '2024-01-08T15:30:00Z',
    bidCount: 12,
    winner: '낙찰자B',
    createdAt: '2024-01-03T00:00:00Z',
  },
  {
    id: '3',
    name: '나이키 에어맥스 270',
    description:
      '나이키 에어맥스 270 화이트 컬러 270mm입니다. 몇 번 신었지만 상태 양호합니다.',
    startingPrice: 80000,
    currentPrice: 95000,
    images: ['/images/nike-airmax.jpg'],
    category: 'fashion',
    status: 'active',
    endTime: '2024-01-20T20:00:00Z',
    bidCount: 5,
    winner: null,
    createdAt: '2024-01-15T00:00:00Z',
  },
]

const statusTabs = [
  { id: 'active', label: '판매중', count: 1 },
  { id: 'sold', label: '판매완료', count: 2 },
  { id: 'failed', label: '유찰', count: 0 },
]

export function MyProductsClient({ initialProducts }: MyProductsClientProps) {
  const [selectedTab, setSelectedTab] = useState('sold')
  const [products] = useState(mockMyProducts)

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
      case 'sold':
        return { label: '낙찰완료', variant: 'success' as const }
      case 'failed':
        return { label: '유찰', variant: 'warning' as const }
      default:
        return { label: '알 수 없음', variant: 'neutral' as const }
    }
  }

  const filteredProducts = products.filter((product) => {
    if (selectedTab === 'active') return product.status === 'active'
    if (selectedTab === 'sold') return product.status === 'sold'
    if (selectedTab === 'failed') return product.status === 'failed'
    return true
  })

  const totalSales = products
    .filter((p) => p.status === 'sold')
    .reduce((sum, p) => sum + p.currentPrice, 0)

  const stats = {
    active: products.filter((p) => p.status === 'active').length,
    sold: products.filter((p) => p.status === 'sold').length,
    failed: products.filter((p) => p.status === 'failed').length,
    totalSales,
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* 판매 현황 요약 */}
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
              {stats.sold}
            </div>
            <div className="text-sm text-neutral-600">판매완료</div>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent className="p-4 text-center">
            <div className="text-warning-500 text-2xl font-bold">
              {stats.failed}
            </div>
            <div className="text-sm text-neutral-600">유찰</div>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent className="p-4 text-center">
            <div className="text-lg font-bold text-neutral-900">
              {formatPrice(stats.totalSales)}
            </div>
            <div className="text-sm text-neutral-600">총 판매금액</div>
          </CardContent>
        </Card>
      </div>

      {/* 상품 목록 탭 */}
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

      {/* 상품 목록 */}
      <div className="space-y-4">
        {filteredProducts.length === 0 ? (
          <Card variant="outlined">
            <CardContent className="py-12 text-center">
              <div className="mb-4">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                  <span className="text-2xl">📦</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-neutral-900">
                  {selectedTab === 'active' && '현재 진행중인 경매가 없습니다'}
                  {selectedTab === 'sold' && '판매완료된 상품이 없습니다'}
                  {selectedTab === 'failed' && '유찰된 상품이 없습니다'}
                </h3>
                <p className="mb-4 text-neutral-600">
                  {selectedTab === 'active' && '새로운 상품을 등록해보세요'}
                  {selectedTab === 'sold' && '상품을 판매해보세요'}
                  {selectedTab === 'failed' && '다시 경매에 올려보세요'}
                </p>
                <Button>
                  {selectedTab === 'active' && '+ 첫 상품 등록하기'}
                  {selectedTab === 'sold' && '+ 새 상품 등록하기'}
                  {selectedTab === 'failed' && '+ 상품 재등록하기'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredProducts.map((product) => {
            const statusBadge = getStatusBadge(product.status)

            return (
              <Card key={product.id} variant="outlined">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* 상품 이미지 */}
                    <div className="flex-shrink-0">
                      <div className="h-20 w-20 rounded-lg bg-neutral-200">
                        {product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-20 w-20 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-neutral-200">
                            <span className="text-neutral-400">📦</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 상품 정보 */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center space-x-2">
                        <Badge variant={statusBadge.variant}>
                          {statusBadge.label}
                        </Badge>
                      </div>

                      <h3 className="mb-2 text-lg font-semibold text-neutral-900">
                        {product.name}
                      </h3>

                      <div className="mb-3 space-y-1 text-sm text-neutral-600">
                        <div className="flex items-center justify-between">
                          <span>최종 낙찰가:</span>
                          <span className="text-success-600 font-semibold">
                            {formatPrice(product.currentPrice)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>참여자 수:</span>
                          <span>{product.bidCount}명</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>종료일:</span>
                          <span>{formatDate(product.endTime)}</span>
                        </div>
                      </div>

                      {product.status === 'sold' && product.winner && (
                        <div className="mb-4 rounded-lg bg-neutral-50 p-3">
                          <div className="mb-2 text-sm font-medium text-neutral-900">
                            낙찰자: {product.winner}
                          </div>
                          <p className="text-sm text-neutral-600">
                            거래를 위해 연락처를 확인하세요.
                          </p>
                        </div>
                      )}

                      {/* 액션 버튼들 */}
                      <div className="flex flex-wrap gap-2">
                        {product.status === 'sold' && (
                          <>
                            <Button size="sm" variant="outline">
                              낙찰자 연락처
                            </Button>
                            <Button size="sm" variant="outline">
                              거래 완료 처리
                            </Button>
                            <Button size="sm" variant="outline">
                              리뷰 보기
                            </Button>
                          </>
                        )}
                        {product.status === 'active' && (
                          <>
                            <Button size="sm" variant="outline">
                              경매 수정
                            </Button>
                            <Button size="sm" variant="outline">
                              경매 중단
                            </Button>
                          </>
                        )}
                        {product.status === 'failed' && (
                          <>
                            <Button size="sm">재경매 등록</Button>
                            <Button size="sm" variant="outline">
                              상품 삭제
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
