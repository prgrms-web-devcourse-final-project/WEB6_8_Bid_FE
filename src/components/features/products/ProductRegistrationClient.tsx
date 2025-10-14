'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ErrorAlert } from '@/components/ui/error-alert'
import { Input } from '@/components/ui/input'
import { productApi } from '@/lib/api'
import { ProductForm } from '@/types'
import { Camera, MapPin, Package } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const categories = [
  { id: 1, label: '디지털/가전' },
  { id: 2, label: '패션/의류' },
  { id: 3, label: '뷰티/미용' },
  { id: 4, label: '홈/리빙' },
  { id: 5, label: '스포츠/레저' },
  { id: 6, label: '도서/음반/DVD' },
  { id: 7, label: '반려동물용품' },
  { id: 8, label: '유아동/출산용품' },
  { id: 9, label: '식품/건강식품' },
  { id: 10, label: '자동차/오토바이' },
  { id: 11, label: '취미/수집품' },
  { id: 12, label: '기타' },
]

export function ProductRegistrationClient() {
  const router = useRouter()
  const [formData, setFormData] = useState<ProductForm>({
    name: '',
    description: '',
    categoryId: 1,
    images: [],
    initialPrice: 0,
    auctionDuration: '24시간',
    auctionStartTime: '',
    deliveryMethod: [],
    location: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      const method = name as 'TRADE' | 'DELIVERY'

      // 개별 옵션 선택 시 해당 옵션 추가/제거 (중복 방지)
      setFormData((prev) => ({
        ...prev,
        deliveryMethod: checked
          ? prev.deliveryMethod.includes(method)
            ? prev.deliveryMethod // 이미 포함되어 있으면 그대로 유지
            : [...prev.deliveryMethod, method] // 없으면 추가
          : prev.deliveryMethod.filter((m) => m !== method), // 체크 해제 시 제거
      }))
    } else {
      setFormData((prev) => {
        if (name === 'initialPrice') {
          // 숫자만 추출하고 안전하게 변환
          const cleanValue = value.replace(/[^0-9]/g, '') // 숫자가 아닌 문자 제거
          const numericValue = cleanValue ? Number(cleanValue) : 0

          // 디버깅용 로그
          console.log('💰 시작가 입력:', {
            originalValue: value,
            cleanValue,
            finalValue: numericValue,
          })

          return {
            ...prev,
            [name]: numericValue,
          }
        }

        return {
          ...prev,
          [name]: value,
        }
      })
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

  // 이미지 삭제 함수
  const handleImageDelete = (indexToDelete: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToDelete),
    }))
  }

  // 이미지 미리보기 URL 생성 함수
  const getImagePreviewUrl = (file: File): string => {
    return URL.createObjectURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setApiError('')

    // 유효성 검사
    const newErrors: Record<string, string> = {}

    if (!formData.name) {
      newErrors.title = '제목을 입력해주세요'
    } else if (formData.name.length < 1 || formData.name.length > 100) {
      newErrors.title = '제목은 1~100자 사이로 입력해주세요'
    }

    if (
      formData.description &&
      (formData.description.length < 1 || formData.description.length > 1000)
    ) {
      newErrors.description = '상품 설명은 1~1000자 사이로 입력해주세요'
    }

    if (!formData.initialPrice || formData.initialPrice < 1000) {
      newErrors.initialPrice = '시작가는 1,000원 이상이어야 합니다'
    }

    if (
      !formData.auctionDuration ||
      (formData.auctionDuration !== '24시간' &&
        formData.auctionDuration !== '48시간')
    ) {
      newErrors.auctionDuration =
        '경매 기간을 선택해주세요 (24시간 또는 48시간)'
    }

    if (
      formData.auctionStartTime === 'scheduled' &&
      formData.auctionStartTime
    ) {
      const scheduledDate = new Date(formData.auctionStartTime)
      const now = new Date()
      if (scheduledDate <= now) {
        newErrors.auctionStartTime =
          '예약 시작 시간은 현재 시간 이후여야 합니다'
      }
    }

    if (formData.deliveryMethod.length === 0) {
      newErrors.deliveryMethod = '거래 방법을 선택해주세요'
    }

    if (formData.deliveryMethod.includes('TRADE') && !formData.location) {
      newErrors.location = '직거래 선택 시 위치를 입력해주세요'
    }

    if (formData.images.length === 0) {
      newErrors.images = '상품 이미지를 1개 이상 업로드해주세요'
    } else if (formData.images.length > 5) {
      newErrors.images = '이미지는 최대 5개까지 업로드 가능합니다'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      // 배송 방법 매핑
      let deliveryMethod: 'DELIVERY' | 'BOTH' | 'TRADE' = 'DELIVERY'
      if (
        formData.deliveryMethod.includes('TRADE') &&
        formData.deliveryMethod.includes('DELIVERY')
      ) {
        deliveryMethod = 'BOTH'
      } else if (formData.deliveryMethod.includes('TRADE')) {
        deliveryMethod = 'TRADE'
      } else if (formData.deliveryMethod.includes('DELIVERY')) {
        deliveryMethod = 'DELIVERY'
      }

      try {
        console.log('🚀 API 전송 데이터:', {
          name: formData.name,
          description: formData.description,
          categoryId: formData.categoryId,
          initialPrice: formData.initialPrice,
        })

        const response = await productApi.createProduct(
          {
            name: formData.name,
            description: formData.description,
            categoryId: formData.categoryId,
            initialPrice: formData.initialPrice,
            auctionStartTime:
              formData.auctionStartTime === 'immediate'
                ? new Date(Date.now() + 5 * 60 * 1000)
                    .toISOString()
                    .slice(0, 19) // 5분 후 시작 (YYYY-MM-DDTHH:mm:ss 형식)
                : formData.auctionStartTime
                  ? new Date(formData.auctionStartTime)
                      .toISOString()
                      .slice(0, 19)
                  : new Date().toISOString().slice(0, 19), // datetime-local 값을 YYYY-MM-DDTHH:mm:ss 형식으로 변환
            auctionDuration: formData.auctionDuration, // 문자열로 전송
            deliveryMethod: deliveryMethod,
            location: formData.location,
          },
          formData.images, // 사용자가 업로드한 실제 이미지 사용
          'AUCTION', // 상품 타입: 경매 상품
        )

        if (response.success) {
          alert('상품이 성공적으로 등록되었습니다.')
          router.push('/my-products')
        } else {
          setApiError(
            response.msg || '상품 등록에 실패했습니다. 다시 시도해주세요.',
          )
        }
      } catch (error: any) {
        console.error('API 에러:', error)

        // 에러 처리 (401 에러는 로그인 관련 메시지 표시하지 않음)
        if (error.message?.includes('401')) {
          console.log('🔐 401 에러 - 토큰 만료 또는 인증 실패')
          setApiError('상품 등록에 실패했습니다. 잠시 후 다시 시도해주세요.')
        } else if (error.message?.includes('400')) {
          setApiError('입력 정보를 확인해주세요.')
        } else if (error.message?.includes('403')) {
          setApiError('권한이 없습니다. 잠시 후 다시 시도해주세요.')
        } else if (error.message?.includes('500')) {
          setApiError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
        } else {
          setApiError(`상품 등록 실패: ${error.message || '알 수 없는 오류'}`)
        }
      }
    }

    setIsLoading(false)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* API 에러 메시지 */}
        {apiError && (
          <ErrorAlert
            title="요청 실패"
            message={apiError}
            onClose={() => setApiError('')}
          />
        )}

        {/* 상품 사진 */}
        <Card variant="outlined">
          <CardContent className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900">
              상품 사진 *
            </h2>

            <div className="rounded-lg border-2 border-dashed border-neutral-300 p-8 text-center">
              <Camera className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
              <p className="mb-2 text-neutral-600">사진을 선택해주세요</p>
              <p className="mb-4 text-sm text-neutral-500">
                1장 이상 필수 (JPG, PNG)
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
                      className="relative h-20 w-20 overflow-hidden rounded-lg border border-neutral-200"
                    >
                      <img
                        src={getImagePreviewUrl(image)}
                        alt={`상품 이미지 ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleImageDelete(index)}
                        className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-sm hover:bg-red-600"
                        title="이미지 삭제"
                      >
                        <span className="text-xs">×</span>
                      </button>
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
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="상품명을 입력하세요"
                error={errors.title}
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  카테고리 *
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
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

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  시작가 *
                </label>
                <Input
                  type="number"
                  name="initialPrice"
                  value={formData.initialPrice}
                  onChange={handleInputChange}
                  placeholder="시작가를 입력하세요"
                  min="1000"
                  step="100"
                  autoComplete="off"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  error={errors.initialPrice}
                />
                <div className="mt-2 text-sm text-neutral-500">
                  경매 시작가를 설정해주세요
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  경매 기간 *
                </label>
                <div className="space-y-3">
                  <label className="flex cursor-pointer items-center">
                    <input
                      type="radio"
                      name="auctionDuration"
                      value="24시간"
                      checked={formData.auctionDuration === '24시간'}
                      onChange={handleInputChange}
                      className="text-primary-600 focus:ring-primary-500 mr-3"
                    />
                    <span>24시간</span>
                  </label>
                  <label className="flex cursor-pointer items-center">
                    <input
                      type="radio"
                      name="auctionDuration"
                      value="48시간"
                      checked={formData.auctionDuration === '48시간'}
                      onChange={handleInputChange}
                      className="text-primary-600 focus:ring-primary-500 mr-3"
                    />
                    <span>48시간</span>
                  </label>
                </div>
                <div className="mt-2 text-sm text-neutral-500">
                  경매 진행 기간을 선택해주세요
                </div>
                {errors.auctionDuration && (
                  <p className="text-error-500 mt-1 text-sm">
                    {errors.auctionDuration}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  시작 시간 *
                </label>
                <div className="space-y-3">
                  <label className="flex cursor-pointer items-center">
                    <input
                      type="radio"
                      name="auctionStartTime"
                      value="immediate"
                      checked={formData.auctionStartTime === 'immediate'}
                      onChange={handleInputChange}
                      className="text-primary-600 focus:ring-primary-500 mr-3"
                    />
                    <span>즉시 시작</span>
                  </label>
                  <label className="flex cursor-pointer items-center">
                    <input
                      type="radio"
                      name="auctionStartTime"
                      value="scheduled"
                      checked={formData.auctionStartTime === 'scheduled'}
                      onChange={handleInputChange}
                      className="text-primary-600 focus:ring-primary-500 mr-3"
                    />
                    <span>예약 시작</span>
                  </label>
                </div>

                {formData.auctionStartTime === 'scheduled' && (
                  <div className="mt-3">
                    <Input
                      type="datetime-local"
                      name="auctionStartTime"
                      value={formData.auctionStartTime}
                      onChange={handleInputChange}
                      placeholder="경매 시작 시간을 선택하세요"
                      error={errors.auctionStartTime}
                    />
                    <div className="mt-2 text-sm text-neutral-500">
                      경매 시작 시간을 선택해주세요 (현재 시간 이후)
                    </div>
                  </div>
                )}

                <div className="mt-2 text-sm text-neutral-500">
                  경매 시작 시점을 선택해주세요
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  거래 지역
                </label>
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="예: 서울 강남구, 경기도 고양시"
                  error={errors.location}
                />
                <div className="mt-2 text-sm text-neutral-500">
                  직거래 선택 시 필수입니다.
                </div>
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
                      name="DELIVERY"
                      checked={formData.deliveryMethod.includes('DELIVERY')}
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
                      name="TRADE"
                      checked={formData.deliveryMethod.includes('TRADE')}
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
              '상품 등록'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
