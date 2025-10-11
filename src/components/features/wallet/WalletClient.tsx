'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ErrorAlert } from '@/components/ui/error-alert'
import { cashApi } from '@/lib/api'
import { CreditCard, DollarSign, History } from 'lucide-react'
import { useEffect, useState } from 'react'

interface CashTransaction {
  transactionId: number
  cashId: number
  type: string
  amount: number
  balanceAfter: number
  createdAt: string
  related?: {
    type: string
    id: number
    product?: {
      productId: number
      productName: string
      thumbnailUrl: string
    }
    summary?: string
  }
}

interface CashResponse {
  cashId: number
  memberId: number
  balance: number
  createDate: string
  modifyDate: string
}

export function WalletClient() {
  const [cashInfo, setCashInfo] = useState<CashResponse | null>(null)
  const [transactions, setTransactions] = useState<CashTransaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'balance' | 'transactions'>(
    'balance',
  )

  // 지갑 정보 로드
  useEffect(() => {
    const loadCashInfo = async () => {
      try {
        setIsLoading(true)
        setError('')

        const response = await cashApi.getMyCash()
        if (response.success) {
          setCashInfo(response.data)
        } else {
          setError('지갑 정보를 불러오는데 실패했습니다.')
        }
      } catch (err) {
        console.error('지갑 정보 로드 에러:', err)
        setError('지갑 정보를 불러오는데 실패했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    loadCashInfo()
  }, [])

  // 거래 내역 로드
  const loadTransactions = async () => {
    try {
      setIsLoading(true)
      setError('')

      const response = await cashApi.getCashTransactions({
        page: 1,
        size: 20,
      })

      if (response.success) {
        setTransactions(response.data?.items || [])
      } else {
        setError('거래 내역을 불러오는데 실패했습니다.')
      }
    } catch (err) {
      console.error('거래 내역 로드 에러:', err)
      setError('거래 내역을 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTransactionType = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return { label: '입금', variant: 'success' as const, icon: '💰' }
      case 'WITHDRAWAL':
        return { label: '출금', variant: 'error' as const, icon: '💸' }
      case 'PAYMENT':
        return { label: '결제', variant: 'warning' as const, icon: '💳' }
      case 'REFUND':
        return { label: '환불', variant: 'primary' as const, icon: '↩️' }
      default:
        return { label: '기타', variant: 'neutral' as const, icon: '📝' }
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      {/* 에러 메시지 */}
      {error && (
        <div className="mb-6">
          <ErrorAlert
            title="지갑 로드 실패"
            message={error}
            onClose={() => setError('')}
          />
        </div>
      )}

      {/* 탭 네비게이션 */}
      <div className="mb-6">
        <div className="flex space-x-1 rounded-lg bg-neutral-100 p-1">
          <button
            onClick={() => setActiveTab('balance')}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'balance'
                ? 'text-primary-600 bg-white shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <DollarSign className="mr-2 inline h-4 w-4" />
            잔액 조회
          </button>
          <button
            onClick={() => {
              setActiveTab('transactions')
              if (transactions.length === 0) {
                loadTransactions()
              }
            }}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'transactions'
                ? 'text-primary-600 bg-white shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <History className="mr-2 inline h-4 w-4" />
            거래 내역
          </button>
        </div>
      </div>

      {/* 잔액 조회 탭 */}
      {activeTab === 'balance' && (
        <div className="space-y-6">
          {isLoading ? (
            <Card variant="outlined">
              <CardContent className="py-12 text-center">
                <div className="border-primary-200 border-t-primary-600 mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4"></div>
                <h3 className="text-lg font-semibold text-neutral-900">
                  지갑 정보를 불러오는 중...
                </h3>
              </CardContent>
            </Card>
          ) : cashInfo ? (
            <div className="grid gap-6 md:grid-cols-2">
              {/* 잔액 카드 */}
              <Card variant="outlined">
                <CardHeader>
                  <h3 className="flex items-center text-lg font-semibold">
                    <DollarSign className="text-primary-600 mr-2 h-5 w-5" />
                    현재 잔액
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="text-primary-600 text-3xl font-bold">
                    {formatPrice(cashInfo.balance)}
                  </div>
                  <p className="mt-2 text-sm text-neutral-600">
                    지갑 ID: {cashInfo.cashId}
                  </p>
                </CardContent>
              </Card>

              {/* 지갑 정보 */}
              <Card variant="outlined">
                <CardHeader>
                  <h3 className="flex items-center text-lg font-semibold">
                    <CreditCard className="mr-2 h-5 w-5 text-neutral-600" />
                    지갑 정보
                  </h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">생성일:</span>
                    <span>{formatDate(cashInfo.createDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">수정일:</span>
                    <span>{formatDate(cashInfo.modifyDate)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card variant="outlined">
              <CardContent className="py-12 text-center">
                <div className="mb-4">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                    <DollarSign className="h-8 w-8 text-neutral-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-neutral-900">
                    지갑이 없습니다
                  </h3>
                  <p className="text-neutral-600">
                    아직 지갑이 생성되지 않았습니다.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* 거래 내역 탭 */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          {isLoading ? (
            <Card variant="outlined">
              <CardContent className="py-12 text-center">
                <div className="border-primary-200 border-t-primary-600 mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4"></div>
                <h3 className="text-lg font-semibold text-neutral-900">
                  거래 내역을 불러오는 중...
                </h3>
              </CardContent>
            </Card>
          ) : transactions.length === 0 ? (
            <Card variant="outlined">
              <CardContent className="py-12 text-center">
                <div className="mb-4">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                    <History className="h-8 w-8 text-neutral-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-neutral-900">
                    거래 내역이 없습니다
                  </h3>
                  <p className="text-neutral-600">아직 거래 내역이 없습니다.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            transactions.map((transaction) => {
              const typeInfo = getTransactionType(transaction.type)
              const isPositive =
                transaction.type === 'DEPOSIT' || transaction.type === 'REFUND'

              return (
                <Card key={transaction.transactionId} variant="outlined">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
                            <span className="text-2xl">{typeInfo.icon}</span>
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex items-center space-x-2">
                            <Badge variant={typeInfo.variant}>
                              {typeInfo.label}
                            </Badge>
                          </div>

                          <div className="mb-3 space-y-1 text-sm text-neutral-600">
                            <div className="flex items-center justify-between">
                              <span>거래 ID:</span>
                              <span>{transaction.transactionId}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>거래 금액:</span>
                              <span
                                className={`font-semibold ${
                                  isPositive
                                    ? 'text-success-600'
                                    : 'text-error-600'
                                }`}
                              >
                                {isPositive ? '+' : '-'}
                                {formatPrice(transaction.amount)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>잔액:</span>
                              <span className="text-primary-600 font-semibold">
                                {formatPrice(transaction.balanceAfter)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>거래일:</span>
                              <span>{formatDate(transaction.createdAt)}</span>
                            </div>
                            {transaction.related && (
                              <div className="flex items-center justify-between">
                                <span>관련:</span>
                                <span className="text-xs">
                                  {transaction.related.summary ||
                                    `${transaction.related.type} #${transaction.related.id}`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
