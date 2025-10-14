'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ErrorAlert } from '@/components/ui/error-alert'
import {
  PageSizeSelector,
  Pagination,
  PaginationInfo,
} from '@/components/ui/pagination'
import { usePagination } from '@/hooks/usePagination'
import { bidApi, cashApi } from '@/lib/api'
import { Bid } from '@/types'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

interface BidStatusClientProps {
  initialBids?: Bid[]
}

export function BidStatusClient({ initialBids }: BidStatusClientProps) {
  const router = useRouter()
  const [apiError, setApiError] = useState('')
  const [payingBidId, setPayingBidId] = useState<number | null>(null)

  // API 호출 함수
  const fetchBids = useCallback(
    async ({ page, size }: { page: number; size: number }) => {
      const response = await bidApi.getMyBids({
        page: page - 1, // API는 0-based 페이지네이션 사용
        size,
      })

      return response
    },
    [],
  )

  // 페이지네이션 훅 사용
  const {
    data: bids,
    currentPage,
    pageSize,
    totalPages,
    totalElements,
    hasNext,
    hasPrevious,
    isLoading,
    error: paginationError,
    goToPage,
    setPageSize,
    refresh,
  } = usePagination(fetchBids, {
    initialPageSize: 5,
    autoLoad: !initialBids || initialBids.length === 0,
    onError: setApiError,
  })

  // 초기 데이터가 있으면 설정
  useEffect(() => {
    if (initialBids && initialBids.length > 0) {
      // 초기 데이터를 페이지네이션 상태에 맞게 설정
      // 이 경우는 서버사이드에서 데이터를 받아온 경우
    }
  }, [initialBids])

  // 입찰 데이터 변환 함수
  const transformBidData = (bidsData: any[]): any[] => {
    return bidsData || []
  }

  // 변환된 입찰 데이터
  const transformedBids = bids ? transformBidData(bids) : initialBids || []

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원'
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '미정'
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return '미정'
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const getStatusInfo = (bid: any) => {
    if (bid.productStatus === '낙찰' || bid.status === 'SUCCESSFUL') {
      return {
        label: bid.paidAt ? '결제 완료' : '낙찰',
        color: bid.paidAt ? 'text-blue-600' : 'text-green-600',
        bgColor: bid.paidAt ? 'bg-blue-50' : 'bg-green-50',
        icon: bid.paidAt ? '✅' : '🎉',
      }
    } else if (
      bid.isWinning &&
      bid.status === 'BIDDING' &&
      bid.productStatus !== '낙찰'
    ) {
      return {
        label: '현재 최고가',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        icon: '🏆',
      }
    } else if (bid.status === 'BIDDING') {
      return {
        label: '진행중',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        icon: '⏳',
      }
    } else if (bid.status === 'FAILED') {
      return {
        label: '유찰',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        icon: '❌',
      }
    } else {
      return {
        label: '진행중',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        icon: '⏳',
      }
    }
  }

  // 결제 가능 여부 확인
  const canPayBid = (bid: any) => {
    return (
      (bid.productStatus === '낙찰' || bid.status === 'SUCCESSFUL') && // 낙찰 상태
      bid.isWinning === true && // 최고가 입찰
      !bid.paidAt // 아직 결제 안함
    )
  }

  // 잔액 확인
  const checkBalance = async (bidAmount: number) => {
    try {
      const cashInfo = await cashApi.getMyCash()
      if (cashInfo.success && cashInfo.data) {
        const balance = cashInfo.data.balance || 0
        if (balance < bidAmount) {
          const shouldGoToWallet = confirm(
            `잔액이 부족합니다.\n현재 잔액: ${balance.toLocaleString()}원\n필요 금액: ${bidAmount.toLocaleString()}원\n\n지갑을 충전하시겠습니까?`,
          )
          if (shouldGoToWallet) {
            router.push('/wallet')
          }
          return false
        }
        return true
      }
      return false
    } catch (error: any) {
      console.error('잔액 확인 실패:', error)

      // 지갑이 생성되지 않은 경우
      if (error.response?.status === 404) {
        const shouldGoToWallet = confirm(
          '잔액이 없습니다.\n잔액을 충전하시겠습니까?',
        )
        if (shouldGoToWallet) {
          router.push('/wallet')
        }
        return false
      }

      alert('잔액 확인 중 오류가 발생했습니다.')
      return false
    }
  }

  // 낙찰 결제 처리
  const handlePayBid = async (bidId: number, bidAmount: number) => {
    setPayingBidId(bidId)
    try {
      const result = await bidApi.payBid(bidId)

      if (result.success) {
        // 결제 성공 처리
        console.log('결제 완료:', result.data)
        alert(
          `결제가 완료되었습니다!\n금액: ${result.data?.amount?.toLocaleString()}원\n잔액: ${result.data?.balanceAfter?.toLocaleString()}원\n\n거래내역을 확인하시겠습니까?`,
        )

        // UI 업데이트 - 페이지 새로고침으로 최신 데이터 가져오기
        refresh()

        // 지갑의 거래내역 탭으로 이동
        router.push('/wallet?tab=transactions')
      } else {
        // 결제 실패 처리
        if (result.msg?.includes('잔액') || result.msg?.includes('지갑')) {
          const shouldGoToWallet = confirm(
            `결제 실패: ${result.msg}\n\n지갑을 충전하시겠습니까?`,
          )
          if (shouldGoToWallet) {
            router.push('/wallet')
          }
        } else {
          alert(`결제 실패: ${result.msg}`)
        }
      }
    } catch (error: any) {
      console.error('결제 오류:', error)

      // 지갑 관련 에러 처리
      if (
        error.response?.status === 404 ||
        error.message?.includes('지갑이 아직 생성되지 않았습니다')
      ) {
        const shouldGoToWallet = confirm(
          '지갑이 아직 생성되지 않았습니다.\n지갑을 생성하고 충전하시겠습니까?',
        )
        if (shouldGoToWallet) {
          router.push('/wallet')
        }
      } else if (
        error.response?.status === 400 &&
        error.response?.data?.msg?.includes('잔액')
      ) {
        const shouldGoToWallet = confirm(
          `결제 실패: ${error.response.data.msg}\n\n지갑을 충전하시겠습니까?`,
        )
        if (shouldGoToWallet) {
          router.push('/wallet')
        }
      } else {
        alert('결제 중 오류가 발생했습니다.')
      }
    } finally {
      setPayingBidId(null)
    }
  }

  // 완전한 결제 플로우
  const completePaymentFlow = async (bidId: number, bidAmount: number) => {
    // 1. 잔액 확인
    const hasEnoughBalance = await checkBalance(bidAmount)
    if (!hasEnoughBalance) return

    // 2. 사용자 확인
    const confirmed = confirm(
      `정말로 ${bidAmount.toLocaleString()}원을 결제하시겠습니까?`,
    )
    if (!confirmed) return

    // 3. 결제 처리
    await handlePayBid(bidId, bidAmount)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      {/* API 에러 메시지 */}
      {(apiError || paginationError) && (
        <ErrorAlert
          title="오류"
          message={apiError || paginationError || ''}
          onClose={() => setApiError('')}
        />
      )}

      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">입찰 내역</h1>
        <p className="mt-2 text-neutral-600">
          총 {totalElements || transformedBids.length}개의 입찰 내역이 있습니다
        </p>
      </div>

      {/* 입찰 목록 */}
      <div className="space-y-6">
        {isLoading ? (
          <Card variant="outlined" className="w-full">
            <CardContent className="py-16 text-center">
              <div className="mb-6">
                <div className="border-primary-200 border-t-primary-600 mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4"></div>
                <h3 className="text-lg font-semibold text-neutral-900">
                  입찰 내역을 불러오는 중...
                </h3>
              </div>
            </CardContent>
          </Card>
        ) : transformedBids.length === 0 ? (
          <Card variant="outlined" className="w-full">
            <CardContent className="py-16 text-center">
              <div className="mb-6">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-neutral-900">
                  입찰 내역이 없습니다
                </h3>
                <p className="mb-6 text-neutral-600">
                  첫 번째 경매에 참여해보세요!
                </p>
                <div className="space-x-3">
                  <Button onClick={() => router.push('/')} size="lg">
                    경매 둘러보기
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {transformedBids.map((bid: any) => {
              const statusInfo = getStatusInfo(bid)

              return (
                <Card
                  key={bid.bidId}
                  variant="outlined"
                  className="transition-shadow hover:shadow-lg"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-6">
                      {/* 상품 이미지 */}
                      <div className="flex-shrink-0">
                        <div className="h-24 w-24 rounded-lg bg-neutral-200">
                          {bid.thumbnailUrl ? (
                            <img
                              src={bid.thumbnailUrl}
                              alt={bid.productName}
                              className="h-24 w-24 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-neutral-200">
                              <span className="text-neutral-400">📦</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 입찰 정보 */}
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-center space-x-2">
                          <div
                            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
                          >
                            <span className="mr-1">{statusInfo.icon}</span>
                            {statusInfo.label}
                          </div>
                        </div>

                        <h3 className="mb-2 text-lg font-semibold text-neutral-900">
                          {bid.productName}
                        </h3>

                        <div className="mb-3 grid grid-cols-1 gap-2 text-sm text-neutral-600 sm:grid-cols-2">
                          <div className="flex items-center space-x-2">
                            <span className="w-20 text-neutral-500">
                              내 입찰가:
                            </span>
                            <span className="text-primary-600 font-semibold">
                              {formatPrice(bid.myBidPrice)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-20 text-neutral-500">
                              현재가:
                            </span>
                            <span>{formatPrice(bid.currentPrice)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-20 text-neutral-500">
                              입찰 시간:
                            </span>
                            <span>{formatDate(bid.bidTime)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-20 text-neutral-500">
                              종료 시간:
                            </span>
                            <span>{formatDate(bid.endTime)}</span>
                          </div>
                          <div className="flex items-center space-x-2 sm:col-span-2">
                            <span className="w-20 text-neutral-500">
                              상품 상태:
                            </span>
                            <span>{bid.productStatus}</span>
                          </div>
                        </div>

                        {bid.isWinning &&
                          bid.status === 'BIDDING' &&
                          bid.productStatus !== '낙찰' && (
                            <div className="bg-primary-50 mb-4 rounded-lg p-3">
                              <div className="text-primary-900 mb-2 text-sm font-medium">
                                🏆 현재 최고가 입찰자입니다!
                              </div>
                              <p className="text-primary-700 text-sm">
                                경매 종료까지 기다려주세요.
                              </p>
                            </div>
                          )}

                        {(bid.productStatus === '낙찰' ||
                          bid.status === 'SUCCESSFUL') &&
                          !bid.paidAt && (
                            <div className="mb-4 rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4">
                              <div className="mb-2 text-sm font-bold text-yellow-900">
                                🎉 낙찰 성공! 결제를 진행해주세요
                              </div>
                              <p className="text-sm text-yellow-800">
                                {formatPrice(bid.myBidPrice)}을 결제하여 거래를
                                완료하세요.
                              </p>
                            </div>
                          )}

                        {(bid.productStatus === '낙찰' ||
                          bid.status === 'SUCCESSFUL') &&
                          bid.paidAt && (
                            <div className="mb-4 rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
                              <div className="mb-2 text-sm font-bold text-blue-900">
                                ✅ 결제 완료!
                              </div>
                              <p className="text-sm text-blue-800">
                                결제가 완료되었습니다. 판매자와 연락하여 상품을
                                받아보세요.
                              </p>
                            </div>
                          )}

                        {/* 액션 버튼들 */}
                        <div className="flex flex-wrap gap-2">
                          {(bid.productStatus === '낙찰' ||
                            bid.status === 'SUCCESSFUL') && (
                            <>
                              {canPayBid(bid) ? (
                                <Button
                                  size="md"
                                  onClick={() =>
                                    completePaymentFlow(
                                      bid.bidId,
                                      bid.myBidPrice,
                                    )
                                  }
                                  disabled={payingBidId === bid.bidId}
                                  className="bg-green-600 font-bold text-white shadow-lg hover:bg-green-700"
                                >
                                  {payingBidId === bid.bidId
                                    ? '결제 중...'
                                    : '💳 결제하기'}
                                </Button>
                              ) : bid.paidAt ? (
                                <Button
                                  size="md"
                                  variant="outline"
                                  disabled
                                  className="font-bold"
                                >
                                  ✅ 결제 완료
                                </Button>
                              ) : null}
                            </>
                          )}
                          {bid.status === 'BIDDING' &&
                            bid.productStatus !== '낙찰' && (
                              <>
                                <Button
                                  size="md"
                                  onClick={() =>
                                    router.push(`/products/${bid.productId}`)
                                  }
                                >
                                  재입찰하기
                                </Button>
                              </>
                            )}
                          {bid.status === 'FAILED' && (
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
            })}

            {/* 페이지네이션 UI */}
            <div className="mt-8 space-y-4">
              {/* 페이지 정보 및 페이지 크기 선택 */}
              <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
                <PaginationInfo
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalElements={totalElements}
                  pageSize={pageSize}
                />
                <PageSizeSelector
                  pageSize={pageSize}
                  onPageSizeChange={setPageSize}
                  options={[5, 10, 20]}
                />
              </div>

              {/* 페이지네이션 컨트롤 */}
              {totalPages > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={goToPage}
                  hasNext={hasNext}
                  hasPrevious={hasPrevious}
                  isLoading={isLoading}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
