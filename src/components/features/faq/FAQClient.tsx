'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Post } from '@/types'
import { Search } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface FAQClientProps {
  initialPosts: Post[]
}

const categories = [
  { id: 'notice', label: '공지사항', count: 5 },
  { id: 'qna', label: 'Q&A', count: 5 },
  { id: 'faq', label: 'FAQ', count: 7 },
]

// 임시 FAQ 데이터
const mockFAQPosts = [
  {
    id: 'faq1',
    question: '경매는 어떻게 진행되나요?',
    answer:
      '상품 등록 → 경매 시작 → 입찰 참여 → 경매 종료 → 낙찰자 결정 → 거래 진행 순으로 이루어집니다.',
    category: 'faq',
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'faq2',
    question: '입찰가는 어떻게 결정해야 하나요?',
    answer:
      '시장 가격을 참고하여 적정한 금액을 입찰하시길 권합니다. 너무 높게 입찰하지 않도록 주의하세요.',
    category: 'faq',
    createdAt: '2024-01-14T00:00:00Z',
  },
  {
    id: 'faq3',
    question: '거래는 어떻게 이루어지나요?',
    answer:
      '낙찰 후 판매자와 구매자의 연락처가 서로 공개되어 직접 연락하여 거래를 진행합니다.',
    category: 'faq',
    createdAt: '2024-01-13T00:00:00Z',
  },
  {
    id: 'faq4',
    question: '사기를 당한 경우 어떻게 하나요?',
    answer:
      '고객센터로 신고해 주시면 조사 후 적절한 조치를 취해드립니다. 증거자료를 함께 제출해 주세요.',
    category: 'faq',
    createdAt: '2024-01-12T00:00:00Z',
  },
  {
    id: 'faq5',
    question: '배송비는 누가 부담하나요?',
    answer: '낙찰 후 배송비는 판매자와 구매자 중 누가 부담하는 건가요?',
    category: 'faq',
    createdAt: '2024-01-11T00:00:00Z',
  },
  {
    id: 'faq6',
    question: '경매 시간은 어떻게 정해지나요?',
    answer:
      '판매자가 직접 설정할 수 있으며, 최소 1시간부터 최대 7일까지 설정 가능합니다.',
    category: 'faq',
    createdAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 'faq7',
    question: '입찰 취소가 가능한가요?',
    answer:
      '경매 종료 1시간 전까지는 입찰 취소가 가능합니다. 이후에는 취소할 수 없습니다.',
    category: 'faq',
    createdAt: '2024-01-09T00:00:00Z',
  },
]

export function FAQClient({ initialPosts }: FAQClientProps) {
  const [selectedCategory, setSelectedCategory] = useState('faq')
  const [searchQuery, setSearchQuery] = useState('')
  const [posts] = useState(mockFAQPosts)

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = post.category === selectedCategory
    const matchesSearch =
      searchQuery === '' ||
      post.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.answer.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesCategory && matchesSearch
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* 검색바 */}
      <div className="mb-6">
        <Input
          placeholder="검색어를 입력하세요"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="h-5 w-5" />}
        />
      </div>

      {/* 카테고리 탭 */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {category.label} ({category.count})
            </button>
          ))}
        </div>

        {/* FAQ 작성 버튼 */}
        <Link href="/faq/write">
          <Button size="sm">FAQ 작성</Button>
        </Link>
      </div>

      {/* FAQ 목록 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900">
          자주 묻는 질문
        </h2>

        {filteredPosts.length === 0 ? (
          <Card variant="outlined">
            <CardContent className="py-12 text-center">
              <p className="text-neutral-500">FAQ가 없습니다.</p>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post) => (
            <Card
              key={post.id}
              variant="outlined"
              className="transition-shadow hover:shadow-md"
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* 질문 */}
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="bg-primary-100 flex h-8 w-8 items-center justify-center rounded-full">
                        <span className="text-primary-600 text-sm font-bold">
                          Q
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-neutral-900">
                        {post.question}
                      </h3>
                    </div>
                  </div>

                  {/* 구분선 */}
                  <div className="border-t border-dashed border-neutral-300"></div>

                  {/* 답변 */}
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="bg-success-100 flex h-8 w-8 items-center justify-center rounded-full">
                        <span className="text-success-600 text-sm font-bold">
                          A
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="leading-relaxed text-neutral-700">
                        {post.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 고객센터 안내 */}
      <Card variant="outlined" className="mt-8 bg-neutral-50">
        <CardContent className="p-4">
          <h3 className="mb-2 font-semibold text-neutral-900">
            문제가 해결되지 않으셨나요?
          </h3>
          <p className="mb-4 text-sm text-neutral-600">
            고객센터로 직접 문의해 주시면 빠르게 도움을 드리겠습니다.
          </p>
          <Button variant="outline" size="sm">
            고객센터 문의하기
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
