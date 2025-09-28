'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

const categories = [
  { id: 'notice', label: '공지사항' },
  { id: 'update', label: '업데이트' },
  { id: 'event', label: '이벤트' },
  { id: 'maintenance', label: '점검' },
]

const importanceLevels = [
  { id: 'normal', label: '일반', color: 'neutral' },
  { id: 'important', label: '중요', color: 'warning' },
  { id: 'urgent', label: '긴급', color: 'error' },
]

export function PostWriteClient() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'notice',
    importance: 'normal',
    isPinned: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    // 에러 메시지 초기화
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // 유효성 검사
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요'
    }

    if (!formData.content.trim()) {
      newErrors.content = '내용을 입력해주세요'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      // TODO: API 호출
      console.log('공지사항 작성:', formData)
    }
  }

  const getImportanceColor = (level: string) => {
    const importance = importanceLevels.find((i) => i.id === level)
    return importance?.color || 'neutral'
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <Card variant="outlined">
          <CardContent className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900">
              기본 정보
            </h2>

            <div className="space-y-4">
              <Input
                label="제목"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="공지사항 제목을 입력하세요"
                error={errors.title}
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  카테고리
                </label>
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
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  중요도
                </label>
                <div className="flex space-x-4">
                  {importanceLevels.map((level) => (
                    <label
                      key={level.id}
                      className="flex cursor-pointer items-center space-x-2"
                    >
                      <input
                        type="radio"
                        name="importance"
                        value={level.id}
                        checked={formData.importance === level.id}
                        onChange={handleInputChange}
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-neutral-700">
                        {level.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPinned"
                  name="isPinned"
                  checked={formData.isPinned}
                  onChange={handleInputChange}
                  className="text-primary-600 focus:ring-primary-500 h-4 w-4 rounded border-neutral-300"
                />
                <label htmlFor="isPinned" className="text-sm text-neutral-700">
                  상단 고정
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 내용 */}
        <Card variant="outlined">
          <CardContent className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900">
              내용
            </h2>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                공지사항 내용
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="공지사항 내용을 입력하세요"
                rows={12}
                className="focus:ring-primary-500 focus:border-primary-500 block w-full rounded-lg border border-neutral-300 px-3 py-2 focus:ring-2 focus:outline-none"
              />
              <div className="mt-2 text-sm text-neutral-500">
                <ul className="list-inside list-disc space-y-1">
                  <li>명확하고 이해하기 쉬운 내용으로 작성해주세요</li>
                  <li>중요한 정보는 강조 표시를 활용해주세요</li>
                  <li>관련 링크나 첨부파일이 있다면 포함해주세요</li>
                </ul>
              </div>
              {errors.content && (
                <p className="text-error-500 mt-1 text-sm">{errors.content}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 작성 가이드 */}
        <Card variant="outlined" className="bg-neutral-50">
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-neutral-900">
              공지사항 작성 가이드:
            </h3>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li className="flex items-start">
                <span className="text-primary-500 mr-2">•</span>
                사용자에게 중요한 정보를 우선적으로 전달하세요
              </li>
              <li className="flex items-start">
                <span className="text-primary-500 mr-2">•</span>
                제목은 간결하고 명확하게 작성하세요
              </li>
              <li className="flex items-start">
                <span className="text-primary-500 mr-2">•</span>
                내용은 단계별로 정리하여 가독성을 높이세요
              </li>
              <li className="flex items-start">
                <span className="text-primary-500 mr-2">•</span>
                긴급한 내용은 중요도를 '긴급'으로 설정하세요
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* 제출 버튼 */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline">
            취소
          </Button>
          <Button type="submit">공지사항 등록</Button>
        </div>
      </form>
    </div>
  )
}
