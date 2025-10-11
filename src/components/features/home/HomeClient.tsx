'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { productApi } from '@/lib/api'
import { Product } from '@/types'
import { Clock, Filter, Heart, MapPin, Search, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface HomeStats {
  activeAuctions: number
  endingToday: number
  totalParticipants: number
  successRate: number
}

interface HomeClientProps {
  stats: HomeStats
}

const categories = [
  { id: 'all', label: '전체' },
  { id: 'digital', label: '디지털·가전' },
  { id: 'fashion', label: '패션·의류' },
  { id: 'beauty', label: '뷰티·미용' },
  { id: 'home', label: '홈·리빙' },
  { id: 'sports', label: '스포츠·레저' },
  { id: 'books', label: '도서·음반' },
  { id: 'other', label: '기타' },
]

export function HomeClient({ stats }: HomeClientProps) {
  const router = useRouter()
  const { isLoggedIn } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // 상품 목록 로드
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true)
        setError('')

        const response = await productApi.getProducts({
          page: 1,
          size: 20,
          keyword: searchQuery,
          category:
            selectedCategory !== 'all'
              ? [parseInt(selectedCategory)]
              : undefined,
        })

        if (response.success) {
          setProducts(response.data?.content || [])
        } else {
          setError('상품을 불러오는데 실패했습니다.')
        }
      } catch (err) {
        console.error('상품 로드 에러:', err)
        setError('상품을 불러오는데 실패했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [searchQuery, selectedCategory])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원'
  }

  const formatTimeLeft = (endTime: string) => {
    const now = new Date().getTime()
    const end = new Date(endTime).getTime()
    const diff = end - now

    if (diff <= 0) return '종료됨'

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}시간 ${minutes}분 남음`
    } else {
      return `${minutes}분 남음`
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory
    const matchesSearch =
      product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* 통계 카드 */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card variant="outlined">
          <CardContent className="p-4 text-center">
            <div className="text-primary-500 text-2xl font-bold">
              {stats.activeAuctions.toLocaleString()}
            </div>
            <div className="text-sm text-neutral-600">진행중인 경매</div>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent className="p-4 text-center">
            <div className="text-warning-500 text-2xl font-bold">
              {stats.endingToday.toLocaleString()}
            </div>
            <div className="text-sm text-neutral-600">오늘 마감</div>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent className="p-4 text-center">
            <div className="text-success-500 text-2xl font-bold">
              {stats.totalParticipants.toLocaleString()}
            </div>
            <div className="text-sm text-neutral-600">총 참여자</div>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent className="p-4 text-center">
            <div className="text-lg font-bold text-neutral-900">
              {stats.successRate}%
            </div>
            <div className="text-sm text-neutral-600">성공률</div>
          </CardContent>
        </Card>
      </div>

      {/* 검색 및 필터 */}
      <div className="mb-6">
        <div className="mb-4 flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              placeholder="상품명이나 설명으로 검색하세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>필터</span>
          </Button>
        </div>

        {/* 카테고리 탭 */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* 로그인 상태에 따른 메인 CTA */}
      {!isLoggedIn && (
        <div className="mb-8">
          <Card
            variant="outlined"
            className="from-primary-50 to-primary-100 bg-gradient-to-r"
          >
            <CardContent className="p-6 text-center">
              <h2 className="mb-4 text-2xl font-bold text-neutral-900">
                비드에 오신 것을 환영합니다!
              </h2>
              <p className="mb-6 text-neutral-600">
                안전하고 투명한 경매 플랫폼에서 원하는 상품을 찾아보세요.
              </p>
              <div className="flex flex-col space-y-3 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
                <Button
                  size="lg"
                  onClick={() => (window.location.href = '/login')}
                >
                  로그인
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => (window.location.href = '/signup')}
                >
                  회원가입
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 상품 목록 */}
      <div className="space-y-4">
        {isLoading ? (
          <Card variant="outlined">
            <CardContent className="py-12 text-center">
              <div className="mb-4">
                <div className="border-primary-200 border-t-primary-600 mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4"></div>
                <h3 className="text-lg font-semibold text-neutral-900">
                  상품을 불러오는 중...
                </h3>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card variant="outlined">
            <CardContent className="py-12 text-center">
              <div className="mb-4">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                  <span className="text-2xl">⚠️</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-neutral-900">
                  오류가 발생했습니다
                </h3>
                <p className="text-neutral-600">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  className="mt-4"
                >
                  다시 시도
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : filteredProducts.length === 0 ? (
          <Card variant="outlined">
            <CardContent className="py-12 text-center">
              <div className="mb-4">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                  <span className="text-2xl">📦</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-neutral-900">
                  상품이 없습니다
                </h3>
                <p className="text-neutral-600">
                  {searchQuery
                    ? '검색 결과가 없습니다. 다른 키워드로 시도해보세요.'
                    : '아직 등록된 상품이 없습니다.'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredProducts.map((product) => (
            <Card key={product.id} variant="outlined">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {/* 상품 이미지 */}
                  <div className="flex-shrink-0">
                    <div className="h-24 w-24 rounded-lg bg-neutral-200">
                      {product.images && product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.title || '상품'}
                          className="h-24 w-24 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-neutral-200">
                          <span className="text-neutral-400">📦</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 상품 정보 */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center space-x-2">
                      <Badge variant="primary">{product.category}</Badge>
                      {product.status === 'active' && (
                        <Badge variant="success">진행중</Badge>
                      )}
                    </div>

                    <h3 className="mb-2 text-lg font-semibold text-neutral-900">
                      {product.title}
                    </h3>

                    <p className="mb-3 line-clamp-2 text-sm text-neutral-600">
                      {product.description}
                    </p>

                    <div className="mb-4 space-y-1 text-sm text-neutral-600">
                      <div className="flex items-center justify-between">
                        <span>현재가:</span>
                        <span className="text-success-600 font-semibold">
                          {formatPrice(product.currentPrice)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>시작가:</span>
                        <span>{formatPrice(product.startingPrice)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>남은 시간:</span>
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeLeft(product.endTime)}</span>
                        </span>
                      </div>
                    </div>

                    {/* 판매자 정보 */}
                    <div className="mb-4 flex items-center space-x-2 text-sm">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3 text-neutral-400" />
                        <span className="text-neutral-600">
                          {product.seller?.name || '판매자'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="h-3 w-3 text-red-400" />
                        <span className="text-neutral-600">
                          {product.seller?.trustScore || 0}점
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-neutral-400" />
                        <span className="text-neutral-600">서울</span>
                      </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => router.push(`/products/${product.id}`)}
                      >
                        상세보기
                      </Button>
                      {isLoggedIn && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/products/${product.id}`)}
                        >
                          입찰하기
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
