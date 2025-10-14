'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { useWebSocketHome } from '@/hooks/useWebSocketHome'
import { productApi } from '@/lib/api'
import { Product } from '@/types'
import { Clock, Filter, MapPin, Search, User, X, Zap } from 'lucide-react'
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
  { id: 'all', label: '전체', apiId: null },
  { id: '1', label: '디지털/가전', apiId: 1 },
  { id: '2', label: '패션/의류', apiId: 2 },
  { id: '3', label: '뷰티/미용', apiId: 3 },
  { id: '4', label: '홈/리빙', apiId: 4 },
  { id: '5', label: '스포츠/레저', apiId: 5 },
  { id: '6', label: '도서/음반/DVD', apiId: 6 },
  { id: '7', label: '반려동물용품', apiId: 7 },
  { id: '8', label: '유아동/출산용품', apiId: 8 },
  { id: '9', label: '식품/건강식품', apiId: 9 },
  { id: '10', label: '자동차/오토바이', apiId: 10 },
  { id: '11', label: '취미/수집품', apiId: 11 },
  { id: '12', label: '기타', apiId: 12 },
]

const locations = [
  '서울',
  '경기도',
  '인천',
  '부산',
  '대구',
  '대전',
  '광주',
  '울산',
  '강원도',
  '충북',
  '충남',
  '전북',
  '전남',
  '경북',
  '경남',
  '제주',
]

const sortOptions = [
  { value: 'LATEST', label: '최신 등록순' },
  { value: 'PRICE_LOW', label: '가격 낮은 순' },
  { value: 'PRICE_HIGH', label: '가격 높은 순' },
  { value: 'ENDING_SOON', label: '마감 임박순' },
  { value: 'POPULAR', label: '인기순' },
]

const statusOptions = [
  { value: 'BIDDING', label: '경매 중' },
  { value: 'BEFORE_START', label: '경매 시작 전' },
  { value: 'SUCCESSFUL', label: '낙찰' },
  { value: 'FAILED', label: '유찰' },
]

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

