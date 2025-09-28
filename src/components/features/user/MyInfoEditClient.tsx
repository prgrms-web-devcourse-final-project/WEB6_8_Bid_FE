'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { User } from '@/types'
import { Camera, Edit, Trophy } from 'lucide-react'
import { useState } from 'react'

interface MyInfoEditClientProps {
  initialProfile: User
}

export function MyInfoEditClient({ initialProfile }: MyInfoEditClientProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: initialProfile.name,
    email: initialProfile.email,
    phone: initialProfile.phone || '',
    profileImage: initialProfile.profileImage || '',
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

  const handleSave = () => {
    // 유효성 검사
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요'
    }

    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '전화번호를 입력해주세요'
    } else if (!/^010-\d{4}-\d{4}$/.test(formData.phone)) {
      newErrors.phone = '올바른 전화번호 형식을 입력해주세요 (010-1234-5678)'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      // TODO: API 호출
      console.log('프로필 수정:', formData)
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: initialProfile.name,
      email: initialProfile.email,
      phone: initialProfile.phone || '',
      profileImage: initialProfile.profileImage || '',
    })
    setErrors({})
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

            <div className="flex flex-col items-center space-y-6">
              {/* 프로필 사진 */}
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-neutral-200">
                  {formData.profileImage ? (
                    <img
                      src={formData.profileImage}
                      alt="프로필"
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-neutral-500">
                      {formData.name.charAt(0)}
                    </span>
                  )}
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
                    이름
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    error={errors.name}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    이메일
                  </label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    error={errors.email}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    전화번호
                  </label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="010-1234-5678"
                    error={errors.phone}
                  />
                </div>
              </div>

              {isEditing && (
                <Button onClick={handleSave} className="w-full">
                  저장
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
