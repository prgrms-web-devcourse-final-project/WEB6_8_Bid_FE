'use client'

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
  const [bids, setBids] = useState((initialBids as any) || [])
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  // 내 입찰 내역 조회
  const fetchMyBids = async () => {
    setIsLoading(true)
    setApiError('')
    try {
      const response = await bidApi.getMyBids({
        page: 1,
        size: 100, // 충분히 큰 값으로 설정
        // status 필터를 제거하여 모든 상태의 입찰 조회
      })
      console.log('🔍 입찰 내역 API 응답:', response)

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
        console.log('🔍 변환된 입찰 데이터:', bidsData)
        setBids(bidsData)

        // 입찰 내역이 비어있을 때는 에러 메시지 설정하지 않음 (정상 상태)
        // setApiError('입찰 내역이 없습니다. 입찰 후 잠시 기다려주세요.')
      } else {
        // API 실패 시에만 에러 메시지 표시
        console.log('🔍 API 응답 실패:', response.msg)
        setApiError(response.msg || '입찰 내역을 불러오는데 실패했습니다.')
      }
    } catch (error: any) {
      console.error('내 입찰 내역 조회 실패:', error)
      // 401 에러는 로그인 문제이므로 에러 메시지 표시하지 않음
      if (error.response?.status === 401) {
        console.log('🔍 401 에러 - 로그인 필요')
        setApiError('')
      } else {
        setApiError(
          error.response?.data?.msg || '입찰 내역을 불러오는데 실패했습니다.',
        )
      }
    }
    setIsLoading(false)
  }

  // 컴포넌트 마운트 시 입찰 내역 조회
  useEffect(() => {
    console.log('🔍 BidStatusClient 마운트됨')
    console.log('🔍 initialBids:', initialBids)
    console.log('🔍 initialBids 길이:', initialBids?.length || 0)

    if (!initialBids || initialBids.length === 0) {
      console.log('🔍 fetchMyBids 호출 시작')
      fetchMyBids()
    } else {
      console.log('🔍 initialBids 사용:', initialBids)
      console.log('🔍 initialBids 상세:', JSON.stringify(initialBids, null, 2))
      setBids(initialBids)
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

  const getStatusInfo = (bid: any) => {
    if (bid.isWinning && bid.status === 'BIDDING') {
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
    } else if (bid.status === 'SUCCESSFUL') {
      return {
        label: '낙찰',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        icon: '🎉',
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      {/* API 에러 메시지 */}
      {apiError && (
        <ErrorAlert
          title="오류"
          message={apiError}
          onClose={() => setApiError('')}
        />
      )}

      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">입찰 내역</h1>
        <p className="mt-2 text-neutral-600">
          총 {bids.length}개의 입찰 내역이 있습니다
        </p>
      </div>

      {/* 입찰 목록 */}
      <div className="space-y-6">
        {bids.length === 0 ? (
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
                  <Button variant="outline" onClick={fetchMyBids} size="lg">
                    새로고침
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          bids.map((bid: any) => {
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
                          <span className="w-20 text-neutral-500">현재가:</span>
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

                      {bid.status === 'SUCCESSFUL' && (
                        <div className="bg-success-50 mb-4 rounded-lg p-3">
                          <div className="text-success-900 mb-2 text-sm font-medium">
                            🎉 축하합니다! 낙찰되었습니다!
                          </div>
                          <p className="text-success-700 text-sm">
                            판매자와 연락하여 거래를 진행하세요.
                          </p>
                        </div>
                      )}

                      {bid.isWinning && bid.status === 'BIDDING' && (
                        <div className="bg-primary-50 mb-4 rounded-lg p-3">
                          <div className="text-primary-900 mb-2 text-sm font-medium">
                            🏆 현재 최고가 입찰자입니다!
                          </div>
                          <p className="text-primary-700 text-sm">
                            경매 종료까지 기다려주세요.
                          </p>
                        </div>
                      )}

                      {/* 액션 버튼들 */}
                      <div className="flex flex-wrap gap-2">
                        {bid.status === 'SUCCESSFUL' && (
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
                        {bid.status === 'BIDDING' && (
                          <>
                            <Button
                              size="sm"
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
          })
        )}
      </div>
    </div>
  )
}
