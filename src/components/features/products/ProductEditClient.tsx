'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ErrorAlert } from '@/components/ui/error-alert'
import { Input } from '@/components/ui/input'
import { productApi } from '@/lib/api'
import { Product } from '@/types'
import { Camera, MapPin, Package, Save, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface ProductEditClientProps {
  product: Product
}

export function ProductEditClient({ product }: ProductEditClientProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: product.title,
    description: product.description,
    category: product.category,
    startingPrice: product.startingPrice,
    location: product.location,
    deliveryMethod: (product as any).deliveryMethod || 'TRADE',
  })
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<string[]>(
    product.images || [],
  )
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])
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
      [name]: name === 'startingPrice' ? parseInt(value) || 0 : value,
    }))
    // 에러 메시지 제거
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setImages(files)

    // 새 이미지 미리보기 생성
    const previews = files.map((file) => URL.createObjectURL(file))
    setImagePreviews(previews)

    console.log('📸 새 이미지 선택:', {
      fileCount: files.length,
      fileNames: files.map((f) => f.name),
      fileSizes: files.map((f) => f.size),
      previews: previews.length,
    })
  }

  const handleDeleteExistingImage = (imageUrl: string) => {
    console.log('🗑️ 기존 이미지 삭제 시도:', {
      imageUrl,
      currentExistingImages: existingImages,
      currentImagesToDelete: imagesToDelete,
    })

    setExistingImages((prev) => prev.filter((img) => img !== imageUrl))
    setImagesToDelete((prev) => [...prev, imageUrl])

    console.log('🗑️ 기존 이미지 삭제 완료:', {
      removedImage: imageUrl,
      remainingImages: existingImages.filter((img) => img !== imageUrl),
      deletedImages: [...imagesToDelete, imageUrl],
    })
  }

  const handleDeleteNewImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)

    setImages(newImages)
    setImagePreviews(newPreviews)

    // URL 해제
    URL.revokeObjectURL(imagePreviews[index])
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = '상품명을 입력해주세요'
    }

    if (!formData.description.trim()) {
      newErrors.description = '상품 설명을 입력해주세요'
    }

    if (formData.startingPrice <= 0) {
      newErrors.startingPrice = '시작가를 입력해주세요'
    }

    if (!formData.location.trim()) {
      newErrors.location = '위치를 입력해주세요'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setApiError('')

    try {
      // 상품 수정 API 호출 (api-test와 동일한 방식)
      const requestData = {
        name: formData.title,
        description: formData.description,
        initialPrice: formData.startingPrice,
        location: formData.location,
        deliveryMethod: formData.deliveryMethod as
          | 'DELIVERY'
          | 'BOTH'
          | 'TRADE',
      }

      console.log('🔧 상품 수정 요청 데이터:', {
        productId: product.id,
        requestData,
        imagesCount: images.length,
        imagesToDeleteCount: imagesToDelete.length,
        existingImagesCount: existingImages.length,
        imageDetails: images.map((img) => ({
          name: img.name,
          size: img.size,
          type: img.type,
        })),
      })

      // 삭제할 이미지 인덱스 계산 (원본 이미지 배열에서의 인덱스)
      const deleteImageIds = imagesToDelete
        .map((deletedUrl) => {
          const originalIndex = (product.images || []).indexOf(deletedUrl)
          return originalIndex >= 0 ? originalIndex : -1
        })
        .filter((id) => id >= 0)

      console.log('🗑️ 삭제할 이미지 정보:', {
        imagesToDelete,
        deleteImageIds,
        originalImages: product.images,
      })

      const response = await productApi.updateProduct(
        product.id,
        requestData,
        images,
        deleteImageIds, // 삭제할 이미지 인덱스
      )

      console.log('🔧 상품 수정 응답:', {
        success: response.success,
        data: response.data,
        resultCode: response.resultCode,
        msg: response.msg,
        fullResponse: response,
      })

      if (response.success) {
        console.log('✅ 상품 수정 성공:', response.data)
        alert('상품이 성공적으로 수정되었습니다.')
        router.push(`/products/${product.id}`)
      } else {
        console.log('❌ 상품 수정 실패:', response.msg)
        setApiError(response.msg || '상품 수정에 실패했습니다.')
      }
    } catch (error: any) {
      console.error('상품 수정 실패:', error)

      // 401 에러는 로그인 관련 메시지 표시하지 않음
      if (error.message?.includes('401') || error.response?.status === 401) {
        setApiError('상품 수정에 실패했습니다. 잠시 후 다시 시도해주세요.')
      } else {
        setApiError(
          error.response?.data?.msg || '상품 수정 중 오류가 발생했습니다.',
        )
      }
    }

    setIsLoading(false)
  }

  const handleCancel = () => {
    router.push(`/products/${product.id}`)
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
              상품 사진
            </h2>

            {/* 기존 이미지들 */}
            {existingImages.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-medium text-neutral-700">
                  기존 이미지 ({existingImages.length}장)
                </h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {existingImages.map((imageUrl, index) => (
                    <div key={index} className="group relative">
                      <img
                        src={imageUrl}
                        alt={`기존 이미지 ${index + 1}`}
                        className="h-24 w-full rounded-lg border border-neutral-200 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteExistingImage(imageUrl)}
                        className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                {imagesToDelete.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-red-600">
                      {imagesToDelete.length}장의 이미지가 삭제 예정입니다
                    </p>
                    <button
                      type="button"
                      onClick={async () => {
                        console.log('🧪 이미지 삭제만 테스트:', {
                          imagesToDelete,
                          deleteImageIds: imagesToDelete
                            .map((deletedUrl) => {
                              const originalIndex = (
                                product.images || []
                              ).indexOf(deletedUrl)
                              return originalIndex >= 0 ? originalIndex : -1
                            })
                            .filter((id) => id >= 0),
                        })

                        try {
                          const response = await productApi.updateProduct(
                            product.id,
                            {
                              name: product.title,
                              description: product.description || '',
                              initialPrice: product.startingPrice,
                              location: product.location,
                              deliveryMethod:
                                (product as any).deliveryMethod || 'TRADE',
                            },
                            [], // 새 이미지 없음
                            imagesToDelete
                              .map((deletedUrl) => {
                                const originalIndex = (
                                  product.images || []
                                ).indexOf(deletedUrl)
                                return originalIndex >= 0 ? originalIndex : -1
                              })
                              .filter((id) => id >= 0), // 삭제할 이미지 인덱스 배열
                          )

                          if (response.success) {
                            alert('이미지가 삭제되었습니다!')
                            window.location.reload()
                          } else {
                            alert('이미지 삭제 실패: ' + response.msg)
                          }
                        } catch (error) {
                          console.error('이미지 삭제 오류:', error)
                          alert('이미지 삭제 중 오류가 발생했습니다.')
                        }
                      }}
                      className="mt-2 rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
                    >
                      이미지 삭제만 테스트
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 새로 선택한 이미지들 */}
            {imagePreviews.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-medium text-neutral-700">
                  새로 추가할 이미지 ({imagePreviews.length}장)
                </h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="group relative">
                      <img
                        src={preview}
                        alt={`새 이미지 ${index + 1}`}
                        className="h-24 w-full rounded-lg border border-neutral-200 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteNewImage(index)}
                        className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 새 이미지 추가 */}
            <div className="rounded-lg border-2 border-dashed border-neutral-300 p-8 text-center">
              <Camera className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
              <p className="mb-2 text-neutral-600">
                새로운 사진을 선택해주세요
              </p>
              <p className="mb-4 text-sm text-neutral-500">
                새로 선택한 이미지가 추가됩니다 (최대 10장)
              </p>

              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="bg-primary-600 hover:bg-primary-700 inline-flex cursor-pointer items-center rounded-md px-4 py-2 text-sm font-medium text-white"
              >
                이미지 추가
              </label>
              {images.length > 0 && (
                <p className="mt-2 text-sm text-neutral-600">
                  {images.length}개의 새 이미지가 선택되었습니다
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 상품 정보 */}
        <Card variant="outlined">
          <CardContent className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900">
              상품 정보
            </h2>

            <div className="space-y-4">
              {/* 상품명 */}
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  상품명 *
                </label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="상품명을 입력하세요"
                  error={errors.title}
                />
              </div>

              {/* 상품 설명 */}
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  상품 설명 *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="상품에 대한 자세한 설명을 입력하세요"
                  className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-md border border-neutral-300 p-3 focus:ring-1 focus:outline-none"
                  rows={4}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* 카테고리 */}
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  카테고리 *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-md border border-neutral-300 p-2 focus:ring-1 focus:outline-none"
                >
                  <option value="디지털/가전">디지털/가전</option>
                  <option value="패션/의류">패션/의류</option>
                  <option value="뷰티/미용">뷰티/미용</option>
                  <option value="홈/리빙">홈/리빙</option>
                  <option value="스포츠/레저">스포츠/레저</option>
                  <option value="도서/음반/DVD">도서/음반/DVD</option>
                  <option value="반려동물용품">반려동물용품</option>
                  <option value="유아동/출산용품">유아동/출산용품</option>
                  <option value="식품/건강식품">식품/건강식품</option>
                  <option value="자동차/오토바이">자동차/오토바이</option>
                  <option value="취미/수집품">취미/수집품</option>
                  <option value="기타">기타</option>
                </select>
              </div>

              {/* 시작가 */}
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  시작가 *
                </label>
                <Input
                  name="startingPrice"
                  type="number"
                  value={formData.startingPrice}
                  onChange={handleInputChange}
                  placeholder="시작가를 입력하세요"
                  error={errors.startingPrice}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 거래 정보 */}
        <Card variant="outlined">
          <CardContent className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900">
              거래 정보
            </h2>

            <div className="space-y-4">
              {/* 위치 */}
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  거래 위치 *
                </label>
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="거래 위치를 입력하세요"
                  error={errors.location}
                />
              </div>

              {/* 배송 방법 */}
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  배송 방법 *
                </label>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="flex cursor-pointer items-center rounded-lg border border-neutral-300 p-4 hover:bg-neutral-50">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="TRADE"
                      checked={formData.deliveryMethod === 'TRADE'}
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

                  <label className="flex cursor-pointer items-center rounded-lg border border-neutral-300 p-4 hover:bg-neutral-50">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="DELIVERY"
                      checked={formData.deliveryMethod === 'DELIVERY'}
                      onChange={handleInputChange}
                      className="text-primary-600 focus:ring-primary-500 rounded border-neutral-300"
                    />
                    <div className="ml-3">
                      <div className="flex items-center space-x-2">
                        <Package className="h-5 w-5 text-neutral-600" />
                        <span className="font-medium">택배</span>
                      </div>
                      <p className="text-sm text-neutral-500">택배, 우편 등</p>
                    </div>
                  </label>

                  <label className="flex cursor-pointer items-center rounded-lg border border-neutral-300 p-4 hover:bg-neutral-50">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="BOTH"
                      checked={formData.deliveryMethod === 'BOTH'}
                      onChange={handleInputChange}
                      className="text-primary-600 focus:ring-primary-500 rounded border-neutral-300"
                    />
                    <div className="ml-3">
                      <div className="flex items-center space-x-2">
                        <Package className="h-5 w-5 text-neutral-600" />
                        <MapPin className="h-5 w-5 text-neutral-600" />
                        <span className="font-medium">둘 다</span>
                      </div>
                      <p className="text-sm text-neutral-500">
                        택배와 직접거래 모두 가능
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 버튼 */}
        <div className="flex space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
          >
            <X className="mr-2 h-4 w-4" />
            취소
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-primary-600 hover:bg-primary-700 flex-1"
          >
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? '수정 중...' : '수정하기'}
          </Button>
        </div>
      </form>
    </div>
  )
}
