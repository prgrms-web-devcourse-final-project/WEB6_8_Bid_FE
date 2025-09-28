'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

const categories = [
  { id: 'general', label: '일반' },
  { id: 'technical', label: '기술' },
  { id: 'payment', label: '결제' },
  { id: 'shipping', label: '배송' },
  { id: 'other', label: '기타' },
]

export function QnAWriteClient() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    images: [] as File[],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

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
      // TODO: API 호출
      console.log('Q&A 작성:', formData)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit} className="space-y-6">
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
          <Button type="button" variant="outline">
            취소
          </Button>
          <Button type="submit">질문 등록</Button>
        </div>
      </form>
    </div>
  )
}
