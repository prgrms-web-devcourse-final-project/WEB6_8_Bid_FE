'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Post } from '@/types'
import { Heart, Share2, ThumbsUp } from 'lucide-react'
import { useState } from 'react'

interface QnADetailClientProps {
  post: Post
}

export function QnADetailClient({ post }: QnADetailClientProps) {
  const [newComment, setNewComment] = useState('')
  const [comments] = useState<any[]>([]) // 실제 API에서 가져올 댓글 데이터
  const [relatedPosts] = useState<Post[]>([]) // 실제 API에서 가져올 관련 게시글 데이터

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      // 댓글 작성 API 호출
      console.log('댓글 작성:', newComment)
      setNewComment('')
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      {/* 게시글 내용 */}
      <Card variant="outlined" className="mb-6">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center space-x-2">
            <Badge variant="primary">{post.category}</Badge>
            {post.isImportant && <Badge variant="warning">중요</Badge>}
            {post.isPinned && <Badge variant="success">고정</Badge>}
          </div>

          <h1 className="mb-4 text-2xl font-bold text-neutral-900">
            {post.title}
          </h1>

          <div className="mb-6 flex items-center space-x-4 text-sm text-neutral-500">
            <span>작성자: {post.author}</span>
            <span>{formatDate(post.createdAt)}</span>
            <span>조회 {post.viewCount}</span>
            <span>댓글 {post.commentCount}</span>
          </div>

          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap text-neutral-700">
              {post.content}
            </p>
          </div>

          {/* 액션 버튼들 */}
          <div className="mt-6 flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <ThumbsUp className="mr-1 h-4 w-4" />
              도움됨
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="mr-1 h-4 w-4" />
              공유
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 댓글 섹션 */}
      <Card variant="outlined" className="mb-6">
        <CardContent className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-neutral-900">
            댓글 ({comments.length})
          </h3>

          {/* 댓글 작성 */}
          <div className="mb-6">
            <div className="flex space-x-2">
              <Input
                placeholder="댓글을 작성하세요..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
              >
                작성
              </Button>
            </div>
          </div>

          {/* 댓글 목록 */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="py-8 text-center text-neutral-500">
                아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
              </div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="border-b border-neutral-100 pb-4 last:border-b-0"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-neutral-900">
                        {comment.author}
                      </span>
                      <span className="text-sm text-neutral-500">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-neutral-700">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* 관련 게시글 */}
      {relatedPosts.length > 0 && (
        <Card variant="outlined">
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-neutral-900">
              관련 게시글
            </h3>
            <div className="space-y-2">
              {relatedPosts.map((relatedPost) => (
                <div
                  key={relatedPost.id}
                  className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 hover:bg-neutral-50"
                >
                  <div>
                    <h4 className="font-medium text-neutral-900">
                      {relatedPost.title}
                    </h4>
                    <p className="text-sm text-neutral-500">
                      {formatDate(relatedPost.createdAt)}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    보기
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
