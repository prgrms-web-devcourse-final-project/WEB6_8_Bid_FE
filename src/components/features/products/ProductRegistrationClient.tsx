'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ProductForm } from '@/types'
import { Camera, MapPin, Package } from 'lucide-react'
import { useState } from 'react'

const categories = [
  { id: 'digital', label: '디지털·가전' },
  { id: 'fashion', label: '패션·의류' },
  { id: 'beauty', label: '뷰티·미용' },
  { id: 'home', label: '홈·리빙' },
  { id: 'sports', label: '스포츠·레저' },
  { id: 'books', label: '도서·음반' },
  { id: 'other', label: '기타' },
]

export function ProductRegistrationClient() {
  const [formData, setFormData] = useState<ProductForm>({
    title: '',
    description: '',
    category: 'digital',
    images: [],
    startingPrice: 0,
    duration: 24,
    startTime: 'immediate',
    deliveryMethod: ['shipping'],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      const method = name as 'shipping' | 'pickup'

      setFormData((prev) => ({
        ...prev,
        deliveryMethod: checked
          ? [...prev.deliveryMethod, method]
          : prev.deliveryMethod.filter((m) => m !== method),
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }

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

    if (!formData.description) {
      newErrors.description = '상품 설명을 입력해주세요'
    }

    if (!formData.startingPrice || formData.startingPrice <= 0) {
      newErrors.startingPrice = '시작가를 입력해주세요'
    }

    if (formData.deliveryMethod.length === 0) {
      newErrors.deliveryMethod = '거래 방법을 선택해주세요'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      // TODO: API 호출
      console.log('Product form submitted:', formData)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 상품 사진 */}
        <Card variant="outlined">
          <CardContent className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900">
              상품 사진
            </h2>

            <div className="rounded-lg border-2 border-dashed border-neutral-300 p-8 text-center">
              <Camera className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
              <p className="mb-2 text-neutral-600">사진을 선택해주세요</p>
              <p className="mb-4 text-sm text-neutral-500">
                최대 10장까지 업로드 가능 (JPG, PNG)
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
                사진 선택
              </label>
            </div>

            {formData.images.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-sm text-neutral-600">
                  선택된 사진 ({formData.images.length}장)
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

        {/* 상품 정보 */}
        <Card variant="outlined">
          <CardContent className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900">
              상품 정보
            </h2>

            <div className="space-y-4">
              <Input
                label="제목 *"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="상품명을 입력하세요"
                error={errors.title}
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  카테고리 *
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
                  상품 설명 *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="상품에 대해 자세히 설명해주세요"
                  rows={6}
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full rounded-lg border border-neutral-300 px-3 py-2 focus:ring-2 focus:outline-none"
                />
                <div className="mt-2 text-sm text-neutral-500">
                  <ul className="list-inside list-disc space-y-1">
                    <li>구매 시기, 사용 기간</li>
                    <li>상품 상태</li>
                    <li>하자나 수리 이력 등</li>
                  </ul>
                </div>
                {errors.description && (
                  <p className="text-error-500 mt-1 text-sm">
                    {errors.description}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 거래 방식 */}
        <Card variant="outlined">
          <CardContent className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900">
              거래 방식
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  거래 방법 * (중복 선택 가능)
                </label>
                {errors.deliveryMethod && (
                  <p className="text-error-500 mb-2 text-sm">
                    {errors.deliveryMethod}
                  </p>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="flex cursor-pointer items-center rounded-lg border border-neutral-300 p-4 hover:bg-neutral-50">
                    <input
                      type="checkbox"
                      name="shipping"
                      checked={formData.deliveryMethod.includes('shipping')}
                      onChange={handleInputChange}
                      className="text-primary-600 focus:ring-primary-500 rounded border-neutral-300"
                    />
                    <div className="ml-3">
                      <div className="flex items-center space-x-2">
                        <Package className="h-5 w-5 text-neutral-600" />
                        <span className="font-medium">배송</span>
                      </div>
                      <p className="text-sm text-neutral-500">택배, 우편 등</p>
                    </div>
                  </label>

                  <label className="flex cursor-pointer items-center rounded-lg border border-neutral-300 p-4 hover:bg-neutral-50">
                    <input
                      type="checkbox"
                      name="pickup"
                      checked={formData.deliveryMethod.includes('pickup')}
                      onChange={handleInputChange}
                      className="text-primary-600 focus:ring-primary-500 rounded border-neutral-300"
                    />
                    <div className="ml-3">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-5 w-5 text-neutral-600" />
                        <span className="font-medium">직거래</span>
                      </div>
                      <p className="text-sm text-neutral-500">
                        직접 만나서 거래
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 제출 버튼 */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline">
            취소
          </Button>
          <Button type="submit">다음 단계</Button>
        </div>
      </form>
    </div>
  )
}
