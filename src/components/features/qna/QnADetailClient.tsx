'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Post } from '@/types'
import { useState } from 'react'

interface QnADetailClientProps {
  post: Post
}

// 임시 댓글 데이터
const mockComments = [
  {
    id: '1',
    author: '경매고수',
    content:
      '저도 비슷한 경험이 있었는데, 고객센터에 전화하시면 친절하게 도움을 주십니다. 다만 앞으로는 신중하게 입찰하시길 권해드려요!',
    createdAt: '2024-01-15T12:30:00Z',
  },
  {
    id: '2',
    author: '경매초보',
    content:
      '감사합니다! 고객센터에 문의해보겠습니다. 앞으로 더 조심하겠습니다.',
    createdAt: '2024-01-15T13:45:00Z',
  },
]

// 임시 관련 게시글 데이터
const mockRelatedPosts = [
  {
    id: '1',
    title: '설날 연휴 고객센터 운영시간 안내',
    category: 'notice',
    createdAt: '2024-01-12T00:00:00Z',
  },
  {
    id: '2',
    title: '판매자와 연락이 안 돼요',
    category: 'qna',
    createdAt: '2024-01-14T00:00:00Z',
  },
  {
    id: '3',
    title: '상품 등록 시 사진 업로드 오류',
    category: 'qna',
    createdAt: '2024-01-13T00:00:00Z',
  },
]

export function QnADetailClient({ post }: QnADetailClientProps) {
  const [newComment, setNewComment] = useState('')
  const [comments] = useState(mockComments)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      // TODO: 댓글 등록 API 호출
      console.log('댓글 등록:', newComment)
      setNewComment('')
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      {/* 질문 내용 */}
      <Card variant="outlined" className="mb-6">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="success">답변완료</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                공유하기
              </Button>
              <Button variant="outline" size="sm">
                신고하기
              </Button>
            </div>
          </div>

          <h1 className="mb-4 text-2xl font-bold text-neutral-900">
            {post.title}
          </h1>

          <div className="mb-4 flex items-center space-x-4 text-sm text-neutral-600">
            <span>{post.author}</span>
            <span>{formatDate(post.createdAt)}</span>
            <span>조회 {post.viewCount}</span>
          </div>

          <div className="prose max-w-none">
            <p className="leading-relaxed text-neutral-700">{post.content}</p>
          </div>
        </CardContent>
      </Card>

      {/* 댓글 섹션 */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-neutral-900">
          댓글 ({comments.length})
        </h2>

        <div className="mb-6 space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id} variant="outlined">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200">
                      <span className="text-sm font-medium text-neutral-600">
                        {comment.author.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="mb-2 flex items-center space-x-2">
                      <span className="font-medium text-neutral-900">
                        {comment.author}
                      </span>
                      <span className="text-sm text-neutral-500">
                        {formatDateTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="mb-3 text-neutral-700">{comment.content}</p>
                    <div className="flex items-center space-x-4">
                      <Button variant="ghost" size="sm">
                        답글
                      </Button>
                      <Button variant="ghost" size="sm">
                        신고
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 댓글 작성 */}
        <Card variant="outlined">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="bg-primary-100 flex h-8 w-8 items-center justify-center rounded-full">
                  <span className="text-primary-600 text-sm font-medium">
                    김
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <div className="mb-2">
                  <span className="text-sm font-medium text-neutral-900">
                    김당근
                  </span>
                </div>
                <div className="space-y-3">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="댓글을 입력하세요..."
                    className="focus:ring-primary-500 focus:border-primary-500 w-full rounded-lg border border-neutral-300 px-3 py-2 focus:ring-2 focus:outline-none"
                    rows={3}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-500">
                      {newComment.length}/1000
                    </span>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        취소
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleCommentSubmit}
                        disabled={!newComment.trim()}
                      >
                        댓글 등록
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 관련 게시글 */}
      <Card variant="outlined">
        <CardContent className="p-4">
          <h3 className="mb-4 text-lg font-semibold text-neutral-900">
            관련 게시글
          </h3>
          <div className="space-y-2">
            {mockRelatedPosts.map((relatedPost) => (
              <div
                key={relatedPost.id}
                className="flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors hover:bg-neutral-50"
              >
                <div className="flex items-center space-x-3">
                  <Badge variant="neutral">
                    {relatedPost.category === 'notice' ? '공지' : 'Q&A'}
                  </Badge>
                  <span className="text-sm text-neutral-900">
                    {relatedPost.title}
                  </span>
                </div>
                <span className="text-sm text-neutral-500">
                  {formatDate(relatedPost.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
