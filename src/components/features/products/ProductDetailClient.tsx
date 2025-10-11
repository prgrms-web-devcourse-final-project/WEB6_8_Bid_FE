'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ErrorAlert } from '@/components/ui/error-alert'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { bidApi, productApi } from '@/lib/api'
import { Product } from '@/types'
import { Clock, Heart, MapPin, MessageSquare, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface ProductDetailClientProps {
  product: Product
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter()
  const { isLoggedIn } = useAuth()
  const [bidAmount, setBidAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [bidStatus, setBidStatus] = useState<any>(null)
  const [productData, setProductData] = useState(product)

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
    // 초기 상품 데이터도 매핑
    const mappedInitialProduct: Product = {
      id: product.id,
      title: product.title,
      description: product.description || '',
      category: product.category,
      images: product.images || [],
      startingPrice: product.startingPrice,
      currentPrice: product.currentPrice,
      seller: {
        id: product.seller.id,
        email: product.seller.email,
        name: product.seller.name,
        phone: product.seller.phone,
        profileImage: product.seller.profileImage,
        trustScore: product.seller.trustScore,
        reviewCount: product.seller.reviewCount,
        joinDate: product.seller.joinDate,
        isVerified: product.seller.isVerified,
      },
      status: product.status || 'BIDDING',
      location: product.location || '',
      createdAt: product.createdAt || '',
      endTime: product.endTime || '',
      bidCount: product.bidCount || 0,
      isLiked: product.isLiked || false,
    }
    setProductData(mappedInitialProduct)

    fetchBidStatus()
    refreshProduct()
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원'
  }

  const formatTimeLeft = (endTime: string) => {
    const now = new Date().getTime()
    const end = new Date(endTime).getTime()
    const diff = end - now

    if (diff <= 0) return '종료됨'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) {
      return `${days}일 ${hours}시간 ${minutes}분 남음`
    } else if (hours > 0) {
      return `${hours}시간 ${minutes}분 남음`
    } else {
      return `${minutes}분 남음`
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
              <div className="flex h-full w-full items-center justify-center rounded-lg bg-neutral-200">
                <span className="text-4xl text-neutral-400">📦</span>
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
                <span>남은 시간:</span>
                <span className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatTimeLeft(productData.endTime)}</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>참여자 수:</span>
                <span>{bidStatus?.bidCount || 0}명</span>
              </div>
            </div>
          </div>

          {/* 판매자 정보 */}
          <Card variant="outlined">
            <CardContent className="p-4">
              <h3 className="mb-3 text-lg font-semibold text-neutral-900">
                판매자 정보
              </h3>
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
          {productData.status === 'BIDDING' && (
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
          {bidStatus && (
            <Card variant="outlined">
              <CardContent className="p-4">
                <h3 className="mb-3 text-lg font-semibold text-neutral-900">
                  입찰 현황
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>총 입찰 수:</span>
                    <span>{bidStatus.bidCount || 0}회</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>현재 최고가:</span>
                    <span className="font-semibold">
                      {formatPrice(
                        bidStatus.currentPrice || productData.startingPrice,
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 상품 상태별 메시지 */}
          {productData.status !== 'BIDDING' && (
            <Card variant="outlined">
              <CardContent className="p-4">
                <div className="text-center">
                  {productData.status === 'BEFORE_START' && (
                    <div className="text-amber-600">
                      <Clock className="mx-auto mb-2 h-8 w-8" />
                      <p className="font-semibold">경매 시작 전</p>
                      <p className="text-sm">
                        경매가 시작되면 입찰할 수 있습니다.
                      </p>
                    </div>
                  )}
                  {productData.status === 'SUCCESSFUL' && (
                    <div className="text-green-600">
                      <p className="font-semibold">경매 완료</p>
                      <p className="text-sm">
                        이 상품의 경매가 성공적으로 완료되었습니다.
                      </p>
                    </div>
                  )}
                  {productData.status === 'PAID' && (
                    <div className="text-blue-600">
                      <p className="font-semibold">결제 완료</p>
                      <p className="text-sm">
                        이 상품의 결제가 완료되었습니다.
                      </p>
                    </div>
                  )}
                  {productData.status === 'FAILED' && (
                    <div className="text-red-600">
                      <p className="font-semibold">경매 실패</p>
                      <p className="text-sm">이 상품의 경매가 실패했습니다.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
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

          {isLoggedIn ? (
            <div className="py-8 text-center">
              <MessageSquare className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
              <p className="mb-4 text-neutral-600">
                이 상품에 대한 리뷰를 작성해보세요.
              </p>
              <Button
                onClick={() =>
                  router.push(`/review?productId=${productData.id}`)
                }
                className="bg-primary-600 hover:bg-primary-700"
              >
                리뷰 작성하기
              </Button>
            </div>
          ) : (
            <div className="py-8 text-center">
              <MessageSquare className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
              <p className="mb-4 text-neutral-600">
                리뷰를 작성하려면 로그인이 필요합니다.
              </p>
              <Button variant="outline" onClick={() => router.push('/login')}>
                로그인하기
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
