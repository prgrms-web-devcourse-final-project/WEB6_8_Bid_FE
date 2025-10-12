'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ErrorAlert } from '@/components/ui/error-alert'
import { productApi } from '@/lib/api'
import { Product } from '@/types'
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
  initialProducts?: Product[]
}

export function SellerDetailClient({
  seller,
  initialProducts,
}: SellerDetailClientProps) {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>(initialProducts || [])
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  // 판매자 상품 조회
  const fetchSellerProducts = async () => {
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
        setProducts(productsData)
      } else {
        setApiError(response.msg || '상품을 불러오는데 실패했습니다.')
      }
    } catch (error: any) {
      console.error('판매자 상품 조회 실패:', error)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      {/* API 에러 메시지 */}
      {apiError && (
        <ErrorAlert
          title="오류"
          message={apiError}
          onClose={() => setApiError('')}
        />
      )}

      {/* 판매자 정보 */}
      <Card variant="outlined" className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-start space-x-6">
            {/* 프로필 이미지 */}
            <div className="flex-shrink-0">
              <div className="h-24 w-24 overflow-hidden rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200">
                {seller.profileImage ? (
                  <img
                    src={seller.profileImage}
                    alt={seller.name}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full">
                    <span className="text-2xl text-neutral-400">👤</span>
                  </div>
                )}
              </div>
            </div>

            {/* 판매자 정보 */}
            <div className="min-w-0 flex-1">
              <div className="mb-4 flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-neutral-900">
                  {seller.name}
                </h1>
                {seller.isVerified && (
                  <div className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                    ✓ 인증됨
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">이메일</span>
                    <span className="font-medium">{seller.email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">전화번호</span>
                    <span className="font-medium">{seller.phone}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">신뢰도</span>
                    <span
                      className={`font-medium ${getTrustScoreColor(seller.trustScore)}`}
                    >
                      {seller.trustScore}점
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">가입일</span>
                    <span className="font-medium">
                      {formatDate(seller.joinDate)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-primary-600 text-lg font-bold">
                    {products.length}
                  </div>
                  <div className="text-sm text-neutral-600">등록 상품</div>
                </div>
                <div className="text-center">
                  <div className="text-primary-600 text-lg font-bold">
                    {seller.reviewCount}
                  </div>
                  <div className="text-sm text-neutral-600">리뷰 수</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 판매자 상품 목록 */}
      <div className="mb-6">
        <h2 className="mb-4 text-xl font-semibold text-neutral-900">
          등록 상품 ({products.length}개)
        </h2>
      </div>

      {isLoading ? (
        <div className="py-8 text-center">
          <div className="border-primary-600 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-transparent"></div>
          <p className="mt-2 text-neutral-600">상품을 불러오는 중...</p>
        </div>
      ) : products.length === 0 ? (
        <Card variant="outlined">
          <CardContent className="py-12 text-center">
            <div className="mb-4">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                <span className="text-2xl">📦</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-neutral-900">
                등록된 상품이 없습니다
              </h3>
              <p className="text-neutral-600">
                이 판매자는 아직 상품을 등록하지 않았습니다.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card
              key={product.id}
              variant="outlined"
              className="transition-shadow hover:shadow-lg"
            >
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* 상품 이미지 */}
                  <div className="aspect-square overflow-hidden rounded-lg bg-gradient-to-br from-neutral-100 to-neutral-200">
                    {product.images && product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-4xl text-neutral-400">📦</span>
                      </div>
                    )}
                  </div>

                  {/* 상품 정보 */}
                  <div className="space-y-2">
                    <h3 className="line-clamp-2 font-semibold text-neutral-900">
                      {product.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-primary-600 text-lg font-bold">
                        {formatPrice(product.currentPrice)}
                      </span>
                      <span className="text-sm text-neutral-500">
                        {product.bidCount}명 참여
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-neutral-600">
                      <span>{product.category}</span>
                      <span>{formatDate(product.createdAt)}</span>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <Button
                    className="w-full"
                    onClick={() => router.push(`/products/${product.id}`)}
                  >
                    상품 보기
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
