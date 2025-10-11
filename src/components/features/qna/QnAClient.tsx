'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { boardApi } from '@/lib/api'
import { Post } from '@/types'
import { useEffect, useState } from 'react'

interface QnAClientProps {
  initialPosts: Post[]
}

export function QnAClient({ initialPosts }: QnAClientProps) {
  const [selectedCategory, setSelectedCategory] = useState('qna')
  const [searchQuery, setSearchQuery] = useState('')
  const [posts, setPosts] = useState(initialPosts || [])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // 게시글 목록 로드
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setIsLoading(true)
        setError('')

        const response = await boardApi.getPosts({
          page: 1,
          size: 20,
          boardType: selectedCategory.toUpperCase() as 'NOTICE' | 'QNA' | 'FAQ',
          keyword: searchQuery,
        })

        if (response.success) {
          setPosts(response.data?.content || [])
        } else {
          setError('게시글을 불러오는데 실패했습니다.')
        }
      } catch (err) {
        console.error('게시글 로드 에러:', err)
        setError('게시글을 불러오는데 실패했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    loadPosts()
  }, [selectedCategory, searchQuery])

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
          className="mb-4"
        />
      </div>

      {/* 카테고리 탭 */}
      <div className="mb-6">
        <div className="flex space-x-1 rounded-lg bg-neutral-100 p-1">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'text-primary-600 bg-white shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {category.label} ({category.count})
            </button>
          ))}
        </div>
      </div>

      {/* 게시글 목록 */}
      <div className="space-y-4">
        {isLoading ? (
          <Card variant="outlined">
            <CardContent className="py-12 text-center">
              <div className="mb-4">
                <div className="border-primary-200 border-t-primary-600 mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4"></div>
                <h3 className="text-lg font-semibold text-neutral-900">
                  게시글을 불러오는 중...
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
        ) : filteredPosts.length === 0 ? (
          <Card variant="outlined">
            <CardContent className="py-12 text-center">
              <div className="mb-4">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                  <span className="text-2xl">📝</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-neutral-900">
                  게시글이 없습니다
                </h3>
                <p className="text-neutral-600">
                  {searchQuery
                    ? '검색 결과가 없습니다. 다른 키워드로 시도해보세요.'
                    : '아직 등록된 게시글이 없습니다.'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post) => (
            <Card key={post.id} variant="outlined">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center space-x-2">
                      <Badge variant="primary">{post.category}</Badge>
                      {post.isImportant && (
                        <Badge variant="warning">중요</Badge>
                      )}
                      {post.isPinned && <Badge variant="success">고정</Badge>}
                    </div>

                    <h3 className="mb-2 text-lg font-semibold text-neutral-900">
                      {post.title}
                    </h3>

                    <p className="mb-3 line-clamp-2 text-sm text-neutral-600">
                      {post.content}
                    </p>

                    <div className="flex items-center space-x-4 text-sm text-neutral-500">
                      <span>작성자: {post.author}</span>
                      <span>{formatDate(post.createdAt)}</span>
                      <span>조회 {post.viewCount}</span>
                      <span>댓글 {post.commentCount}</span>
                    </div>
                  </div>

                  <div className="ml-4 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => (window.location.href = `/qna/${post.id}`)}
                    >
                      상세보기
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 글쓰기 버튼 */}
      <div className="mt-8 text-center">
        <Button onClick={() => (window.location.href = '/qna/write')}>
          글쓰기
        </Button>
      </div>
    </div>
  )
}
