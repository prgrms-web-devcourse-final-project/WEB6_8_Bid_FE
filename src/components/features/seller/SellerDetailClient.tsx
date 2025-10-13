'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { productApi } from '@/lib/api'
import { Product } from '@/types'
import {
  Award,
  Calendar,
  Eye,
  Package,
  Shield,
  Star,
  Users,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface SellerDetailClientProps {
  seller: {
    id: string
    name: string
    email: string
    phone: string
    profileImage?: string
    trustScore: number
    reviewCount: number
    joinDate: string
    isVerified: boolean
  }
  products?: Product[]
}

export function SellerDetailClient({
  seller,
  products: initialProducts,
}: SellerDetailClientProps) {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>(initialProducts || [])
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  console.log('🏪 SellerDetailClient 렌더링:', {
    seller,
    initialProducts,
    productsCount: products.length,
  })

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

  // 판매자 상품 조회
  const fetchSellerProducts = async () => {
    console.log('🏪 판매자 상품 조회 시작:', { sellerId: seller.id })
    setIsLoading(true)
    setApiError('')
    try {
      const response = await productApi.getProductsByMember(+seller.id)
      if (response.success && response.data) {
        let productsData = []
        if (Array.isArray(response.data)) {
          productsData = response.data
        } else if (
          response.data.content &&
          Array.isArray(response.data.content)
        ) {
          productsData = response.data.content
        }

        // API 응답을 Product 타입으로 매핑
        const mappedProducts = productsData.map((product: any) => ({
          id: product.productId || product.id,
          title: product.name || product.title,
          description: product.description || '',
          category: product.category,
          startingPrice: product.initialPrice || product.startingPrice,
          currentPrice: product.currentPrice,
          endTime: product.auctionEndTime || product.endTime,
          status: product.status || 'BIDDING',
          images: product.thumbnailUrl
            ? [product.thumbnailUrl]
            : product.images || [],
          thumbnailUrl: product.thumbnailUrl || '',
          seller: {
            id: String(product.seller?.id || product.sellerId || '1'),
            email: product.seller?.email || '',
            name: product.seller?.nickname || product.seller?.name || '판매자',
            phone: product.seller?.phone || '',
            profileImage:
              product.seller?.profileImageUrl || product.seller?.profileImage,
            trustScore:
              product.seller?.creditScore || product.seller?.trustScore || 0,
            reviewCount: product.seller?.reviewCount || 0,
            joinDate: product.seller?.joinDate || '',
            isVerified: product.seller?.isVerified || false,
          },
          location: product.location || '',
          createdAt: product.createdAt || '',
          bidCount: product.bidderCount || product.bidCount || 0,
          isLiked: product.isLiked || false,
        }))

        setProducts(mappedProducts)
      } else {
        setApiError(response.msg || '상품을 불러오는데 실패했습니다.')
      }
    } catch (error: any) {
      console.error('🏪 판매자 상품 조회 실패:', error)
      setApiError(
        error.response?.data?.msg || '상품을 불러오는데 실패했습니다.',
      )
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (!initialProducts || initialProducts.length === 0) {
      fetchSellerProducts()
    }
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원'
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString || dateString === 'Invalid Date' || dateString === '') {
      return ''
    }
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return ''
      }
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    } catch {
      return ''
    }
  }

  const formatDisplayValue = (value: any, fallback: string = '') => {
    if (
      value === null ||
      value === undefined ||
      value === '' ||
      value === 'Invalid Date'
    ) {
      return fallback
    }
    return value
  }

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600'
    if (score >= 60) return 'text-amber-600'
    return 'text-red-500'
  }

  const getTrustScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    if (score >= 60) return 'bg-amber-100 text-amber-800 border-amber-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { text: string; color: string } } = {
      BIDDING: { text: '경매중', color: 'bg-blue-100 text-blue-800' },
      BEFORE_START: { text: '시작전', color: 'bg-gray-100 text-gray-800' },
      SUCCESSFUL: { text: '낙찰', color: 'bg-green-100 text-green-800' },
      FAILED: { text: '유찰', color: 'bg-red-100 text-red-800' },
    }
    return (
      statusMap[status] || {
        text: '알 수 없음',
        color: 'bg-gray-100 text-gray-800',
      }
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 판매자 프로필 헤더 */}
        <div className="relative mb-12 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl">
          {/* 배경 패턴 */}
          <div className="absolute inset-0 opacity-20">
            <div className="h-full w-full bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:20px_20px]"></div>
          </div>

          <div className="relative">
            <div className="flex flex-col items-center space-y-8 lg:flex-row lg:items-start lg:space-y-0 lg:space-x-12">
              {/* 판매자 아바타 */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="h-32 w-32 overflow-hidden rounded-full bg-white/20 shadow-2xl ring-4 ring-white/30 backdrop-blur-sm">
                    <div className="flex h-32 w-32 items-center justify-center">
                      <span className="text-4xl font-bold text-white">
                        {formatDisplayValue(seller.name, 'S')
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    </div>
                  </div>
                  {seller.isVerified && (
                    <div className="absolute -right-2 -bottom-2 rounded-full bg-emerald-500 p-3 shadow-lg ring-4 ring-white">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* 판매자 정보 */}
              <div className="min-w-0 flex-1 text-center lg:text-left">
                <div className="mb-8">
                  <h1 className="mb-4 text-5xl font-bold text-white drop-shadow-lg">
                    {formatDisplayValue(seller.name, '판매자')}
                  </h1>
                  <div className="inline-flex items-center rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-sm">
                    <Award className="mr-2 h-4 w-4" />
                    {seller.isVerified ? '인증된 판매자' : '판매자'}
                  </div>
                </div>

                {/* 판매자 통계 */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white/15 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-white/20">
                    <div className="text-center">
                      <div className="mb-2 text-3xl font-bold text-white">
                        {products.length}
                      </div>
                      <div className="flex items-center justify-center text-sm text-white/90">
                        <Package className="mr-1 h-4 w-4" />
                        등록 상품
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white/15 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-white/20">
                    <div className="text-center">
                      <div className="mb-2 text-3xl font-bold text-white">
                        {seller.trustScore}
                      </div>
                      <div className="flex items-center justify-center text-sm text-white/90">
                        <Star className="mr-1 h-4 w-4" />
                        신뢰도 점수
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white/15 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-white/20">
                    <div className="text-center">
                      <div className="mb-2 text-3xl font-bold text-white">
                        {seller.reviewCount}
                      </div>
                      <div className="flex items-center justify-center text-sm text-white/90">
                        <Users className="mr-1 h-4 w-4" />
                        리뷰 수
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 판매자 상품 목록 */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-600">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">등록 상품</h2>
              <p className="text-gray-600">
                총 {products.length}개의 상품이 등록되어 있습니다
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
            <p className="text-lg text-gray-600">상품을 불러오는 중...</p>
          </div>
        ) : products.length === 0 ? (
          <Card className="overflow-hidden border-0 bg-white/80 shadow-xl backdrop-blur-sm">
            <CardContent className="py-20 text-center">
              <div className="mb-8">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-gray-100 to-gray-200">
                  <Package className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="mb-4 text-2xl font-bold text-gray-900">
                  등록된 상품이 없습니다
                </h3>
                <p className="text-lg text-gray-600">
                  이 판매자는 아직 상품을 등록하지 않았습니다.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => {
              const statusInfo = getStatusBadge(product.status)
              return (
                <Card
                  key={product.id}
                  className="group overflow-hidden border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                >
                  <CardContent className="p-0">
                    <div className="space-y-0">
                      {/* 상품 이미지 */}
                      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                        {product.thumbnailUrl ||
                        (product.images && product.images[0]) ? (
                          <img
                            src={
                              product.thumbnailUrl ||
                              getImageUrl(product.images[0])
                            }
                            alt={product.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <div className="text-center">
                              <Package className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                              <p className="text-sm text-gray-500">
                                이미지 준비중
                              </p>
                            </div>
                          </div>
                        )}

                        {/* 카테고리 배지 */}
                        <div className="absolute top-4 left-4">
                          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-700 shadow-lg backdrop-blur-sm">
                            {formatDisplayValue(product.category, '기타')}
                          </span>
                        </div>

                        {/* 상태 배지 */}
                        <div className="absolute top-4 right-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${statusInfo.color} shadow-lg`}
                          >
                            {statusInfo.text}
                          </span>
                        </div>
                      </div>

                      {/* 상품 정보 */}
                      <div className="space-y-4 p-6">
                        <h3 className="line-clamp-2 text-lg font-bold text-gray-900 transition-colors duration-300 group-hover:text-indigo-600">
                          {formatDisplayValue(product.title, '상품명 없음')}
                        </h3>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
                              {formatPrice(product.currentPrice)}
                            </span>
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                              <Users className="h-4 w-4" />
                              <span>
                                {formatDisplayValue(product.bidCount, '0')}명
                              </span>
                            </div>
                          </div>

                          {formatDate(product.createdAt) && (
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>등록일</span>
                              </div>
                              <span>{formatDate(product.createdAt)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 액션 버튼 */}
                      <div className="p-6 pt-0">
                        <Button
                          className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl"
                          onClick={() => router.push(`/products/${product.id}`)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          상품 보기
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
