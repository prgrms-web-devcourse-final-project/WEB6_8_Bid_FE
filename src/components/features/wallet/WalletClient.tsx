'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTossPayments } from '@/hooks/useTossPayments'
import { cashApi, paymentMethodApi, tossApi } from '@/lib/api'
import { CreditCard, DollarSign, History, Plus, Settings } from 'lucide-react'
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

interface PaymentMethod {
  id: number
  type: string
  alias: string
  isDefault: boolean
  provider: string
  brand?: string
  last4?: string
  expMonth?: number
  expYear?: number
  bankCode?: string
  bankName?: string
  acctLast4?: string
  createDate: string
  modifyDate: string
  expireDate?: string
}

export function WalletClient() {
  const [cashInfo, setCashInfo] = useState<CashResponse | null>(null)
  const [transactions, setTransactions] = useState<CashTransaction[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<
    'balance' | 'transactions' | 'paymentMethods'
  >('balance')

  // 충전 관련 상태
  const [isChargeDialogOpen, setIsChargeDialogOpen] = useState(false)
  const [chargeAmount, setChargeAmount] = useState('')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('')
  const [isCharging, setIsCharging] = useState(false)

  // 결제수단 관리 관련 상태
  const [showAddForm, setShowAddForm] = useState(false)
  const [addFormData, setAddFormData] = useState({
    type: 'card',
    alias: '',
    token: '',
    brand: '',
    last4: '',
    expMonth: '',
    expYear: '',
    bankCode: '',
    bankName: '',
    acctLast4: '',
    provider: 'toss',
  })
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editFormData, setEditFormData] = useState({
    alias: '',
    isDefault: false,
  })
  const [isEditing, setIsEditing] = useState(false)

  // 토스 결제 SDK 훅
  const {
    isLoaded: isTossLoaded,
    error: tossError,
    createTossPayments,
  } = useTossPayments()

  // 지갑 정보 및 결제수단 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError('')

        // 지갑 정보 로드
        const cashResponse = await cashApi.getMyCash()
        if (cashResponse.success) {
          setCashInfo(cashResponse.data)
        }

        // 결제수단 목록 로드
        const paymentMethodsResponse =
          await paymentMethodApi.getPaymentMethods()
        console.log('💳 결제수단 목록 응답:', paymentMethodsResponse)

        if (paymentMethodsResponse.success && paymentMethodsResponse.data) {
          // API 응답 데이터 구조에 맞게 변환
          let paymentMethodsData = []
          if (Array.isArray(paymentMethodsResponse.data)) {
            paymentMethodsData = paymentMethodsResponse.data
          } else if (
            paymentMethodsResponse.data.content &&
            Array.isArray(paymentMethodsResponse.data.content)
          ) {
            paymentMethodsData = paymentMethodsResponse.data.content
          }
          setPaymentMethods(paymentMethodsData)
        } else {
          console.error('결제수단 로드 실패:', paymentMethodsResponse.msg)
        }
      } catch (err) {
        console.error('데이터 로드 에러:', err)
        setError('데이터를 불러오는데 실패했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
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

  // 충전 처리
  const handleCharge = async () => {
    if (!chargeAmount || !selectedPaymentMethod) {
      alert('충전 금액과 결제수단을 선택해주세요.')
      return
    }

    const amount = parseInt(chargeAmount)
    if (amount < 1000) {
      alert('최소 충전 금액은 1,000원입니다.')
      return
    }

    try {
      setIsCharging(true)

      // 1. 멱등키 발급
      const idempotencyResponse = await tossApi.getIdempotencyKey()
      if (!idempotencyResponse.success) {
        throw new Error('멱등키 발급에 실패했습니다.')
      }

      // 2. 지갑 충전 요청
      const chargeResponse = await tossApi.chargeWallet({
        paymentMethodId: parseInt(selectedPaymentMethod),
        amount: amount,
        idempotencyKey: idempotencyResponse.data.idempotencyKey,
      })

      if (chargeResponse.success) {
        alert('충전이 완료되었습니다!')
        setIsChargeDialogOpen(false)
        setChargeAmount('')
        setSelectedPaymentMethod('')

        // 지갑 정보 새로고침
        const cashResponse = await cashApi.getMyCash()
        if (cashResponse.success) {
          setCashInfo(cashResponse.data)
        }
      } else {
        throw new Error(chargeResponse.msg || '충전에 실패했습니다.')
      }
    } catch (err) {
      console.error('충전 에러:', err)
      alert(
        `충전에 실패했습니다: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
      )
    } finally {
      setIsCharging(false)
    }
  }

  // 결제수단 등록 (토스 팝업)
  const handleAddPaymentMethod = async () => {
    try {
      // 1. 토스 빌링 인증 파라미터 조회
      const authParamsResponse = await tossApi.getBillingAuthParams()
      if (!authParamsResponse.success) {
        throw new Error('결제수단 등록 정보를 가져오는데 실패했습니다.')
      }

      const { clientKey, customerKey, successUrl, failUrl } =
        authParamsResponse.data

      // 2. 토스 SDK로 카드 등록 팝업 띄우기
      if (isTossLoaded) {
        try {
          const tossPayments = createTossPayments(clientKey)

          tossPayments.requestBillingAuth('카드', {
            customerKey: customerKey,
            successUrl: successUrl,
            failUrl: failUrl,
          })
        } catch (tossError) {
          console.error('토스 SDK 에러:', tossError)
          // 토스 SDK 에러 시 대체 방법 사용
          const currentUrl = window.location.origin
          const fullSuccessUrl = `${currentUrl}/payments/toss/billing-success`
          const fullFailUrl = `${currentUrl}/payments/toss/billing-fail`

          window.location.href = `/api/proxy/api/v1/payments/toss/billing-auth?customerKey=${customerKey}&successUrl=${encodeURIComponent(fullSuccessUrl)}&failUrl=${encodeURIComponent(fullFailUrl)}`
        }
      } else {
        // 토스 SDK가 로드되지 않은 경우 직접 페이지 이동
        const currentUrl = window.location.origin
        const fullSuccessUrl = `${currentUrl}/payments/toss/billing-success`
        const fullFailUrl = `${currentUrl}/payments/toss/billing-fail`

        window.location.href = `/api/proxy/api/v1/payments/toss/billing-auth?customerKey=${customerKey}&successUrl=${encodeURIComponent(fullSuccessUrl)}&failUrl=${encodeURIComponent(fullFailUrl)}`
      }
    } catch (err) {
      console.error('결제수단 등록 에러:', err)
      alert(
        `결제수단 등록에 실패했습니다: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
      )
    }
  }

  // 결제수단 삭제
  const handleDeletePaymentMethod = async (id: number) => {
    if (!confirm('정말로 이 결제 수단을 삭제하시겠습니까?')) {
      return
    }

    try {
      const response = await paymentMethodApi.deletePaymentMethod(id)
      if (response.success) {
        setPaymentMethods((prev) => prev.filter((method) => method.id !== id))
        alert('결제 수단이 삭제되었습니다.')
      } else {
        alert(response.msg || '결제 수단 삭제에 실패했습니다.')
      }
    } catch (err: any) {
      console.error('결제 수단 삭제 에러:', err)
      alert(err.response?.data?.msg || '결제 수단 삭제에 실패했습니다.')
    }
  }

  // 결제수단 추가
  const handleAddPaymentMethodForm = async () => {
    setIsAdding(true)
    try {
      const response = await paymentMethodApi.createPaymentMethod({
        type: addFormData.type,
        token: addFormData.token,
        alias: addFormData.alias,
        brand: addFormData.type === 'card' ? addFormData.brand : undefined,
        last4: addFormData.type === 'card' ? addFormData.last4 : undefined,
        expMonth:
          addFormData.type === 'card'
            ? parseInt(addFormData.expMonth)
            : undefined,
        expYear:
          addFormData.type === 'card'
            ? parseInt(addFormData.expYear)
            : undefined,
        bankCode:
          addFormData.type === 'bank' ? addFormData.bankCode : undefined,
        bankName:
          addFormData.type === 'bank' ? addFormData.bankName : undefined,
        acctLast4:
          addFormData.type === 'bank' ? addFormData.acctLast4 : undefined,
        provider: addFormData.provider,
      })

      if (response.success) {
        alert('결제수단이 성공적으로 추가되었습니다.')
        setShowAddForm(false)
        setAddFormData({
          type: 'card',
          alias: '',
          token: '',
          brand: '',
          last4: '',
          expMonth: '',
          expYear: '',
          bankCode: '',
          bankName: '',
          acctLast4: '',
          provider: 'toss',
        })
        // 목록 새로고침
        const listResponse = await paymentMethodApi.getPaymentMethods()
        if (listResponse.success && listResponse.data) {
          let paymentMethodsData = []
          if (Array.isArray(listResponse.data)) {
            paymentMethodsData = listResponse.data
          } else if (
            listResponse.data.content &&
            Array.isArray(listResponse.data.content)
          ) {
            paymentMethodsData = listResponse.data.content
          }
          setPaymentMethods(paymentMethodsData)
        }
      } else {
        alert(response.msg || '결제수단 추가에 실패했습니다.')
      }
    } catch (err: any) {
      console.error('결제수단 추가 에러:', err)
      alert(err.response?.data?.msg || '결제수단 추가에 실패했습니다.')
    }
    setIsAdding(false)
  }

  // 결제수단 수정
  const handleEditPaymentMethod = async () => {
    if (!editingId) return

    setIsEditing(true)
    try {
      const response = await paymentMethodApi.updatePaymentMethod(editingId, {
        alias: editFormData.alias,
        isDefault: editFormData.isDefault,
      })

      if (response.success) {
        alert('결제수단이 성공적으로 수정되었습니다.')
        setEditingId(null)
        setEditFormData({ alias: '', isDefault: false })
        // 목록 새로고침
        const listResponse = await paymentMethodApi.getPaymentMethods()
        if (listResponse.success && listResponse.data) {
          let paymentMethodsData = []
          if (Array.isArray(listResponse.data)) {
            paymentMethodsData = listResponse.data
          } else if (
            listResponse.data.content &&
            Array.isArray(listResponse.data.content)
          ) {
            paymentMethodsData = listResponse.data.content
          }
          setPaymentMethods(paymentMethodsData)
        }
      } else {
        alert(response.msg || '결제수단 수정에 실패했습니다.')
      }
    } catch (err: any) {
      console.error('결제수단 수정 에러:', err)
      alert(err.response?.data?.msg || '결제수단 수정에 실패했습니다.')
    }
    setIsEditing(false)
  }

  // 수정 모드 시작
  const startEdit = (paymentMethod: PaymentMethod) => {
    setEditingId(paymentMethod.id)
    setEditFormData({
      alias: paymentMethod.alias,
      isDefault: paymentMethod.isDefault,
    })
  }

  const getCardTypeIcon = (brand?: string) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return '💳'
      case 'mastercard':
        return '💳'
      case 'amex':
        return '💳'
      default:
        return '💳'
    }
  }

  const getBankIcon = (bankName?: string) => {
    return '🏦'
  }

  // 결제수단 목록 새로고침
  const refreshPaymentMethods = async () => {
    try {
      setIsLoading(true)
      const paymentMethodsResponse = await paymentMethodApi.getPaymentMethods()
      console.log('💳 결제수단 새로고침 응답:', paymentMethodsResponse)

      if (paymentMethodsResponse.success && paymentMethodsResponse.data) {
        let paymentMethodsData = []
        if (Array.isArray(paymentMethodsResponse.data)) {
          paymentMethodsData = paymentMethodsResponse.data
        } else if (
          paymentMethodsResponse.data.content &&
          Array.isArray(paymentMethodsResponse.data.content)
        ) {
          paymentMethodsData = paymentMethodsResponse.data.content
        }
        console.log('💳 처리된 결제수단 데이터:', paymentMethodsData)
        setPaymentMethods(paymentMethodsData)
      } else {
        console.error('결제수단 로드 실패:', paymentMethodsResponse.msg)
        setError(
          paymentMethodsResponse.msg || '결제수단을 불러오는데 실패했습니다.',
        )
      }
    } catch (err) {
      console.error('결제수단 새로고침 에러:', err)
      setError('결제수단을 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
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
          <button
            onClick={() => {
              setActiveTab('paymentMethods')
              if (paymentMethods.length === 0) {
                refreshPaymentMethods()
              }
            }}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'paymentMethods'
                ? 'text-primary-600 bg-white shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Settings className="mr-2 inline h-4 w-4" />
            결제수단 관리
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
                  <div className="mt-4 flex space-x-2">
                    <Button
                      onClick={() => setIsChargeDialogOpen(true)}
                      className="flex-1"
                      size="sm"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      충전하기
                    </Button>
                    <Button
                      onClick={handleAddPaymentMethod}
                      variant="outline"
                      size="sm"
                      disabled={!isTossLoaded}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      {isTossLoaded ? '카드 등록' : '로딩 중...'}
                    </Button>
                  </div>
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
            <div className="grid gap-6 md:grid-cols-2">
              {/* 지갑 없음 카드 */}
              <Card variant="outlined">
                <CardHeader>
                  <h3 className="flex items-center text-lg font-semibold">
                    <DollarSign className="text-primary-600 mr-2 h-5 w-5" />
                    현재 잔액
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="text-primary-600 text-3xl font-bold">0원</div>
                  <p className="mt-2 text-sm text-neutral-600">
                    지갑이 생성되지 않았습니다
                  </p>
                  <div className="mt-4 flex space-x-2">
                    <Button
                      onClick={() => setIsChargeDialogOpen(true)}
                      className="flex-1"
                      size="sm"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      충전하기
                    </Button>
                    <Button
                      onClick={handleAddPaymentMethod}
                      variant="outline"
                      size="sm"
                      disabled={!isTossLoaded}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      {isTossLoaded ? '카드 등록' : '로딩 중...'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* 안내 카드 */}
              <Card variant="outlined">
                <CardHeader>
                  <h3 className="flex items-center text-lg font-semibold">
                    <CreditCard className="mr-2 h-5 w-5 text-neutral-600" />
                    지갑 안내
                  </h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-neutral-600">
                    <p className="mb-2">아직 지갑이 생성되지 않았습니다.</p>
                    <p>첫 충전 시 자동으로 지갑이 생성됩니다.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
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

      {/* 결제수단 관리 탭 */}
      {activeTab === 'paymentMethods' && (
        <div className="space-y-6">
          {/* 헤더 */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900">
                결제수단 관리
              </h2>
              <p className="mt-1 text-sm text-neutral-600">
                등록된 결제수단을 관리하고 새로운 결제수단을 추가할 수 있습니다.
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={refreshPaymentMethods}
                variant="outline"
                size="sm"
              >
                새로고침
              </Button>
              <Button onClick={() => setShowAddForm(true)} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                수동 추가
              </Button>
              <Button
                onClick={handleAddPaymentMethod}
                variant="outline"
                size="sm"
                disabled={!isTossLoaded}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {isTossLoaded ? '토스 카드 등록' : '로딩 중...'}
              </Button>
            </div>
          </div>

          {/* 결제수단 목록 */}
          <div className="space-y-4">
            {isLoading ? (
              <Card variant="outlined">
                <CardContent className="py-12 text-center">
                  <div className="border-primary-200 border-t-primary-600 mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4"></div>
                  <h3 className="text-lg font-semibold text-neutral-900">
                    결제수단을 불러오는 중...
                  </h3>
                </CardContent>
              </Card>
            ) : paymentMethods.length === 0 ? (
              <Card variant="outlined">
                <CardContent className="py-12 text-center">
                  <div className="mb-4">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                      <CreditCard className="h-8 w-8 text-neutral-400" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-neutral-900">
                      등록된 결제수단이 없습니다
                    </h3>
                    <p className="text-neutral-600">
                      새로운 결제수단을 추가해보세요.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              paymentMethods.map((method) => (
                <Card key={method.id} variant="outlined">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
                            <span className="text-2xl">
                              {method.type === 'CARD'
                                ? getCardTypeIcon(method.brand)
                                : getBankIcon(method.bankName)}
                            </span>
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex items-center space-x-2">
                            <Badge
                              variant={method.isDefault ? 'primary' : 'neutral'}
                            >
                              {method.isDefault ? '기본' : '일반'}
                            </Badge>
                            <Badge variant="neutral">{method.type}</Badge>
                          </div>

                          {editingId === method.id ? (
                            <div className="mb-2 space-y-2">
                              <Input
                                value={editFormData.alias}
                                onChange={(e) =>
                                  setEditFormData((prev) => ({
                                    ...prev,
                                    alias: e.target.value,
                                  }))
                                }
                                placeholder="별칭을 입력하세요"
                              />
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={editFormData.isDefault}
                                  onChange={(e) =>
                                    setEditFormData((prev) => ({
                                      ...prev,
                                      isDefault: e.target.checked,
                                    }))
                                  }
                                  className="text-primary-600 focus:ring-primary-500 rounded border-neutral-300"
                                />
                                <span className="ml-2 text-sm text-neutral-600">
                                  기본 결제수단으로 설정
                                </span>
                              </label>
                            </div>
                          ) : (
                            <h3 className="mb-2 text-lg font-semibold text-neutral-900">
                              {method.alias}
                            </h3>
                          )}

                          <div className="mb-3 space-y-1 text-sm text-neutral-600">
                            <div className="flex items-center justify-between">
                              <span>제공업체:</span>
                              <span>{method.provider}</span>
                            </div>
                            {method.type === 'CARD' && (
                              <>
                                <div className="flex items-center justify-between">
                                  <span>카드 브랜드:</span>
                                  <span>{method.brand}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span>카드 번호:</span>
                                  <span>**** **** **** {method.last4}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span>만료일:</span>
                                  <span>
                                    {method.expMonth}/{method.expYear}
                                  </span>
                                </div>
                              </>
                            )}
                            {method.type === 'BANK' && (
                              <>
                                <div className="flex items-center justify-between">
                                  <span>은행:</span>
                                  <span>{method.bankName}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span>계좌 번호:</span>
                                  <span>****{method.acctLast4}</span>
                                </div>
                                {method.bankCode && (
                                  <div className="flex items-center justify-between">
                                    <span>은행 코드:</span>
                                    <span>{method.bankCode}</span>
                                  </div>
                                )}
                              </>
                            )}
                            <div className="flex items-center justify-between">
                              <span>등록일:</span>
                              <span>{formatDate(method.createDate)}</span>
                            </div>
                            {method.expireDate && (
                              <div className="flex items-center justify-between">
                                <span>만료일:</span>
                                <span>{formatDate(method.expireDate)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 액션 버튼들 */}
                      <div className="flex space-x-2">
                        {editingId === method.id ? (
                          <>
                            <Button
                              size="sm"
                              onClick={handleEditPaymentMethod}
                              disabled={isEditing}
                            >
                              {isEditing ? '저장 중...' : '저장'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingId(null)}
                              disabled={isEditing}
                            >
                              취소
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEdit(method)}
                            >
                              수정
                            </Button>
                            {!method.isDefault && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleDeletePaymentMethod(method.id)
                                }
                              >
                                삭제
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* 충전 다이얼로그 */}
      <Dialog open={isChargeDialogOpen} onOpenChange={setIsChargeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>지갑 충전</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* 충전 금액 입력 */}
            <div className="space-y-2">
              <Label htmlFor="chargeAmount">충전 금액</Label>
              <Input
                id="chargeAmount"
                type="number"
                placeholder="충전할 금액을 입력하세요"
                value={chargeAmount}
                onChange={(e) => setChargeAmount(e.target.value)}
                min="1000"
                step="1000"
              />
              <p className="text-sm text-neutral-600">
                최소 충전 금액: 1,000원
              </p>
            </div>

            {/* 결제수단 선택 */}
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">결제수단</Label>
              {paymentMethods.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="mb-2 text-sm text-neutral-600">
                    등록된 결제수단이 없습니다.
                  </p>
                  <Button
                    onClick={handleAddPaymentMethod}
                    variant="outline"
                    size="sm"
                    disabled={!isTossLoaded}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    {isTossLoaded ? '카드 등록하기' : '로딩 중...'}
                  </Button>
                </div>
              ) : (
                <Select
                  value={selectedPaymentMethod}
                  onValueChange={setSelectedPaymentMethod}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="결제수단을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id.toString()}>
                        {method.alias}
                        {method.type === 'CARD' &&
                          method.brand &&
                          method.last4 && (
                            <>
                              {' '}
                              - {method.brand} ****{method.last4}
                            </>
                          )}
                        {method.isDefault && ' (기본)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* 충전 버튼 */}
            <div className="flex space-x-2 pt-4">
              <Button
                onClick={handleCharge}
                disabled={!chargeAmount || !selectedPaymentMethod || isCharging}
                className="flex-1"
              >
                {isCharging ? '충전 중...' : '충전하기'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsChargeDialogOpen(false)}
                disabled={isCharging}
              >
                취소
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 결제수단 수동 추가 폼 */}
      {showAddForm && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <h3 className="text-lg font-semibold">결제수단 수동 추가</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* 결제수단 타입 선택 */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    결제수단 타입
                  </label>
                  <select
                    value={addFormData.type}
                    onChange={(e) =>
                      setAddFormData((prev) => ({
                        ...prev,
                        type: e.target.value,
                      }))
                    }
                    className="focus:ring-primary-500 focus:border-primary-500 block w-full rounded-lg border border-neutral-300 px-3 py-2 focus:ring-2 focus:outline-none"
                  >
                    <option value="card">카드</option>
                    <option value="bank">계좌</option>
                  </select>
                </div>

                {/* 별칭 */}
                <div>
                  <Input
                    label="별칭"
                    value={addFormData.alias}
                    onChange={(e) =>
                      setAddFormData((prev) => ({
                        ...prev,
                        alias: e.target.value,
                      }))
                    }
                    placeholder="예: 내 신용카드"
                  />
                </div>

                {/* 토큰 */}
                <div>
                  <Input
                    label="토큰"
                    value={addFormData.token}
                    onChange={(e) =>
                      setAddFormData((prev) => ({
                        ...prev,
                        token: e.target.value,
                      }))
                    }
                    placeholder="test_token_12345"
                  />
                </div>

                {/* 카드 정보 */}
                {addFormData.type === 'card' && (
                  <>
                    <div>
                      <Input
                        label="카드 브랜드"
                        value={addFormData.brand}
                        onChange={(e) =>
                          setAddFormData((prev) => ({
                            ...prev,
                            brand: e.target.value,
                          }))
                        }
                        placeholder="예: visa, mastercard"
                      />
                    </div>
                    <div>
                      <Input
                        label="카드 번호 마지막 4자리"
                        value={addFormData.last4}
                        onChange={(e) =>
                          setAddFormData((prev) => ({
                            ...prev,
                            last4: e.target.value,
                          }))
                        }
                        placeholder="1234"
                        maxLength={4}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Input
                          label="만료 월"
                          type="number"
                          value={addFormData.expMonth}
                          onChange={(e) =>
                            setAddFormData((prev) => ({
                              ...prev,
                              expMonth: e.target.value,
                            }))
                          }
                          placeholder="12"
                          min="1"
                          max="12"
                        />
                      </div>
                      <div>
                        <Input
                          label="만료 년도"
                          type="number"
                          value={addFormData.expYear}
                          onChange={(e) =>
                            setAddFormData((prev) => ({
                              ...prev,
                              expYear: e.target.value,
                            }))
                          }
                          placeholder="2025"
                          min="2024"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* 계좌 정보 */}
                {addFormData.type === 'bank' && (
                  <>
                    <div>
                      <Input
                        label="은행 코드"
                        value={addFormData.bankCode}
                        onChange={(e) =>
                          setAddFormData((prev) => ({
                            ...prev,
                            bankCode: e.target.value,
                          }))
                        }
                        placeholder="예: 001"
                      />
                    </div>
                    <div>
                      <Input
                        label="은행명"
                        value={addFormData.bankName}
                        onChange={(e) =>
                          setAddFormData((prev) => ({
                            ...prev,
                            bankName: e.target.value,
                          }))
                        }
                        placeholder="예: 국민은행"
                      />
                    </div>
                    <div>
                      <Input
                        label="계좌 번호 마지막 4자리"
                        value={addFormData.acctLast4}
                        onChange={(e) =>
                          setAddFormData((prev) => ({
                            ...prev,
                            acctLast4: e.target.value,
                          }))
                        }
                        placeholder="5678"
                        maxLength={4}
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    disabled={isAdding}
                  >
                    취소
                  </Button>
                  <Button
                    onClick={handleAddPaymentMethodForm}
                    disabled={
                      isAdding || !addFormData.alias || !addFormData.token
                    }
                  >
                    {isAdding ? (
                      <div className="flex items-center">
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        추가 중...
                      </div>
                    ) : (
                      '추가'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
