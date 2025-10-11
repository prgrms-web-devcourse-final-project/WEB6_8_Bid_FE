'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ErrorAlert } from '@/components/ui/error-alert'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { authApi } from '@/lib/api'
import { Camera, Edit, Trophy } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface MyInfoEditClientProps {
  initialProfile?: {
    name?: string
    phone?: string
    address?: string
  }
}

export function MyInfoEditClient({ initialProfile }: MyInfoEditClientProps) {
  const router = useRouter()
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [formData, setFormData] = useState({
    nickname: user?.nickname || initialProfile?.name || '',
    phoneNumber: user?.phone || initialProfile?.phone || '',
    address: (user as any)?.address || initialProfile?.address || '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // API 에러 초기화
    if (apiError) {
      setApiError('')
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData((prev) => ({
          ...prev,
          profileImage: e.target?.result as string,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    setApiError('')

    // 유효성 검사
    const newErrors: Record<string, string> = {}

    if (!formData.nickname.trim()) {
      newErrors.nickname = '닉네임을 입력해주세요'
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = '전화번호를 입력해주세요'
    } else if (!/^010\d{8}$/.test(formData.phoneNumber.replace(/-/g, ''))) {
      newErrors.phoneNumber =
        '올바른 전화번호 형식을 입력해주세요 (010-1234-5678)'
    }

    if (!formData.address.trim()) {
      newErrors.address = '주소를 입력해주세요'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      try {
        // API 호출
        const response = await authApi.updateProfile({
          nickname: formData.nickname,
          phoneNumber: formData.phoneNumber.replace(/-/g, ''), // 하이푼 제거
          address: formData.address,
        })

        console.log('🔍 프로필 수정 API 응답:', response)

        if (response.success || response.resultCode === '200') {
          // 성공 시 AuthContext 업데이트
          const updatedUser = {
            ...user,
            nickname: formData.nickname,
            phone: formData.phoneNumber,
            address: formData.address,
          } as any
          updateUser(updatedUser)

          alert('프로필이 성공적으로 수정되었습니다.')
          setIsEditing(false)
        } else {
          setApiError(response.msg || '프로필 수정에 실패했습니다.')
        }
      } catch (error: any) {
        console.error('프로필 수정 에러:', error)
        setApiError(
          error.response?.data?.msg || '프로필 수정 중 오류가 발생했습니다.',
        )
      }
    }

    setIsLoading(false)
  }

  const handleCancel = () => {
    setFormData({
      nickname: user?.nickname || initialProfile?.name || '',
      phoneNumber: user?.phone || initialProfile?.phone || '',
      address: (user as any)?.address || initialProfile?.address || '',
    })
    setErrors({})
    setApiError('')
    setIsEditing(false)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* 기본 정보 */}
        <Card variant="outlined">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">
                기본 정보
              </h2>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  수정
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  취소
                </Button>
              )}
            </div>

            {/* API 에러 메시지 */}
            {apiError && (
              <ErrorAlert
                title="수정 실패"
                message={apiError}
                onClose={() => setApiError('')}
              />
            )}

            <div className="flex flex-col items-center space-y-6">
              {/* 프로필 사진 */}
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-neutral-200">
                  <span className="text-2xl font-bold text-neutral-500">
                    {formData.nickname.charAt(0)}
                  </span>
                </div>
                {isEditing && (
                  <label className="bg-primary-500 hover:bg-primary-600 absolute -right-1 -bottom-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-white">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* 사용자 정보 */}
              <div className="w-full space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    닉네임
                  </label>
                  <Input
                    name="nickname"
                    value={formData.nickname}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    error={errors.nickname}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    이메일
                  </label>
                  <Input
                    name="email"
                    type="email"
                    value={user?.email || ''}
                    disabled={true}
                    className="bg-neutral-100"
                  />
                  <p className="mt-1 text-xs text-neutral-500">
                    이메일은 변경할 수 없습니다
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    전화번호
                  </label>
                  <Input
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="010-1234-5678"
                    error={errors.phoneNumber}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    주소
                  </label>
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="주소를 입력하세요"
                    error={errors.address}
                  />
                </div>
              </div>

              {isEditing && (
                <Button
                  onClick={handleSave}
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      저장 중...
                    </div>
                  ) : (
                    '저장'
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 신뢰도 점수 */}
        <Card variant="outlined">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center space-x-2">
              <Trophy className="text-warning-500 h-5 w-5" />
              <h2 className="text-lg font-semibold text-neutral-900">
                신뢰도 점수
              </h2>
            </div>
            <div className="text-center">
              <div className="text-primary-500 mb-2 text-4xl font-bold">
                94점
              </div>
              <p className="text-neutral-600">상위 15% 신뢰도</p>
            </div>
          </CardContent>
        </Card>

        {/* 활동 통계 */}
        <Card variant="outlined">
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-neutral-900">
                활동 통계
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="bg-primary-100 mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg">
                  <span className="text-primary-600 text-xl">📦</span>
                </div>
                <div className="text-2xl font-bold text-neutral-900">47</div>
                <div className="text-sm text-neutral-600">판매 완료</div>
              </div>

              <div className="text-center">
                <div className="bg-success-100 mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg">
                  <Trophy className="text-success-600 h-6 w-6" />
                </div>
                <div className="text-2xl font-bold text-neutral-900">15</div>
                <div className="text-sm text-neutral-600">낙찰 성공</div>
              </div>

              <div className="text-center">
                <div className="bg-warning-100 mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg">
                  <span className="text-warning-600 text-xl">⏰</span>
                </div>
                <div className="text-2xl font-bold text-neutral-900">8</div>
                <div className="text-sm text-neutral-600">진행 중</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
