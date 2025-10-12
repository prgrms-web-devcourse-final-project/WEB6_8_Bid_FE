'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ErrorAlert } from '@/components/ui/error-alert'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { bidApi, productApi, reviewApi } from '@/lib/api'
import { Product } from '@/types'
import { Clock, Heart, MapPin, MessageSquare, Star, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface ProductDetailClientProps {
  product: Product
  initialBidStatus?: any
}

export function ProductDetailClient({
  product,
  initialBidStatus,
}: ProductDetailClientProps) {
  const router = useRouter()
  const { isLoggedIn } = useAuth()
  const [bidAmount, setBidAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [bidStatus, setBidStatus] = useState<any>(initialBidStatus || null)
  const [productData, setProductData] = useState(product)
  const [reviews, setReviews] = useState<any[]>([])

  // 입찰 현황 조회
  const fetchBidStatus = async () => {
    try {
      const response = await bidApi.getBidStatus(product.id)
      if (response.success) {
        setBidStatus(response.data)
      }
    } catch (error) {
      console.error('입찰 현황 조회 실패:', error)
    }
  }

  // 리뷰 조회
  const fetchReviews = async () => {
    try {
      const response = await reviewApi.getReviewsByProduct(product.id)
      if (response.success && response.data) {
        const reviewsData = Array.isArray(response.data)
          ? response.data
          : response.data.content || []
        setReviews(reviewsData)
      }
    } catch (error) {
      console.error('리뷰 조회 실패:', error)
      setReviews([])
    }
  }

  // 상품 정보 새로고침
  const refreshProduct = async () => {
    try {
      const response = await productApi.getProduct(product.id)

      if (response.success && response.data) {
        // API 응답을 컴포넌트에서 사용하는 형식으로 매핑
        const mappedProduct: Product = {
          id: response.data.productId || response.data.id,
          title: response.data.name || response.data.title,
          description: response.data.description || '',
          category: response.data.category,
          images: response.data.images || [],
          startingPrice:
            response.data.initialPrice || response.data.startingPrice,
          currentPrice: response.data.currentPrice,
          seller: {
            id: response.data.seller?.id || '1',
            email: response.data.seller?.email || '',
            name:
              response.data.seller?.name ||
              response.data.sellerName ||
              '판매자',
            phone: response.data.seller?.phone || '',
            profileImage: response.data.seller?.profileImage,
            trustScore:
              response.data.seller?.trustScore ||
              response.data.sellerTrustScore ||
              0,
            reviewCount: response.data.seller?.reviewCount || 0,
            joinDate: response.data.seller?.joinDate || '',
            isVerified: response.data.seller?.isVerified || false,
          },
          status: response.data.status || 'BIDDING',
          location: response.data.location || '',
          createdAt: response.data.createdAt || '',
          endTime: response.data.endTime || '',
          bidCount: response.data.bidCount || 0,
          isLiked: response.data.isLiked || false,
        }
        setProductData(mappedProduct)
      }
    } catch (error) {
      console.error('상품 정보 새로고침 실패:', error)
    }
  }

  useEffect(() => {
    // 서버에서 전달받은 데이터를 그대로 사용
    setProductData(product)

    // 서버에서 입찰 현황을 가져오지 못한 경우에만 클라이언트에서 조회
    if (!initialBidStatus) {
      fetchBidStatus()
    }

    // 리뷰 데이터 가져오기
    fetchReviews()

    // 상품 정보는 서버에서 이미 최신 데이터를 가져왔으므로 새로고침 불필요
    // refreshProduct()
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
      router.push('/login')
      return
    }

    const amount = parseInt(bidAmount.replace(/,/g, ''))
    if (
      !amount ||
      amount <= (productData.currentPrice || productData.startingPrice)
    ) {
      setApiError('현재가보다 높은 금액을 입력해주세요.')
      return
    }

    setIsLoading(true)
    setApiError('')

    try {
      const response = await bidApi.createBid(product.id, amount)
      if (response.success) {
        alert('입찰이 성공적으로 등록되었습니다.')
        setBidAmount('')
        fetchBidStatus()
        // 입찰 후에만 상품 정보 새로고침
        refreshProduct()
      } else {
        setApiError(response.msg || '입찰에 실패했습니다.')
      }
    } catch (error: any) {
      console.error('입찰 실패:', error)
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 상품 이미지 */}
        <div className="space-y-4">
          <div className="aspect-square rounded-lg bg-neutral-200">
            {productData.images && productData.images[0] ? (
              <img
                src={productData.images[0]}
                alt={productData.title}
                className="h-full w-full rounded-lg object-cover"
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
                    src={image}
                    alt={`${productData.title} ${index + 2}`}
                    className="h-full w-full rounded-lg object-cover"
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
              {productData.status === 'BIDDING' && (
                <Badge variant="success">경매중</Badge>
              )}
              {productData.status === 'BEFORE_START' && (
                <Badge variant="secondary">시작전</Badge>
              )}
              {productData.status === 'SUCCESSFUL' && (
                <Badge variant="primary">완료</Badge>
              )}
              {productData.status === 'FAILED' && (
                <Badge variant="error">실패</Badge>
              )}
            </div>

            <h1 className="mb-4 text-2xl font-bold text-neutral-900">
              {productData.title}
            </h1>

            <div className="space-y-3 text-sm text-neutral-600">
              <div className="flex items-center justify-between">
                <span>현재가:</span>
                <span className="text-success-600 text-lg font-semibold">
                  {formatPrice(
                    productData.currentPrice || productData.startingPrice,
                  )}
                </span>
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
                  <span>
                    {formatTimeLeft(
                      (productData as any).auctionEndTime ||
                        productData.endTime,
                    )}
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>참여자 수:</span>
                <span>
                  {bidStatus?.bidCount || productData.bidCount || 0}명
                </span>
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
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-neutral-400" />
                  <span>리뷰 {productData.seller?.reviewCount || 0}개</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 입찰 섹션 */}
          {((productData as any).status === 'BIDDING' ||
            (productData as any).status === '경매 중') && (
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
                          productData.startingPrice) + 1000,
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
                    {bidStatus?.bidCount || productData.bidCount || 0}회
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>현재 최고가:</span>
                  <span className="font-semibold">
                    {formatPrice(
                      bidStatus?.currentPrice ||
                        productData.currentPrice ||
                        productData.startingPrice,
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>참여자 수:</span>
                  <span>
                    {bidStatus?.bidCount || productData.bidCount || 0}명
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 상품 상태별 메시지 */}
          <Card variant="outlined">
            <CardContent className="p-4">
              <div className="text-center">
                {((productData as any).status === 'BIDDING' ||
                  (productData as any).status === '경매 중') && (
                  <div className="text-green-600">
                    <Clock className="mx-auto mb-2 h-8 w-8" />
                    <p className="font-semibold">경매 진행중</p>
                    <p className="text-sm">
                      현재 경매가 진행 중입니다. 입찰에 참여해보세요.
                    </p>
                  </div>
                )}
                {((productData as any).status === 'BEFORE_START' ||
                  (productData as any).status === '경매 시작 전') && (
                  <div className="text-amber-600">
                    <Clock className="mx-auto mb-2 h-8 w-8" />
                    <p className="font-semibold">경매 시작 전</p>
                    <p className="text-sm">
                      경매가 시작되면 입찰할 수 있습니다.
                    </p>
                  </div>
                )}
                {((productData as any).status === 'SUCCESSFUL' ||
                  (productData as any).status === '경매 완료') && (
                  <div className="text-green-600">
                    <p className="font-semibold">경매 완료</p>
                    <p className="text-sm">
                      이 상품의 경매가 성공적으로 완료되었습니다.
                    </p>
                  </div>
                )}
                {((productData as any).status === 'PAID' ||
                  (productData as any).status === '결제 완료') && (
                  <div className="text-blue-600">
                    <p className="font-semibold">결제 완료</p>
                    <p className="text-sm">이 상품의 결제가 완료되었습니다.</p>
                  </div>
                )}
                {((productData as any).status === 'FAILED' ||
                  (productData as any).status === '경매 실패') && (
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

      {/* 리뷰 섹션 */}
      <Card variant="outlined" className="mt-6">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center text-lg font-semibold text-neutral-900">
              <MessageSquare className="mr-2 h-5 w-5" />
              리뷰
            </h3>
            {isLoggedIn && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  router.push(`/review?productId=${productData.id}`)
                }
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                리뷰 작성
              </Button>
            )}
          </div>

          {/* 디버깅: 리뷰 개수 확인 */}
          <div className="mb-2 text-xs text-gray-500">
            리뷰 개수: {reviews.length}개
          </div>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review: any, index: number) => (
                <div
                  key={index}
                  className="border-b border-neutral-200 pb-4 last:border-b-0"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-neutral-900">
                        {review.userName || review.user?.name || '익명'}
                      </span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < (review.rating || 0)
                                ? 'fill-current text-yellow-400'
                                : 'text-neutral-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-neutral-500">
                      {formatDateTime(review.createdAt || review.createDate)}
                    </span>
                  </div>
                  <p className="text-neutral-700">
                    {review.content || review.comment}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <MessageSquare className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
              <p className="mb-4 text-neutral-600">
                아직 작성된 리뷰가 없습니다.
              </p>
              {isLoggedIn && (
                <Button
                  onClick={() =>
                    router.push(`/review?productId=${productData.id}`)
                  }
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  첫 리뷰 작성하기
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
