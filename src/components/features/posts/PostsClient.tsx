'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Post } from '@/types'
import { Search } from 'lucide-react'
import { useState } from 'react'

interface PostsClientProps {
  initialPosts: Post[]
}

const categories = [
  { id: 'notice', label: '공지사항', count: 5 },
  { id: 'qna', label: 'Q&A', count: 5 },
  { id: 'faq', label: 'FAQ', count: 7 },
]

// 임시 데이터
const mockPosts: Post[] = [
  {
    id: '1',
    title: '비드 앱 버전 2.0 업데이트 안내',
    content: '실시간 알림 기능과 새로운 UI가 추가되었습니다.',
    author: '관리자',
    category: 'notice',
    createdAt: '2024-01-15T00:00:00Z',
    isImportant: true,
    isPinned: false,
    viewCount: 1234,
    commentCount: 0,
  },
  {
    id: '2',
    title: '설날 연휴 고객센터 운영시간 안내',
    content: '2월 9일~12일 고객센터 운영시간이 단축됩니다.',
    author: '관리자',
    category: 'notice',
    createdAt: '2024-01-12T00:00:00Z',
    isImportant: false,
    isPinned: false,
    viewCount: 567,
    commentCount: 0,
  },
  {
    id: '3',
    title: "신규 카테고리 '반려동물용품' 추가",
    content: '반려동물 관련 상품을 더욱 쉽게 찾으실 수 있습니다.',
    author: '관리자',
    category: 'notice',
    createdAt: '2024-01-10T00:00:00Z',
    isImportant: false,
    isPinned: false,
    viewCount: 234,
    commentCount: 0,
  },
  {
    id: '4',
    title: '시스템 점검 안내',
    content: '1월 20일 새벽 2시~4시 시스템 점검이 있을 예정입니다.',
    author: '관리자',
    category: 'notice',
    createdAt: '2024-01-08T00:00:00Z',
    isImportant: true,
    isPinned: false,
    viewCount: 890,
    commentCount: 0,
  },
  {
    id: '5',
    title: '개인정보 처리방침 개정 안내',
    content: '개인정보 처리방침이 개정되어 안내드립니다.',
    author: '관리자',
    category: 'notice',
    createdAt: '2024-01-05T00:00:00Z',
    isImportant: false,
    isPinned: false,
    viewCount: 345,
    commentCount: 0,
  },
]

export function PostsClient({ initialPosts }: PostsClientProps) {
  const [selectedCategory, setSelectedCategory] = useState('notice')
  const [searchQuery, setSearchQuery] = useState('')
  const [posts] = useState(initialPosts)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
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
      <div className="mb-6 flex space-x-2 overflow-x-auto pb-2">
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

      {/* 게시글 목록 */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <Card variant="outlined">
            <CardContent className="py-12 text-center">
              <p className="text-neutral-500">게시글이 없습니다.</p>
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
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center space-x-2">
                      {post.isImportant && <Badge variant="error">중요</Badge>}
                      <h3 className="line-clamp-2 text-lg font-semibold text-neutral-900">
                        {post.title}
                      </h3>
                    </div>

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
                        {post.commentCount > 0 && (
                          <span>댓글 {post.commentCount}</span>
                        )}
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
