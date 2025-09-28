'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Product } from '@/types'
import { Clock, Filter, Heart, MapPin, Search, User } from 'lucide-react'
import { useState } from 'react'

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

// 임시 데이터 (실제로는 API에서 가져올 데이터)
const mockProducts: Product[] = [
  {
    id: '1',
    title: '아이폰 14 Pro 128GB 딥퍼플',
    description: '거의 새상품입니다. 케이스와 액정보호필름 포함',
    category: 'digital',
    images: ['/images/iphone.jpg'],
    startingPrice: 800000,
    currentPrice: 950000,
    seller: {
      id: '1',
      name: '믿음직한판매자',
      email: 'seller@example.com',
      phone: '010-1234-5678',
      trustScore: 96,
      reviewCount: 127,
      joinDate: '2023-01-01',
      isVerified: true,
    },
    status: 'active',
    location: '서울 강남구',
    createdAt: '2024-01-15T10:00:00Z',
    endTime: '2024-01-16T10:00:00Z',
    bidCount: 12,
    isLiked: false,
  },
  {
    id: '2',
    title: '맥북 에어 M2 13인치 실버',
    description: 'M2 칩셋, 8GB RAM, 256GB SSD',
    category: 'digital',
    images: ['/images/macbook.jpg'],
    startingPrice: 1200000,
    currentPrice: 1350000,
    seller: {
      id: '2',
      name: '애플러버',
      email: 'apple@example.com',
      phone: '010-2345-6789',
      trustScore: 94,
      reviewCount: 89,
      joinDate: '2023-02-01',
      isVerified: true,
    },
    status: 'active',
    location: '서울 서초구',
    createdAt: '2024-01-15T09:00:00Z',
    endTime: '2024-01-16T09:00:00Z',
    bidCount: 8,
    isLiked: true,
  },
  {
    id: '3',
    title: '나이키 에어맥스 270 (새상품)',
    description: '사이즈 280, 미착용 새상품',
    category: 'fashion',
    images: ['/images/nike.jpg'],
    startingPrice: 100000,
    currentPrice: 135000,
    seller: {
      id: '3',
      name: '신발덕후',
      email: 'shoes@example.com',
      phone: '010-3456-7890',
      trustScore: 88,
      reviewCount: 45,
      joinDate: '2023-03-01',
      isVerified: false,
    },
    status: 'active',
    location: '부산 해운대구',
    createdAt: '2024-01-15T08:00:00Z',
    endTime: '2024-01-17T08:00:00Z',
    bidCount: 15,
    isLiked: false,
  },
]

export function HomeClient({ stats }: HomeClientProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const formatTimeRemaining = (endTime: string) => {
    const now = new Date()
    const end = new Date(endTime)
    const diff = end.getTime() - now.getTime()

    if (diff <= 0) return '마감'

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours >= 24) {
      const days = Math.floor(hours / 24)
      return `${days}일 ${hours % 24}시간`
    }

    return `${hours}시간 ${minutes}분`
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* 메인 CTA 섹션 */}
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-3xl font-bold text-neutral-900">
          실시간 경매로 더 재미있게!
        </h1>
        <p className="mb-6 text-lg text-neutral-600">
          당신의 물건을 경매로 판매하고, 원하는 상품을 경쟁 입찰로 구매해보세요
        </p>
        <Button size="lg" className="bg-primary-500 hover:bg-primary-600">
          로그인하고 시작하기
        </Button>
      </div>

      {/* 검색 및 필터 */}
      <div className="mb-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <Input
              placeholder="어떤 상품을 찾으시나요?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-5 w-5" />}
            />
          </div>
          <Button variant="outline" className="sm:w-auto">
            <Filter className="mr-2 h-4 w-4" />
            필터
          </Button>
        </div>

        {/* 카테고리 탭 */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
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

      {/* 통계 카드 */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card variant="outlined">
          <CardContent className="py-6 text-center">
            <div className="text-primary-500 mb-1 text-2xl font-bold">
              {stats.activeAuctions}
            </div>
            <div className="text-sm text-neutral-600">진행중인 경매</div>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent className="py-6 text-center">
            <div className="text-warning-500 mb-1 text-2xl font-bold">
              {stats.endingToday}
            </div>
            <div className="text-sm text-neutral-600">오늘 마감</div>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent className="py-6 text-center">
            <div className="text-secondary-500 mb-1 text-2xl font-bold">
              {stats.totalParticipants.toLocaleString()}
            </div>
            <div className="text-sm text-neutral-600">총 참여자</div>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent className="py-6 text-center">
            <div className="text-success-500 mb-1 text-2xl font-bold">
              {stats.successRate}%
            </div>
            <div className="text-sm text-neutral-600">성사율</div>
          </CardContent>
        </Card>
      </div>

      {/* 인기 경매 섹션 */}
      <div className="mb-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center text-xl font-bold text-neutral-900">
            🔥 인기 경매
          </h2>
          <Button variant="ghost" size="sm">
            더보기
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockProducts.map((product) => (
            <Card
              key={product.id}
              variant="elevated"
              className="overflow-hidden"
            >
              <div className="relative">
                <div className="flex aspect-square items-center justify-center bg-neutral-100">
                  <div className="text-sm text-neutral-400">이미지</div>
                </div>

                <div className="absolute top-2 left-2">
                  <Badge variant="primary">경매중</Badge>
                </div>

                <button className="absolute top-2 right-2 rounded-full bg-white/80 p-2 transition-colors hover:bg-white">
                  <Heart
                    className={`h-4 w-4 ${
                      product.isLiked
                        ? 'text-error-500 fill-current'
                        : 'text-neutral-400'
                    }`}
                  />
                </button>

                <div className="absolute bottom-2 left-2">
                  <Badge
                    variant="neutral"
                    className="flex items-center space-x-1"
                  >
                    <Clock className="h-3 w-3" />
                    <span>{formatTimeRemaining(product.endTime)}</span>
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4">
                <h3 className="mb-2 line-clamp-2 font-semibold text-neutral-900">
                  {product.title}
                </h3>

                <div className="mb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">
                      현재 입찰가
                    </span>
                    <span className="text-primary-500 text-lg font-bold">
                      {formatPrice(product.currentPrice)}원
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">시작가</span>
                    <span className="text-sm text-neutral-500">
                      {formatPrice(product.startingPrice)}원
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-sm text-neutral-600">
                      <User className="mr-1 h-4 w-4" />
                      {product.bidCount}명 참여
                    </span>
                    <span className="flex items-center text-sm text-neutral-600">
                      <MapPin className="mr-1 h-4 w-4" />
                      {product.location}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="bg-primary-100 flex h-8 w-8 items-center justify-center rounded-full">
                    <span className="text-primary-600 text-sm font-medium">
                      {product.seller.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">
                      {product.seller.name}
                    </div>
                    <div className="text-xs text-neutral-500">
                      신뢰도 {product.seller.trustScore}점 ·{' '}
                      {product.seller.reviewCount}개 리뷰
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
