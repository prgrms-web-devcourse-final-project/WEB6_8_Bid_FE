'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ErrorAlert } from '@/components/ui/error-alert'
import { Input } from '@/components/ui/input'
import { boardApi } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const categories = [
  { id: 'general', label: '일반' },
  { id: 'technical', label: '기술' },
  { id: 'payment', label: '결제' },
  { id: 'shipping', label: '배송' },
  { id: 'other', label: '기타' },
]

export function QnAWriteClient() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    images: [] as File[],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // 에러 메시지 초기화
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setApiError('')

    // 유효성 검사
    const newErrors: Record<string, string> = {}

    if (!formData.title) {
      newErrors.title = '제목을 입력해주세요'
    }

    if (!formData.content) {
      newErrors.content = '질문 내용을 입력해주세요'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      try {
        // 게시글 작성 API 호출
        const response = await boardApi.writeBoard({
          title: formData.title,
          content: formData.content,
          boardType: 'QNA',
        })

        console.log('🔍 게시글 작성 API 응답 전체:', response)

        if (response.success) {
          console.log('✅ 게시글 작성 성공:', response.data)
          alert('질문이 성공적으로 등록되었습니다.')
          router.push('/qna')
        } else {
          console.log('❌ 게시글 작성 실패:', response)
          setApiError('질문 등록에 실패했습니다. 다시 시도해주세요.')
        }
      } catch (error: any) {
        console.error('API 에러:', error)
        if (error.response?.status === 400) {
          const errorMessage =
            error.response.data?.errorMessage || '입력 정보를 확인해주세요.'
          setApiError(`요청 실패: ${errorMessage}`)
        } else {
          setApiError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
        }
      }
    }

    setIsLoading(false)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* API 에러 메시지 */}
        {apiError && (
          <ErrorAlert
            title="요청 실패"
            message={apiError}
            onClose={() => setApiError('')}
          />
        )}

        {/* 제목 */}
        <Card variant="outlined">
          <CardContent className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900">
              제목
            </h2>
            <Input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="제목을 입력하세요"
              error={errors.title}
            />
          </CardContent>
        </Card>

        {/* 카테고리 */}
        <Card variant="outlined">
          <CardContent className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900">
              카테고리
            </h2>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="focus:ring-primary-500 focus:border-primary-500 block w-full rounded-lg border border-neutral-300 px-3 py-2 focus:ring-2 focus:outline-none"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        {/* 내용 */}
        <Card variant="outlined">
          <CardContent className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900">
              질문 내용
            </h2>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="질문 내용을 자세히 작성해주세요"
              rows={8}
              className="focus:ring-primary-500 focus:border-primary-500 block w-full rounded-lg border border-neutral-300 px-3 py-2 focus:ring-2 focus:outline-none"
            />
            <div className="mt-2 text-sm text-neutral-500">
              <ul className="list-inside list-disc space-y-1">
                <li>구체적인 상황을 설명해주세요</li>
                <li>에러 메시지나 스크린샷이 있다면 첨부해주세요</li>
                <li>개인정보는 포함하지 마세요</li>
              </ul>
            </div>
            {errors.content && (
              <p className="text-error-500 mt-1 text-sm">{errors.content}</p>
            )}
          </CardContent>
        </Card>

        {/* 이미지 첨부 */}
        <Card variant="outlined">
          <CardContent className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900">
              이미지 첨부
            </h2>
            <div className="rounded-lg border-2 border-dashed border-neutral-300 p-8 text-center">
              <p className="mb-2 text-neutral-600">이미지를 첨부하세요</p>
              <p className="mb-4 text-sm text-neutral-500">
                최대 5장까지 업로드 가능 (JPG, PNG)
              </p>

              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="bg-primary-500 hover:bg-primary-600 inline-flex cursor-pointer items-center rounded-lg px-4 py-2 text-white"
              >
                이미지 선택
              </label>
            </div>

            {formData.images.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-sm text-neutral-600">
                  선택된 이미지 ({formData.images.length}장)
                </p>
                <div className="flex flex-wrap gap-2">
                  {formData.images.map((image, index) => (
                    <div
                      key={index}
                      className="flex h-20 w-20 items-center justify-center rounded-lg bg-neutral-100"
                    >
                      <span className="text-xs text-neutral-500">
                        이미지 {index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 제출 버튼 */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            취소
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center">
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                등록 중...
              </div>
            ) : (
              '질문 등록'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
