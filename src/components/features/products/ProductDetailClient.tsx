'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ErrorAlert } from '@/components/ui/error-alert'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { useWebSocketAuctionTimer } from '@/hooks/useWebSocketAuctionTimer'
import { useWebSocketBid } from '@/hooks/useWebSocketBid'
import { bidApi, productApi } from '@/lib/api'
import { Product } from '@/types'
import { Clock, Edit, Heart, MapPin, User, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

interface ProductDetailClientProps {
  product: Product
  initialBidStatus?: any
}

export function ProductDetailClient({
  product,
  initialBidStatus,
}: ProductDetailClientProps) {
  console.log('🎯 product:', product)
  const router = useRouter()
  const { isLoggedIn, user } = useAuth()
  const [bidAmount, setBidAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [bidStatus, setBidStatus] = useState<any>(initialBidStatus || null)
  const [isPriceUpdated, setIsPriceUpdated] = useState(false)
  const [isBidCountUpdated, setIsBidCountUpdated] = useState(false)
  const [showBidNotification, setShowBidNotification] = useState(false)
  const [lastBidInfo, setLastBidInfo] = useState<{
    price: number
    bidder: string
  } | null>(null)
  const [productData, setProductData] = useState(product)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // product.id를 안전하게 숫자로 변환하는 함수
  const getSafeProductId = (productId: any): number => {
    if (typeof productId === 'number') return productId
    if (typeof productId === 'string') return parseInt(productId) || 0
    if (typeof productId === 'object' && productId !== null) {
      return Number(productId.id || productId.value || productId.productId) || 0
    }
    return 0
  }

  const safeProductId = getSafeProductId(product.productId)

  // 상품 데이터 새로고침 함수
  const refreshProductData = async () => {
    try {
      setIsRefreshing(true)
      console.log('🔄 상품 데이터 새로고침 중...')
      const response = await productApi.getProduct(safeProductId)
      if (response.success && response.data) {
        setProductData(response.data)
        // bidStatus도 함께 업데이트
        setBidStatus((prev: any) => ({
          ...prev,
          currentPrice: response.data.currentPrice,
          bidCount: response.data.bidCount,
        }))
        console.log('✅ 상품 데이터 새로고침 완료:', response.data)
      }
    } catch (error) {
      console.error('❌ 상품 데이터 새로고침 실패:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // WebSocket 실시간 입찰 정보 구독
  const {
    bidUpdate,
    auctionStatus,
    isSubscribed,
    error: wsError,
  } = useWebSocketBid(safeProductId)

  // WebSocket 실시간 경매 타이머 구독
  const { timerData, isSubscribed: isTimerSubscribed } =
    useWebSocketAuctionTimer(safeProductId)

  // API 응답의 영어 status를 한국어로 변환
  const mapApiStatusToKorean = (apiStatus: string): string => {
    switch (apiStatus) {
      case 'BEFORE_START':
        return '경매 시작 전'
      case 'BIDDING':
      case 'SELLING':
        return '경매 중'
      case 'SUCCESSFUL':
      case 'SOLD':
        return '낙찰'
      case 'FAILED':
        return '유찰'
      default:
        return apiStatus // 알 수 없는 상태는 그대로 반환
    }
  }

  // 이미지 URL을 안전하게 추출하는 함수
  const getImageUrl = (
    image:
      | string
      | { imageUrl: string; id?: number; productId?: number }
      | undefined,
  ): string => {
    if (!image) return ''
    if (typeof image === 'string') return image
    return image.imageUrl || ''
  }

  // 현재 사용자가 상품 판매자인지 확인 (메모이제이션으로 성능 최적화)
  const isOwner = useMemo(() => {
    return (
      user &&
      productData.seller &&
      (String(user.id) === String(productData.seller.id) ||
        user.email === productData.seller.email ||
        user.nickname === productData.seller.name)
    )
  }, [user, productData.seller])

  // 입찰 현황 조회
  const fetchBidStatus = async () => {
    try {
      const response = await bidApi.getBidStatus(safeProductId)
      if (response.success) {
        setBidStatus(response.data)
      } else {
        console.log('❌ 입찰 현황 조회 실패:', response.msg)
      }
    } catch (error) {
      console.error('❌ 입찰 현황 조회 실패:', error)
    }
  }

  // 실시간 입찰 정보 업데이트
  useEffect(() => {
    if (bidUpdate) {
      console.log('🎯 실시간 입찰 정보 업데이트:', bidUpdate)
      // 실시간으로 현재가와 입찰 수 업데이트
      setBidStatus((prev: any) => {
        const newStatus = {
          ...prev,
          currentPrice: bidUpdate.currentPrice,
          bidCount: bidUpdate.bidCount,
        }

        // 가격이 변경되었는지 확인
        if (prev?.currentPrice !== bidUpdate.currentPrice) {
          setIsPriceUpdated(true)
          setTimeout(() => setIsPriceUpdated(false), 3000) // 3초 후 하이라이트 제거

          // 새 입찰 알림 표시
          setLastBidInfo({
            price: bidUpdate.currentPrice,
            bidder: bidUpdate.lastBidder || '',
          })
          setShowBidNotification(true)
          setTimeout(() => setShowBidNotification(false), 5000) // 5초 후 알림 제거

          // 상품 데이터 새로고침 (가격 변경 시)
          refreshProductData()
        }

        // 입찰 수가 변경되었는지 확인
        if (prev?.bidCount !== bidUpdate.bidCount) {
          setIsBidCountUpdated(true)
          setTimeout(() => setIsBidCountUpdated(false), 3000) // 3초 후 하이라이트 제거

          // 상품 데이터 새로고침 (입찰 수 변경 시)
          refreshProductData()
        }

        return newStatus
      })
    }
  }, [bidUpdate])

  // 경매 상태 업데이트
  useEffect(() => {
    if (auctionStatus) {
      console.log('🎯 경매 상태 업데이트:', auctionStatus)
      // 경매 상태에 따른 UI 업데이트 로직
    }
  }, [auctionStatus])

  useEffect(() => {
    // 토큰 상태 확인
    const cookies = document.cookie.split(';')
    const accessTokenCookie = cookies.find((cookie) =>
      cookie.trim().startsWith('accessToken='),
    )
    const accessToken = accessTokenCookie?.split('=')[1]

    // 서버에서 입찰 현황을 가져오지 못한 경우에만 클라이언트에서 조회
    if (!initialBidStatus && accessToken) {
      fetchBidStatus()
    }
  }, [])

  const formatPrice = (price: number) => {
    if (isNaN(price) || price === null || price === undefined) {
      return '0원'
    }
    return new Intl.NumberFormat('ko-KR').format(price) + '원'
  }

  const formatDateTime = (dateTime: string) => {
    if (!dateTime || dateTime === '') {
      return '시간 미정'
    }

    try {
      const date = new Date(dateTime)
      if (isNaN(date.getTime())) {
        return '시간 미정'
      }

      return date.toLocaleString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch (error) {
      console.error('날짜 포맷 오류:', error, dateTime)
      return '시간 미정'
    }
  }

  const formatDeliveryMethod = (method: string) => {
    if (!method) return '직접거래'

    const deliveryMethods: { [key: string]: string } = {
      DELIVERY: '택배',
      PICKUP: '직접거래',
      BOTH: '택배/직접거래',
      TRADE: '직접거래',
      택배: '택배',
      직접거래: '직접거래',
      '택배/직접거래': '택배/직접거래',
    }

    return deliveryMethods[method] || method
  }

  const formatTimeLeft = (endTime: string) => {
    if (!endTime || endTime === '') {
      return '경매 시간 미정'
    }

    try {
      const now = new Date().getTime()
      let end: number

      // 다양한 날짜 형식 처리
      if (typeof endTime === 'string') {
        // ISO 형식 처리 (2025-11-11T03:27:27)
        if (endTime.includes('T')) {
          end = new Date(endTime).getTime()
        }
        // YYYY-MM-DD 형식인 경우
        else if (endTime.match(/^\d{4}-\d{2}-\d{2}$/)) {
          end = new Date(endTime + 'T23:59:59').getTime()
        }
        // 기타 형식
        else {
          end = new Date(endTime).getTime()
        }
      } else {
        end = new Date(endTime).getTime()
      }

      if (isNaN(end)) {
        return '경매 시간 미정'
      }

      const diff = end - now

      if (diff <= 0) return '경매 종료'

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      )
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (days > 0) {
        return `${days}일 ${hours}시간`
      } else if (hours > 0) {
        return `${hours}시간 ${minutes}분`
      } else if (minutes > 0) {
        return `${minutes}분`
      } else {
        return '곧 종료'
      }
    } catch (error) {
      console.error('시간 계산 오류:', error, endTime)
      return '경매 시간 미정'
    }
  }

  const handleBid = async () => {
    if (!isLoggedIn) {
      console.log('🎯 로그인되지 않음, 로그인 페이지로 이동')
      router.push('/login')
      return
    }

    const amount = parseInt(bidAmount.replace(/,/g, ''))

    const currentPrice = productData.currentPrice || productData.startingPrice
    const minBidAmount = currentPrice + 100

    if (!amount || amount < minBidAmount) {
      console.log('🎯 입찰 금액이 최소 입찰가보다 낮음')
      setApiError(
        `최소 입찰가 ${formatPrice(minBidAmount)}원 이상 입력해주세요.`,
      )
      return
    }

    setIsLoading(true)
    setApiError('')

    try {
      console.log('🎯 입찰 API 호출 시작:', {
        productId: safeProductId,
        price: amount,
        bidData: { price: amount },
      })

      // API 호출 방식 확인
      console.log('🎯 bidApi.createBid 함수:', bidApi.createBid)

      const response = await bidApi.createBid(safeProductId, { price: amount })
      console.log('🎯 입찰 API 응답:', response)

      if (response.success) {
        alert('입찰이 성공적으로 등록되었습니다.')
        setBidAmount('')
        fetchBidStatus()
        // 상품 데이터 새로고침
        refreshProductData()

        // 내 입찰 목록에 추가 (WebSocket을 통해 다른 페이지에서도 알림 받을 수 있도록)
        console.log('🎯 입찰 성공 - 내 입찰 목록에 추가됨')

        // 페이지 새로고침 대신 실시간 업데이트 사용
        // window.location.reload()
      } else {
        console.log('🎯 입찰 실패:', response.msg)
        setApiError(response.msg || '입찰에 실패했습니다.')
      }
    } catch (error: any) {
      console.error('🎯 입찰 실패:', error)
      console.error('🎯 에러 상세:', error.response?.data)
      setApiError(error.response?.data?.msg || '입찰 중 오류가 발생했습니다.')
    }

    setIsLoading(false)
  }

  const handleBidAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    const formatted = value ? parseInt(value).toLocaleString() : ''
    setBidAmount(formatted)
    setApiError('')
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

      {/* WebSocket 에러 메시지 */}
      {wsError && (
        <ErrorAlert
          title="실시간 연결 오류"
          message={wsError}
          onClose={() => {}}
        />
      )}

      {/* 새 입찰 알림 토스트 */}
      {showBidNotification && lastBidInfo && (
        <div className="animate-slide-in fixed top-4 right-4 z-50">
          <div className="rounded-lg bg-green-500 px-6 py-4 text-white shadow-lg">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 animate-pulse" />
              <div>
                <div className="font-semibold">새 입찰 발생!</div>
                <div className="text-sm">{formatPrice(lastBidInfo.price)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 실시간 연결 상태 표시 */}
      {/* WebSocket 연결 상태 표시 */}
      <div className="mb-4 space-y-2">
        {isSubscribed && (
          <div className="flex items-center justify-center space-x-2 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">
            <Zap className="h-4 w-4 animate-pulse" />
            <span>실시간 입찰 정보 연결됨</span>
          </div>
        )}
        {isTimerSubscribed && (
          <div className="flex items-center justify-center space-x-2 rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700">
            <Clock className="h-4 w-4 animate-pulse" />
            <span>실시간 경매 타이머 연결됨</span>
          </div>
        )}
        {wsError && (
          <div className="flex items-center justify-center space-x-2 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
            <span>⚠️ 실시간 연결 오류: {wsError}</span>
          </div>
        )}
        {!isSubscribed && !isTimerSubscribed && (
          <div className="flex items-center justify-center space-x-2 rounded-lg bg-gray-50 px-4 py-2 text-sm text-gray-600">
            <span>실시간 기능 연결 중...</span>
          </div>
        )}

        {/* 데이터 새로고침 상태 */}
        {isRefreshing && (
          <div className="flex items-center justify-center space-x-2 rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
            <span>데이터 새로고침 중...</span>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 상품 이미지 */}
        <div className="space-y-4">
          <div className="aspect-square rounded-lg bg-neutral-200">
            {productData.images && productData.images[0] ? (
              <img
                src={getImageUrl(productData.images[0])}
                alt={productData.title}
                className="h-full w-full rounded-lg object-cover"
                onError={(e) => {
                  console.error('이미지 로드 실패:', e.currentTarget.src)
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center rounded-lg bg-gradient-to-br from-neutral-100 to-neutral-200">
                <div className="mb-2 rounded-full bg-neutral-300 p-3">
                  <svg
                    className="h-8 w-8 text-neutral-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-neutral-500">이미지 준비중</p>
              </div>
            )}
          </div>

          {/* 추가 이미지들 */}
          {productData.images && productData.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {productData.images.slice(1, 5).map((image, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-lg bg-neutral-200"
                >
                  <img
                    src={getImageUrl(image)}
                    alt={`${product.title} ${index + 2}`}
                    className="h-full w-full rounded-lg object-cover"
                    onError={(e) => {
                      console.error('이미지 로드 실패:', e.currentTarget.src)
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 상품 정보 */}
        <div className="space-y-6">
          {/* 기본 정보 */}
          <div>
            <div className="mb-2 flex items-center space-x-2">
              <Badge variant="primary">{productData.category}</Badge>
              {productData.status === '경매 중' && (
                <Badge variant="success">경매중</Badge>
              )}
              {productData.status === '경매 시작 전' && (
                <Badge variant="secondary">시작전</Badge>
              )}
              {productData.status === '낙찰' && (
                <Badge variant="primary">낙찰</Badge>
              )}
              {productData.status === '유찰' && (
                <Badge variant="error">유찰</Badge>
              )}
            </div>

            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-neutral-900">
                {productData.title}
              </h1>
              {isOwner && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    router.push(`/products/${product.productId}/edit`)
                  }}
                  className="flex items-center space-x-2"
                  disabled={
                    productData.status === '경매 중' ||
                    productData.status === '낙찰' ||
                    productData.status === '유찰'
                  }
                >
                  <Edit className="h-4 w-4" />
                  <span>
                    {productData.status === '경매 중'
                      ? '경매중'
                      : productData.status === '낙찰'
                        ? '완료'
                        : productData.status === '유찰'
                          ? '결제완료'
                          : '수정'}
                  </span>
                </Button>
              )}
            </div>

            <div className="space-y-3 text-sm text-neutral-600">
              <div className="flex items-center justify-between">
                <span>현재가:</span>
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-lg font-semibold transition-all duration-500 ${
                      isPriceUpdated
                        ? 'animate-pulse rounded bg-yellow-100 px-2 py-1 text-red-600'
                        : 'text-success-600'
                    }`}
                  >
                    {formatPrice(
                      bidUpdate?.currentPrice ||
                        bidStatus?.currentPrice ||
                        productData.currentPrice ||
                        productData.startingPrice,
                    )}
                  </span>
                  {bidUpdate && (
                    <div className="flex items-center space-x-1">
                      <span className="animate-pulse text-xs text-green-500">
                        실시간
                      </span>
                      {isPriceUpdated && (
                        <span className="text-xs font-semibold text-red-600">
                          (새 입찰!)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>시작가:</span>
                <span>{formatPrice(productData.startingPrice)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>경매 시작:</span>
                <span className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {formatDateTime((productData as any).auctionStartTime)}
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>경매 종료:</span>
                <span className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {formatDateTime((productData as any).auctionEndTime)}
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>경매 종료까지:</span>
                <span className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span
                    className={
                      timerData?.isEndingSoon
                        ? 'animate-pulse font-semibold text-red-500'
                        : ''
                    }
                  >
                    {timerData?.timeLeft ||
                      formatTimeLeft(
                        (productData as any).auctionEndTime ||
                          productData.endTime,
                      )}
                  </span>
                  {isTimerSubscribed && (
                    <span className="ml-1 animate-pulse text-xs text-green-500">
                      실시간
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>참여자 수:</span>
                <div className="flex items-center space-x-2">
                  <span
                    className={`font-semibold transition-all duration-500 ${
                      isBidCountUpdated
                        ? 'animate-pulse rounded bg-blue-100 px-2 py-1 text-blue-600'
                        : ''
                    }`}
                  >
                    {bidUpdate?.bidCount ||
                      bidStatus?.bidCount ||
                      productData.bidCount ||
                      0}
                    명
                  </span>
                  {bidUpdate && (
                    <div className="flex items-center space-x-1">
                      <span className="animate-pulse text-xs text-green-500">
                        실시간
                      </span>
                      {isBidCountUpdated && (
                        <span className="text-xs font-semibold text-blue-600">
                          (새 참여자!)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>배송 방법:</span>
                <span>
                  {formatDeliveryMethod((productData as any).deliveryMethod)}
                </span>
              </div>
            </div>
          </div>

          {/* 판매자 정보 */}
          <Card variant="outlined">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900">
                  판매자 정보
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    router.push(`/seller/${productData.seller?.id || '1'}`)
                  }
                >
                  상세보기
                </Button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-neutral-400" />
                  <span>{productData.seller?.name || '판매자'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-red-400" />
                  <span>신뢰도 {productData.seller?.trustScore || 0}점</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-neutral-400" />
                  <span>{productData.location || '위치 정보 없음'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 입찰 섹션 */}
          {(() => {
            const status = (product as any).status
            const showBidSection = status === 'BIDDING' || status === '경매 중'
            console.log('🎯 입찰 섹션 표시 조건 확인:', {
              status,
              showBidSection,
              isLoggedIn,
              productId: safeProductId,
            })
            return showBidSection
          })() && (
            <Card variant="outlined">
              <CardContent className="p-4">
                <h3 className="mb-3 text-lg font-semibold text-neutral-900">
                  입찰하기
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                      입찰 금액
                    </label>
                    <Input
                      type="text"
                      value={bidAmount}
                      onChange={handleBidAmountChange}
                      placeholder="입찰 금액을 입력하세요"
                      className="text-right"
                    />
                    <p className="mt-1 text-xs text-neutral-500">
                      최소 입찰가:{' '}
                      {formatPrice(
                        (productData.currentPrice ||
                          productData.startingPrice) + 100,
                      )}
                    </p>
                  </div>

                  <Button
                    onClick={handleBid}
                    disabled={isLoading || !bidAmount}
                    className="w-full"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        입찰 중...
                      </div>
                    ) : (
                      '입찰하기'
                    )}
                  </Button>

                  {!isLoggedIn && (
                    <p className="text-center text-sm text-neutral-500">
                      입찰하려면{' '}
                      <button
                        onClick={() => router.push('/login')}
                        className="text-primary-600 hover:underline"
                      >
                        로그인
                      </button>
                      이 필요합니다.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 입찰 현황 */}
          <Card variant="outlined">
            <CardContent className="p-4">
              <h3 className="mb-3 text-lg font-semibold text-neutral-900">
                입찰 현황
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>총 입찰 수:</span>
                  <span>
                    {bidUpdate?.bidCount ||
                      bidStatus?.bidCount ||
                      product.bidCount ||
                      0}
                    회
                    {bidUpdate && (
                      <span className="ml-1 animate-pulse text-xs text-green-500">
                        실시간
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>현재 최고가:</span>
                  <span className="font-semibold">
                    {formatPrice(
                      bidUpdate?.currentPrice ||
                        bidStatus?.currentPrice ||
                        productData.currentPrice ||
                        productData.startingPrice,
                    )}
                    {bidUpdate && (
                      <span className="ml-1 animate-pulse text-xs text-green-500">
                        실시간
                      </span>
                    )}
                  </span>
                </div>
                {bidUpdate?.lastBidder && (
                  <div className="flex items-center justify-between">
                    <span>최근 입찰자:</span>
                    <span className="text-xs text-neutral-500">
                      {bidUpdate.lastBidder}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 상품 상태별 메시지 */}
          <Card variant="outlined">
            <CardContent className="p-4">
              <div className="text-center">
                {((product as any).status === 'BIDDING' ||
                  (product as any).status === '경매 중') && (
                  <div className="text-green-600">
                    <Clock className="mx-auto mb-2 h-8 w-8" />
                    <p className="font-semibold">경매 진행중</p>
                    <p className="text-sm">
                      현재 경매가 진행 중입니다. 입찰에 참여해보세요.
                    </p>
                  </div>
                )}
                {((product as any).status === 'BEFORE_START' ||
                  (product as any).status === '경매 시작 전') && (
                  <div className="text-amber-600">
                    <Clock className="mx-auto mb-2 h-8 w-8" />
                    <p className="font-semibold">경매 시작 전</p>
                    <p className="text-sm">
                      경매가 시작되면 입찰할 수 있습니다.
                    </p>
                  </div>
                )}
                {((product as any).status === 'SUCCESSFUL' ||
                  (product as any).status === '경매 완료') && (
                  <div className="text-green-600">
                    <p className="font-semibold">경매 완료</p>
                    <p className="text-sm">
                      이 상품의 경매가 성공적으로 완료되었습니다.
                    </p>
                  </div>
                )}
                {((product as any).status === 'PAID' ||
                  (product as any).status === '결제 완료') && (
                  <div className="text-blue-600">
                    <p className="font-semibold">결제 완료</p>
                    <p className="text-sm">이 상품의 결제가 완료되었습니다.</p>
                  </div>
                )}
                {((product as any).status === 'FAILED' ||
                  (product as any).status === '경매 실패') && (
                  <div className="text-red-600">
                    <p className="font-semibold">경매 실패</p>
                    <p className="text-sm">이 상품의 경매가 실패했습니다.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 상품 설명 */}
      <Card variant="outlined" className="mt-6">
        <CardContent className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-neutral-900">
            상품 설명
          </h3>
          <div className="prose max-w-none text-neutral-700">
            {productData.description ? (
              <p className="whitespace-pre-wrap">{productData.description}</p>
            ) : (
              <p className="text-neutral-500">상품 설명이 없습니다.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
