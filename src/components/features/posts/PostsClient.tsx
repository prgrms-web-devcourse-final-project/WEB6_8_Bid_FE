'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Post } from '@/types'
import { Search } from 'lucide-react'
import { useState } from 'react'

interface PostsClientProps {
  initialPosts?: Post[]
}

export function PostsClient({ initialPosts }: PostsClientProps) {
  const [selectedCategory, setSelectedCategory] = useState('notice')
  const [searchQuery, setSearchQuery] = useState('')
  const [posts] = useState(initialPosts || [])

  // 실제 데이터에서 카운트 계산
  const categories = [
    {
      id: 'notice',
      label: '공지사항',
      count: posts.filter((p) => p.category === 'notice').length,
    },
    {
      id: 'qna',
      label: 'Q&A',
      count: posts.filter((p) => p.category === 'qna').length,
    },
    {
      id: 'faq',
      label: 'FAQ',
      count: posts.filter((p) => p.category === 'faq').length,
    },
  ]

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
