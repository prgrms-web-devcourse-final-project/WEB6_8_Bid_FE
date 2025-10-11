'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ErrorAlert } from '@/components/ui/error-alert'
import { Input } from '@/components/ui/input'
import { paymentApi } from '@/lib/api'
import { Download, Eye, MessageSquare, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Payment {
  paymentId: number
  status: string
  amount: number
  provider: string
  methodType: 'CARD' | 'BANK'
  createdAt: string
  paidAt?: string
  cashTransactionId?: number
  balanceAfter?: number
}

interface PurchaseHistoryClientProps {
  initialPurchases?: Payment[]
}

export function PurchaseHistoryClient({
  initialPurchases = [],
}: PurchaseHistoryClientProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [purchases, setPurchases] = useState<Payment[]>(initialPurchases)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // 결제 내역 로드
  useEffect(() => {
    const loadPayments = async () => {
      try {
        setIsLoading(true)
        setError('')

        const response = await paymentApi.getMyPayments({
          page: 1,
          size: 50,
        })

        if (response.success) {
          setPurchases(response.data?.items || [])
        } else {
          setError('결제 내역을 불러오는데 실패했습니다.')
        }
      } catch (err) {
        console.error('결제 내역 로드 에러:', err)
        setError('결제 내역을 불러오는데 실패했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    loadPayments()
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
      case 'completed':
        return { label: '완료', variant: 'success' as const }
      case 'pending':
        return { label: '대기중', variant: 'warning' as const }
      case 'cancelled':
        return { label: '취소됨', variant: 'error' as const }
      default:
        return { label: '알 수 없음', variant: 'neutral' as const }
    }
  }

  const filteredPurchases = purchases.filter((purchase) => {
    const matchesSearch =
      searchQuery === '' ||
      purchase.provider?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.methodType?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      selectedStatus === 'all' || purchase.status === selectedStatus

    return matchesSearch && matchesStatus
  })

  const stats = {
    total: purchases.length,
    completed: purchases.filter((p) => p.status === 'completed').length,
    pending: purchases.filter((p) => p.status === 'pending').length,
    cancelled: purchases.filter((p) => p.status === 'cancelled').length,
    totalAmount: purchases
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + (p.amount || 0), 0),
  }

  const statusTabs = [
    { id: 'all', label: '전체', count: stats.total },
    { id: 'completed', label: '완료', count: stats.completed },
    { id: 'pending', label: '대기중', count: stats.pending },
    { id: 'cancelled', label: '취소됨', count: stats.cancelled },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* 에러 메시지 */}
      {error && (
        <div className="mb-6">
          <ErrorAlert
            title="결제 내역 로드 실패"
            message={error}
            onClose={() => setError('')}
          />
        </div>
      )}

      {/* 구매 현황 요약 */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card variant="outlined">
          <CardContent className="p-4 text-center">
            <div className="text-primary-500 text-2xl font-bold">
              {stats.total}
            </div>
            <div className="text-sm text-neutral-600">전체 구매</div>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent className="p-4 text-center">
            <div className="text-success-500 text-2xl font-bold">
              {stats.completed}
            </div>
            <div className="text-sm text-neutral-600">완료</div>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent className="p-4 text-center">
            <div className="text-warning-500 text-2xl font-bold">
              {stats.pending}
            </div>
            <div className="text-sm text-neutral-600">대기중</div>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent className="p-4 text-center">
            <div className="text-lg font-bold text-neutral-900">
              {formatPrice(stats.totalAmount)}
            </div>
            <div className="text-sm text-neutral-600">총 구매금액</div>
          </CardContent>
        </Card>
      </div>

      {/* 검색 및 필터 */}
      <div className="mb-6">
        <div className="mb-4 flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              placeholder="상품명이나 판매자명으로 검색하세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* 상태 탭 */}
        <div className="flex space-x-1 rounded-lg bg-neutral-100 p-1">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                selectedStatus === tab.id
                  ? 'text-primary-600 bg-white shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* 구매 내역 목록 */}
      <div className="space-y-4">
        {isLoading ? (
          <Card variant="outlined">
            <CardContent className="py-12 text-center">
              <div className="mb-4">
                <div className="border-primary-200 border-t-primary-600 mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4"></div>
                <h3 className="text-lg font-semibold text-neutral-900">
                  결제 내역을 불러오는 중...
                </h3>
              </div>
            </CardContent>
          </Card>
        ) : filteredPurchases.length === 0 ? (
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
                  {searchQuery
                    ? '검색 결과가 없습니다. 다른 키워드로 시도해보세요.'
                    : '아직 구매한 상품이 없습니다.'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredPurchases.map((purchase) => {
            const statusBadge = getStatusBadge(purchase.status)

            return (
              <Card key={purchase.paymentId} variant="outlined">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* 결제 아이콘 */}
                    <div className="flex-shrink-0">
                      <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-neutral-200">
                        <span className="text-2xl">
                          {purchase.methodType === 'CARD' ? '💳' : '🏦'}
                        </span>
                      </div>
                    </div>

                    {/* 결제 정보 */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center space-x-2">
                        <Badge variant={statusBadge.variant}>
                          {statusBadge.label}
                        </Badge>
                        <Badge variant="neutral">{purchase.methodType}</Badge>
                      </div>

                      <h3 className="mb-2 text-lg font-semibold text-neutral-900">
                        결제 ID: {purchase.paymentId}
                      </h3>

                      <div className="mb-3 space-y-1 text-sm text-neutral-600">
                        <div className="flex items-center justify-between">
                          <span>결제 금액:</span>
                          <span className="text-primary-600 font-semibold">
                            {formatPrice(purchase.amount || 0)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>결제 수단:</span>
                          <span>{purchase.provider}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>결제일:</span>
                          <span>{formatDate(purchase.createdAt)}</span>
                        </div>
                        {purchase.paidAt && (
                          <div className="flex items-center justify-between">
                            <span>완료일:</span>
                            <span>{formatDate(purchase.paidAt)}</span>
                          </div>
                        )}
                        {purchase.balanceAfter && (
                          <div className="flex items-center justify-between">
                            <span>잔액:</span>
                            <span>{formatPrice(purchase.balanceAfter)}</span>
                          </div>
                        )}
                      </div>

                      {/* 액션 버튼들 */}
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="mr-1 h-3 w-3" />
                          상세보기
                        </Button>
                        {purchase.status === 'completed' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                router.push(
                                  `/review?productId=${purchase.paymentId}`,
                                )
                              }
                            >
                              <MessageSquare className="mr-1 h-3 w-3" />
                              리뷰 작성
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="mr-1 h-3 w-3" />
                              영수증
                            </Button>
                          </>
                        )}
                        {purchase.status === 'pending' && (
                          <Button size="sm" variant="outline">
                            결제 완료 처리
                          </Button>
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
