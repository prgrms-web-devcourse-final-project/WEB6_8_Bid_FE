'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export function LoginClient() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    confirmPassword: '',
    rememberMe: false,
    agreeToTerms: false,
    agreeToPrivacy: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // 간단한 유효성 검사
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다'
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요'
    }

    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = '이름을 입력해주세요'
      }

      if (!formData.phone) {
        newErrors.phone = '전화번호를 입력해주세요'
      } else if (!/^010-\d{4}-\d{4}$/.test(formData.phone)) {
        newErrors.phone = '올바른 전화번호 형식이 아닙니다 (010-0000-0000)'
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = '비밀번호 확인을 입력해주세요'
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = '비밀번호가 일치하지 않습니다'
      }

      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = '서비스 이용약관에 동의해주세요'
      }

      if (!formData.agreeToPrivacy) {
        newErrors.agreeToPrivacy = '개인정보 처리방침에 동의해주세요'
      }
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      // TODO: API 호출
      console.log('Form submitted:', formData)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* 앱 로고 및 제목 */}
        <div className="text-center">
          <div className="bg-primary-500 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
            <span className="text-xl font-bold text-white">경</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">경매마켓</h1>
          <p className="mt-2 text-sm text-neutral-600">
            실시간 경매 플랫폼에 오신 것을 환영합니다
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex rounded-lg bg-neutral-100 p-1">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              isLogin
                ? 'text-primary-600 bg-white shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            로그인
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              !isLogin
                ? 'text-primary-600 bg-white shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            회원가입
          </button>
        </div>

        {/* 폼 */}
        <Card variant="outlined">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <Input
                  label="이름"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="이름을 입력하세요"
                  error={errors.name}
                />
              )}

              <Input
                label="이메일"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="이메일을 입력하세요"
                leftIcon={<Mail className="h-5 w-5" />}
                error={errors.email}
              />

              {!isLogin && (
                <Input
                  label="전화번호"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="010-0000-0000"
                  error={errors.phone}
                />
              )}

              <Input
                label="비밀번호"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                placeholder="비밀번호를 입력하세요"
                leftIcon={<Lock className="h-5 w-5" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                }
                error={errors.password}
              />

              {!isLogin && (
                <Input
                  label="비밀번호 확인"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="비밀번호를 다시 입력하세요"
                  leftIcon={<Lock className="h-5 w-5" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-neutral-400 hover:text-neutral-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  }
                  error={errors.confirmPassword}
                />
              )}

              {isLogin && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      className="text-primary-600 focus:ring-primary-500 rounded border-neutral-300"
                    />
                    <span className="ml-2 text-sm text-neutral-600">
                      로그인 상태 유지
                    </span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-primary-600 hover:text-primary-500 text-sm"
                  >
                    비밀번호 찾기
                  </Link>
                </div>
              )}

              {!isLogin && (
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      className="text-primary-600 focus:ring-primary-500 rounded border-neutral-300"
                    />
                    <span className="ml-2 text-sm text-neutral-600">
                      * 서비스 이용약관에 동의합니다
                    </span>
                  </label>
                  {errors.agreeToTerms && (
                    <p className="text-error-500 text-sm">
                      {errors.agreeToTerms}
                    </p>
                  )}

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="agreeToPrivacy"
                      checked={formData.agreeToPrivacy}
                      onChange={handleInputChange}
                      className="text-primary-600 focus:ring-primary-500 rounded border-neutral-300"
                    />
                    <span className="ml-2 text-sm text-neutral-600">
                      * 개인정보 처리방침에 동의합니다
                    </span>
                  </label>
                  {errors.agreeToPrivacy && (
                    <p className="text-error-500 text-sm">
                      {errors.agreeToPrivacy}
                    </p>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full" size="lg">
                {isLogin ? '로그인' : '회원가입'}
              </Button>
            </form>

            {/* 소셜 로그인 */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-neutral-500">또는</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button type="button" variant="outline" className="w-full">
                  구글로 로그인
                </Button>
                <Button type="button" variant="outline" className="w-full">
                  카카오로 로그인
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 데모 계정 정보 */}
        <Card variant="outlined" className="bg-neutral-50">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center space-x-2">
              <span className="text-lg">🚀</span>
              <span className="text-sm font-medium text-neutral-900">
                데모 계정으로 빠른 체험
              </span>
            </div>
            <div className="space-y-1 text-sm text-neutral-600">
              <div>이메일: demo@example.com</div>
              <div>비밀번호: demo123</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
