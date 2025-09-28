'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Post } from '@/types'
import { Search } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface QnAClientProps {
  initialPosts: Post[]
}

const categories = [
  { id: 'notice', label: '공지사항', count: 5 },
  { id: 'qna', label: 'Q&A', count: 5 },
  { id: 'faq', label: 'FAQ', count: 7 },
]

// 임시 Q&A 데이터
const mockQnAPosts: Post[] = [
  {
    id: '1',
    title: '입찰 취소가 가능한가요?',
    content: '경매 진행 중 입찰을 취소하고 싶은데 방법이 있나요?',
    author: '경매초보',
    category: 'qna',
    createdAt: '2024-01-15T00:00:00Z',
    isImportant: false,
    isPinned: false,
    viewCount: 1234,
    commentCount: 2,
  },
  {
    id: '2',
    title: '판매자와 연락이 안 돼요',
    content: '낙찰받은 상품의 판매자와 연락이 안 되는 경우 어떻게 해야 하나요?',
    author: '걱정많은구매자',
    category: 'qna',
    createdAt: '2024-01-14T00:00:00Z',
    isImportant: false,
    isPinned: false,
    viewCount: 567,
    commentCount: 1,
  },
  {
    id: '3',
    title: '상품 등록 시 사진 업로드 오류',
    content: '상품 사진을 업로드하려고 하는데 계속 오류가 발생합니다.',
    author: '판매하고싶어요',
    category: 'qna',
    createdAt: '2024-01-13T00:00:00Z',
    isImportant: false,
    isPinned: false,
    viewCount: 234,
    commentCount: 0,
  },
  {
    id: '4',
    title: '입찰 내역을 확인하는 방법은?',
    content: '내가 입찰한 상품들의 현황을 어디서 볼 수 있나요?',
    author: '궁금한사용자',
    category: 'qna',
    createdAt: '2024-01-12T00:00:00Z',
    isImportant: false,
    isPinned: false,
    viewCount: 890,
    commentCount: 1,
  },
  {
    id: '5',
    title: '배송비는 누가 부담하나요?',
    content: '낙찰 후 배송비는 판매자와 구매자 중 누가 부담하는 건가요?',
    author: '신규회원',
    category: 'qna',
    createdAt: '2024-01-11T00:00:00Z',
    isImportant: false,
    isPinned: false,
    viewCount: 345,
    commentCount: 3,
  },
]

export function QnAClient({ initialPosts }: QnAClientProps) {
  const [selectedCategory, setSelectedCategory] = useState('qna')
  const [searchQuery, setSearchQuery] = useState('')
  const [posts] = useState(mockQnAPosts)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const getStatusBadge = (commentCount: number) => {
    return commentCount > 0 ? '답변완료' : '답변대기'
  }

  const getStatusVariant = (commentCount: number) => {
    return commentCount > 0 ? 'success' : 'warning'
  }

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = post.category === selectedCategory
    const matchesSearch =
      searchQuery === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase())

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

        {/* 질문하기 버튼 */}
        <Link href="/qna/write">
          <Button size="sm">질문하기</Button>
        </Link>
      </div>

      {/* Q&A 목록 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900">Q&A</h2>

        {filteredPosts.length === 0 ? (
          <Card variant="outlined">
            <CardContent className="py-12 text-center">
              <p className="text-neutral-500">질문이 없습니다.</p>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post) => (
            <Card
              key={post.id}
              variant="outlined"
              className="transition-shadow hover:shadow-md"
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  {/* 아바타 */}
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200">
                      <span className="text-sm font-medium text-neutral-600">
                        {post.author.charAt(0)}
                      </span>
                    </div>
                  </div>

                  {/* 내용 */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center space-x-2">
                      <Badge variant={getStatusVariant(post.commentCount)}>
                        {getStatusBadge(post.commentCount)}
                      </Badge>
                    </div>

                    <Link href={`/qna/${post.id}`}>
                      <h3 className="hover:text-primary-500 mb-2 text-lg font-semibold text-neutral-900 transition-colors">
                        {post.title}
                      </h3>
                    </Link>

                    <p className="mb-3 line-clamp-2 text-sm text-neutral-600">
                      {post.content}
                    </p>

                    <div className="flex items-center justify-between text-sm text-neutral-500">
                      <div className="flex items-center space-x-4">
                        <span>{post.author}</span>
                        <span>{formatDate(post.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span>조회 {post.viewCount}</span>
                        <span>댓글 {post.commentCount}</span>
                      </div>
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