export function HomeClient({ stats }: HomeClientProps) {
  const router = useRouter()
  const { isLoggedIn } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // WebSocket 실시간 홈 데이터 구독
  const { homeData, isSubscribed: isHomeDataSubscribed } = useWebSocketHome()
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    location: [] as string[],
    isDelivery: undefined as boolean | undefined,
    sort: 'LATEST' as
      | 'LATEST'
      | 'PRICE_LOW'
      | 'PRICE_HIGH'
      | 'ENDING_SOON'
      | 'POPULAR',
    status: 'BIDDING' as 'BIDDING' | 'FAILED' | 'BEFORE_START' | 'SUCCESSFUL',
  })

  // 상품 목록 로드
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true)
        setError('')

        const selectedCategoryData = categories.find(
          (cat) => cat.id === selectedCategory,
        )

        const requestParams = {
          page: 1,
          size: 20,
          keyword: searchQuery.trim() || undefined,
          category: selectedCategoryData?.apiId
            ? [selectedCategoryData.apiId]
            : undefined,
          location: filters.location.length > 0 ? filters.location : undefined,
          isDelivery: filters.isDelivery,
          sort: filters.sort,
          status: filters.status,
        }

        console.log('🔍 검색 파라미터:', requestParams)

        // 검색어가 있으면 Elasticsearch 먼저 시도, 실패하면 일반 DB 조회
        let response
        if (searchQuery.trim()) {
          console.log('🔍 Elasticsearch 검색 시도...')
          try {
            response = await productApi.searchProducts(requestParams)
            console.log('🔍 Elasticsearch 응답:', response)

            // ES 검색 결과가 비어있으면 일반 DB 검색으로 fallback
            if (response.success && response.data?.content?.length === 0) {
              console.log('🔍 ES 검색 결과 없음, 일반 DB 검색으로 fallback...')
              response = await productApi.getProducts(requestParams)
              console.log('🔍 일반 DB 검색 응답:', response)
            }
          } catch (error) {
            console.log('🔍 ES 검색 실패, 일반 DB 검색으로 fallback...', error)
            response = await productApi.getProducts(requestParams)
            console.log('🔍 일반 DB 검색 응답:', response)
          }
        } else {
          console.log('🔍 일반 DB 검색...')
          response = await productApi.getProducts(requestParams)
        }

        console.log('🏠 홈페이지 상품 API 응답:', response)
        console.log(
          '🔍 최종 사용된 API:',
          response?.data?.content?.length > 0 ? '검색 성공' : '검색 실패',
        )

        if (response.success && response.data) {
          // API 응답 데이터 구조에 맞게 변환
          let productsData = []
          console.log('🔍 원본 response.data:', response.data)

          if (Array.isArray(response.data)) {
            productsData = response.data
          } else if (
            response.data.content &&
            Array.isArray(response.data.content)
          ) {
            productsData = response.data.content
          } else if (
            response.data.products &&
            Array.isArray(response.data.products)
          ) {
            productsData = response.data.products
          }

          console.log('🔍 파싱된 productsData:', productsData)

          const mappedProducts = productsData.map((product: any) => ({
            productId: product.productId,
            name: product.name,
            description: product.description || '',
            category: product.category,
            initialPrice: product.initialPrice,
            currentPrice: product.currentPrice,
            auctionStartTime: product.auctionStartTime,
            auctionEndTime:
              product.auctionEndTime ||
              new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            status: mapApiStatusToKorean(product.status || 'BIDDING'),
            images: product.thumbnailUrl
              ? [product.thumbnailUrl]
              : product.images || [],
            thumbnailUrl: product.thumbnailUrl,
            seller: {
              id: String(product.seller?.id),
              nickname: product.seller?.nickname || '판매자',
              profileImage: product.seller?.profileImage || null,
              creditScore: product.seller?.creditScore || 0,
              reviewCount: product.seller?.reviewCount || 0,
            },
            location: product.location || product.seller?.location || '서울',
            createDate: product.createDate,
            modifyDate: product.modifyDate,
            bidderCount: product.bidderCount,
            deliveryMethod: product.deliveryMethod,
          }))

          setProducts(mappedProducts)
        } else {
          console.log('❌ 홈페이지 상품 로드 실패:', response)
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
  }, [searchQuery, selectedCategory, filters])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원'
  }

  const formatTimeLeft = (auctionEndTime: string) => {
    const now = new Date().getTime()
    const end = new Date(auctionEndTime).getTime()
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* 메인 히어로 섹션 */}
      <div className="from-primary-500 to-primary-600 mb-12 rounded-2xl bg-gradient-to-r p-8 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-4xl font-bold sm:text-5xl lg:text-6xl">
            실시간 경매 플랫폼
          </h1>
          <p className="mb-8 text-lg opacity-90 sm:text-xl">
            지금 바로 시작되는 흥미진진한 경매에 참여해보세요
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <button
              onClick={() => router.push('/register-product')}
              className="text-primary-600 rounded-lg bg-white px-8 py-3 font-semibold transition-colors hover:bg-gray-100"
            >
              상품 등록하기
            </button>
            <button
              onClick={() => router.push('/my-bids')}
              className="hover:text-primary-600 rounded-lg border-2 border-white px-8 py-3 font-semibold text-white transition-colors hover:bg-white"
            >
              내 입찰 현황
            </button>
          </div>
        </div>
      </div>
      {/* 통계 카드 */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card variant="outlined">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="text-primary-500 text-2xl font-bold">
                {(
                  homeData.totalActiveAuctions || stats.activeAuctions
                ).toLocaleString()}
              </div>
              {isHomeDataSubscribed && (
                <Zap className="h-4 w-4 animate-pulse text-green-500" />
              )}
            </div>
            <div className="text-sm text-neutral-600">진행중인 경매</div>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="text-warning-500 text-2xl font-bold">
                {homeData.endingSoonProducts?.length || stats.endingToday}
              </div>
              {isHomeDataSubscribed && (
                <Zap className="h-4 w-4 animate-pulse text-green-500" />
              )}
            </div>
            <div className="text-sm text-neutral-600">마감 임박</div>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="text-success-500 text-2xl font-bold">
                {homeData.totalBidsToday || stats.totalParticipants}
              </div>
              {isHomeDataSubscribed && (
                <Zap className="h-4 w-4 animate-pulse text-green-500" />
              )}
            </div>
            <div className="text-sm text-neutral-600">오늘 입찰</div>
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
              placeholder="상품명을 검색하세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            className="flex items-center space-x-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            <span>필터</span>
          </Button>
        </div>

        {/* 필터 패널 */}
        {showFilters && (
          <Card variant="outlined" className="mb-6">
            <CardContent className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">필터</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                {/* 지역 필터 */}
                <div>
                  <label className="mb-2 block text-sm font-medium">지역</label>
                  <div className="flex flex-wrap gap-2">
                    {locations.map((location) => (
                      <button
                        key={location}
                        onClick={() => {
                          setFilters((prev) => ({
                            ...prev,
                            location: prev.location.includes(location)
                              ? prev.location.filter((l) => l !== location)
                              : [...prev.location, location],
                          }))
                        }}
                        className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                          filters.location.includes(location)
                            ? 'bg-primary-500 border-primary-500 text-white'
                            : 'hover:border-primary-300 border-neutral-300 bg-white text-neutral-700'
                        }`}
                      >
                        {location}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 배송 필터 */}
                <div>
                  <label className="mb-2 block text-sm font-medium">배송</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="delivery"
                        checked={filters.isDelivery === undefined}
                        onChange={() =>
                          setFilters((prev) => ({
                            ...prev,
                            isDelivery: undefined,
                          }))
                        }
                        className="mr-2"
                      />
                      전체
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="delivery"
                        checked={filters.isDelivery === true}
                        onChange={() =>
                          setFilters((prev) => ({ ...prev, isDelivery: true }))
                        }
                        className="mr-2"
                      />
                      배송 가능
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="delivery"
                        checked={filters.isDelivery === false}
                        onChange={() =>
                          setFilters((prev) => ({ ...prev, isDelivery: false }))
                        }
                        className="mr-2"
                      />
                      직거래만
                    </label>
                  </div>
                </div>

                {/* 경매 상태 */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    경매 상태
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        status: e.target.value as
                          | 'BIDDING'
                          | 'FAILED'
                          | 'BEFORE_START'
                          | 'SUCCESSFUL',
                      }))
                    }
                    className="w-full rounded-md border border-neutral-300 p-2"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 정렬 */}
                <div>
                  <label className="mb-2 block text-sm font-medium">정렬</label>
                  <select
                    value={filters.sort}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        sort: e.target.value as
                          | 'LATEST'
                          | 'PRICE_LOW'
                          | 'PRICE_HIGH'
                          | 'ENDING_SOON'
                          | 'POPULAR',
                      }))
                    }
                    className="w-full rounded-md border border-neutral-300 p-2"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({
                      location: [],
                      isDelivery: undefined,
                      sort: 'LATEST',
                      status: 'BIDDING',
                    })
                  }}
                >
                  초기화
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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
        ) : products.length === 0 ? (
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
                    ? `"${searchQuery}"에 대한 검색 결과가 없습니다. 정확한 상품명을 입력하거나 다른 키워드로 시도해보세요.`
                    : '아직 등록된 상품이 없습니다.'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
            {products.map((product) => (
              <Card
                key={product.productId}
                variant="outlined"
                className="transition-shadow duration-200 hover:shadow-lg"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col space-y-4">
                    {/* 상품 이미지와 카테고리 */}
                    <div className="flex items-start justify-between">
                      <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-200">
                        {product.thumbnailUrl || product.images?.[0] ? (
                          <img
                            src={
                              product.thumbnailUrl ||
                              (typeof product.images?.[0] === 'string'
                                ? product.images[0]
                                : product.images?.[0]?.imageUrl)
                            }
                            alt={product.name || '상품'}
                            className="h-32 w-32 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center">
                            <div className="from-primary-200 to-primary-300 mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br">
                              <svg
                                className="text-primary-600 h-6 w-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                />
                              </svg>
                            </div>
                            <span className="text-xs font-medium text-neutral-500">
                              이미지 준비중
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Badge variant="primary" className="w-fit">
                          {product.category}
                        </Badge>
                      </div>
                    </div>

                    {/* 상품 제목과 설명 */}
                    <div>
                      <h3 className="mb-2 line-clamp-1 text-xl font-bold text-neutral-900">
                        {product.name}
                      </h3>
                      <p className="line-clamp-2 text-sm text-neutral-600">
                        {product.description}
                      </p>
                    </div>

                    {/* 가격 정보 */}
                    <div className="from-primary-50 to-primary-100 rounded-lg bg-gradient-to-r p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="mb-1 text-xs text-neutral-500">
                            현재가
                          </div>
                          <div className="text-primary-600 text-lg font-bold">
                            {formatPrice(product.currentPrice || 0)}
                          </div>
                        </div>
                        <div>
                          <div className="mb-1 text-xs text-neutral-500">
                            시작가
                          </div>
                          <div className="text-sm font-medium text-neutral-700">
                            {formatPrice(product.initialPrice || 0)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 남은 시간, 판매자, 장소 */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="text-warning-500 h-4 w-4" />
                        <span className="text-sm font-medium text-neutral-700">
                          {formatTimeLeft(
                            product.auctionEndTime ||
                              new Date(
                                Date.now() + 24 * 60 * 60 * 1000,
                              ).toISOString(),
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <User className="text-primary-500 h-4 w-4" />
                          <span className="text-sm font-medium text-neutral-700">
                            {product.seller?.nickname || '판매자'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4 text-neutral-400" />
                          <span className="text-sm text-neutral-600">
                            {product?.location || '서울'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex space-x-3 pt-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() =>
                          router.push(`/products/${product.productId}`)
                        }
                      >
                        상세보기
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
