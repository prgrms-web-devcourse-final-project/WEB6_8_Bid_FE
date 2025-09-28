'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Payment } from '@/types'
import { Download, Eye, Search } from 'lucide-react'
import { useState } from 'react'

interface PurchaseHistoryClientProps {
  initialPurchases: Payment[]
}

// 임시 구매 내역 데이터
const mockPurchases = [
  {
    id: '1',
    productId: '1',
    productName: 'Sony WH-1000XM4 헤드폰',
    productImage: '/images/sony-headphone.jpg',
    amount: 180000,
    status: 'completed',
    paymentMethod: 'card',
    sellerName: '오디오매니아',
    purchaseDate: '2024-01-12T00:00:00Z',
    completedDate: '2024-01-12T00:00:00Z',
  },
  {
    id: '2',
    productId: '2',
    productName: 'iPad Pro 11인치 3세대',
    productImage: '/images/ipad-pro.jpg',
    amount: 650000,
    status: 'pending',
    paymentMethod: 'card',
    sellerName: '애플전문가',
    purchaseDate: '2024-01-08T00:00:00Z',
    completedDate: null,
  },
  {
    id: '3',
    productId: '3',
    productName: '맥북 에어 M2 13인치',
    productImage: '/images/macbook-air.jpg',
    amount: 1350000,
    status: 'completed',
    paymentMethod: 'bank',
    sellerName: '애플러버',
    purchaseDate: '2024-01-06T00:00:00Z',
    completedDate: '2024-01-06T00:00:00Z',
  },
  {
    id: '4',
    productId: '4',
    productName: '나이키 에어맥스 270',
    productImage: '/images/nike-airmax.jpg',
    amount: 135000,
    status: 'completed',
    paymentMethod: 'card',
    sellerName: '신발덕후',
    purchaseDate: '2024-01-03T00:00:00Z',
    completedDate: '2024-01-03T00:00:00Z',
  },
]

const tabs = [
  { id: 'history', label: '구매 내역' },
  { id: 'payment', label: '결제 수단' },
]

export function PurchaseHistoryClient({
  initialPurchases,
}: PurchaseHistoryClientProps) {
  const [selectedTab, setSelectedTab] = useState('history')
  const [searchQuery, setSearchQuery] = useState('')
  const [purchases] = useState(mockPurchases)

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
      case 'completed':
        return { label: '완료', variant: 'success' as const }
      case 'pending':
        return { label: '대기', variant: 'warning' as const }
      case 'cancelled':
        return { label: '취소', variant: 'error' as const }
      default:
        return { label: '알 수 없음', variant: 'neutral' as const }
    }
  }

  const filteredPurchases = purchases.filter((purchase) => {
    const matchesSearch =
      searchQuery === '' ||
      purchase.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.sellerName.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  const stats = {
    totalAmount: purchases.reduce((sum, p) => sum + p.amount, 0),
    pendingAmount: purchases
      .filter((p) => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0),
    completedCount: purchases.filter((p) => p.status === 'completed').length,
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* 구매 현황 요약 */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card variant="outlined">
          <CardContent className="p-4 text-center">
            <div className="text-primary-500 text-2xl font-bold">
              {formatPrice(stats.totalAmount)}
            </div>
            <div className="text-sm text-neutral-600">총 구매 금액</div>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent className="p-4 text-center">
            <div className="text-warning-500 text-2xl font-bold">
              {formatPrice(stats.pendingAmount)}
            </div>
            <div className="text-sm text-neutral-600">결제 대기 금액</div>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent className="p-4 text-center">
            <div className="text-success-500 text-2xl font-bold">
              {stats.completedCount}
            </div>
            <div className="text-sm text-neutral-600">완료된 거래</div>
          </CardContent>
        </Card>
      </div>

      {/* 탭 */}
      <div className="mb-6">
        <div className="flex space-x-1 rounded-lg bg-neutral-100 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                selectedTab === tab.id
                  ? 'text-primary-600 bg-white shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {selectedTab === 'history' ? (
        <>
          {/* 검색바 */}
          <div className="mb-6">
            <Input
              placeholder="상품명 또는 판매자로 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-5 w-5" />}
            />
          </div>

          {/* 기간 필터 */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <select className="focus:ring-primary-500 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:outline-none">
                <option>전체 기간</option>
                <option>최근 1개월</option>
                <option>최근 3개월</option>
                <option>최근 6개월</option>
                <option>최근 1년</option>
              </select>
            </div>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              내보내기
            </Button>
          </div>

          {/* 구매 내역 목록 */}
          <div className="space-y-4">
            {filteredPurchases.length === 0 ? (
              <Card variant="outlined">
                <CardContent className="py-12 text-center">
                  <div className="mb-4">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                      <span className="text-2xl">🛒</span>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-neutral-900">
                      구매 내역이 없습니다
                    </h3>
                    <p className="text-neutral-600">
                      경매에 참여하여 상품을 구매해보세요
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredPurchases.map((purchase) => {
                const statusBadge = getStatusBadge(purchase.status)

                return (
                  <Card key={purchase.id} variant="outlined">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* 상품 이미지 */}
                        <div className="flex-shrink-0">
                          <div className="h-20 w-20 rounded-lg bg-neutral-200">
                            {purchase.productImage ? (
                              <img
                                src={purchase.productImage}
                                alt={purchase.productName}
                                className="h-20 w-20 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-neutral-200">
                                <span className="text-neutral-400">📦</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 구매 정보 */}
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex items-center space-x-2">
                            <Badge variant="primary">구매</Badge>
                            <Badge variant={statusBadge.variant}>
                              {statusBadge.label}
                            </Badge>
                          </div>

                          <h3 className="mb-2 text-lg font-semibold text-neutral-900">
                            {purchase.productName}
                          </h3>

                          <div className="mb-3 space-y-1 text-sm text-neutral-600">
                            <div className="flex items-center justify-between">
                              <span>구매일:</span>
                              <span>{formatDate(purchase.purchaseDate)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>판매자:</span>
                              <span>{purchase.sellerName}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>결제 금액:</span>
                              <span className="font-semibold text-neutral-900">
                                -{formatPrice(purchase.amount)}
                              </span>
                            </div>
                          </div>

                          {/* 액션 버튼 */}
                          <div className="flex items-center justify-end">
                            <Button size="sm" variant="outline">
                              <Eye className="mr-2 h-4 w-4" />
                              상세보기
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </>
      ) : (
        /* 결제 수단 관리 */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">
              등록된 결제 수단
            </h2>
            <Button size="sm">결제 수단 추가</Button>
          </div>

          <div className="space-y-4">
            {/* 신한카드 */}
            <Card variant="outlined">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
                      <span className="text-lg">💳</span>
                    </div>
                    <div>
                      <div className="font-medium text-neutral-900">
                        신한카드 (****-1234)
                      </div>
                      <div className="text-sm text-neutral-600">
                        만료: 12/26
                      </div>
                    </div>
                    <Badge variant="success">기본</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      편집
                    </Button>
                    <Button size="sm" variant="outline">
                      삭제
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 국민은행 */}
            <Card variant="outlined">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
                      <span className="text-lg">🏦</span>
                    </div>
                    <div>
                      <div className="font-medium text-neutral-900">
                        국민은행 (****-12-123456)
                      </div>
                      <div className="text-sm text-neutral-600">계좌번호</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      기본으로 설정
                    </Button>
                    <Button size="sm" variant="outline">
                      편집
                    </Button>
                    <Button size="sm" variant="outline">
                      삭제
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
