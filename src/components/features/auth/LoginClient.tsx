'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ErrorAlert } from '@/components/ui/error-alert'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { authApi } from '@/lib/api'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function LoginClient() {
  const router = useRouter()
  const { login } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    address: '',
    confirmPassword: '',
    rememberMe: false,
    agreeToTerms: false,
    agreeToPrivacy: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState('')

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

    // API 에러 초기화
    if (apiError) {
      setApiError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setApiError('')

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
      } else if (!/^010\d{8}$/.test(formData.phone.replace(/-/g, ''))) {
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
      try {
        if (isLogin) {
          // 로그인 API 호출
          const response = await authApi.login(
            formData.email,
            formData.password,
          )

          console.log('🔍 로그인 API 응답 전체:', response)
          console.log('🔍 response.success:', response.success)
          console.log('🔍 response.data:', response.data)
          console.log('🔍 response.resultCode:', response.resultCode)

          // 성공 조건 확인 (다양한 형식 지원)
          const isSuccess =
            response.success ||
            response.resultCode === '200' ||
            response.resultCode === 'SUCCESS' ||
            (response.data && response.data !== null)

          if (isSuccess) {
            // 로그인 성공
            console.log('✅ 로그인 성공:', response.data)

            // 서버 응답에서 실제 사용자 데이터 추출
            const responseData = response.data as any // 타입 단언으로 임시 해결
            const userData = {
              id: responseData?.id || responseData?.memberId || 1,
              email: formData.email,
              nickname:
                responseData?.nickname || responseData?.name || '사용자닉네임',
              phone: responseData?.phone || '01012345678',
              address: responseData?.address || '서울시 강남구',
            }

            const tokens = {
              accessToken:
                responseData?.accessToken ||
                responseData?.token ||
                'temp-token',
              refreshToken: responseData?.refreshToken || 'temp-refresh-token',
            }

            // AuthContext를 통한 전역 상태 업데이트
            console.log('👤 로그인 직후 사용자 정보:', userData)
            login(userData, tokens)

            // localStorage에 사용자 정보 저장 (백업용)
            localStorage.setItem('user', JSON.stringify(userData))

            // 쿠키에 토큰 저장 (서버에서 접근 가능)
            document.cookie = `accessToken=${tokens.accessToken}; path=/; max-age=86400; SameSite=Lax`
            document.cookie = `refreshToken=${tokens.refreshToken}; path=/; max-age=604800; SameSite=Lax`

            // localStorage에도 토큰 저장 (AuthContext 호환성)
            localStorage.setItem('accessToken', tokens.accessToken)
            localStorage.setItem('refreshToken', tokens.refreshToken)

            console.log('🍪 토큰 저장 완료:', {
              cookie: document.cookie,
              localStorage: localStorage.getItem('accessToken'),
            })

            // 홈페이지로 리다이렉트
            router.push('/')
          } else {
            console.log('❌ 로그인 실패:', response)
            // 백엔드에서 보내는 정확한 에러 메시지 사용
            const errorMessage =
              response.msg ||
              '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.'
            setApiError(errorMessage)
          }
        } else {
          // 회원가입 API 호출
          const response = await authApi.signup({
            email: formData.email,
            password: formData.password,
            nickname: formData.name,
            phoneNumber: formData.phone.replace(/-/g, ''), // 하이푼 제거
            address: formData.address, // 사용자 입력 주소
          })

          console.log('🔍 회원가입 API 응답 전체:', response)
          console.log('🔍 response.success:', response.success)
          console.log('🔍 response.data:', response.data)
          console.log('🔍 response.resultCode:', response.resultCode)

          // 성공 조건 확인 (다양한 형식 지원)
          const isSuccess =
            response.success ||
            response.resultCode === '200' ||
            response.resultCode === 'SUCCESS' ||
            (response.data && response.data !== null)

          if (isSuccess) {
            // 회원가입 성공
            console.log('✅ 회원가입 성공:', response.data)
            setApiError('')
            alert('회원가입이 완료되었습니다. 로그인해주세요.')
            setIsLogin(true)
            setFormData({
              email: formData.email,
              password: '',
              name: '',
              phone: '',
              address: '',
              confirmPassword: '',
              rememberMe: false,
              agreeToTerms: false,
              agreeToPrivacy: false,
            })
          } else {
            console.log('❌ 회원가입 실패:', response)
            setApiError('회원가입에 실패했습니다. 다시 시도해주세요.')
          }
        }
      } catch (error: any) {
        console.error('API 에러:', error)
        if (isLogin) {
          // 로그인 에러 처리
          if (
            error.response?.status === 400 ||
            error.response?.status === 409
          ) {
            const errorMessage =
              error.response.data?.msg || '입력 정보를 확인해주세요.'
            setApiError(errorMessage)
          } else if (error.response?.status === 401) {
            const errorMessage =
              error.response.data?.msg ||
              '이메일 또는 비밀번호가 올바르지 않습니다.'
            setApiError(errorMessage)
          } else {
            setApiError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
          }
        } else {
          // 회원가입 에러 처리
          if (error.response?.status === 400) {
            const errorMessage =
              error.response.data?.msg || '입력 정보를 확인해주세요.'
            setApiError(`요청 실패: ${errorMessage}`)
          } else if (error.response?.status === 409) {
            setApiError('이미 가입된 이메일입니다.')
          } else if (error.response?.status === 401) {
            setApiError('이메일 또는 비밀번호가 올바르지 않습니다.')
          } else {
            setApiError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
          }
        }
      }
    }

    setIsLoading(false)
  }

  const handleSocialLogin = async (provider: 'google' | 'kakao') => {
    setIsLoading(true)
    setApiError('')

    try {
      // 소셜 로그인 처리 (실제 구현에서는 OAuth 플로우 사용)
      console.log(`${provider} 로그인 시도`)

      // 임시 처리 - 실제로는 OAuth 인증 플로우를 구현해야 함
      alert(`${provider} 로그인 기능은 준비 중입니다.`)
    } catch (error) {
      console.error('소셜 로그인 에러:', error)
      setApiError(`${provider} 로그인에 실패했습니다.`)
    }

    setIsLoading(false)
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
              {/* API 에러 메시지 */}
              {apiError && (
                <ErrorAlert
                  title="요청 실패"
                  message={apiError}
                  onClose={() => setApiError('')}
                />
              )}
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
                  placeholder="01000000000"
                  error={errors.phone}
                />
              )}

              {!isLogin && (
                <Input
                  label="주소"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="주소를 입력하세요"
                  error={errors.address}
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

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    {isLogin ? '로그인 중...' : '회원가입 중...'}
                  </div>
                ) : isLogin ? (
                  '로그인'
                ) : (
                  '회원가입'
                )}
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
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSocialLogin('google')}
                  disabled={isLoading}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  구글로 로그인
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSocialLogin('kakao')}
                  disabled={isLoading}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#FEE500"
                      d="M12 3C6.48 3 2 6.48 2 10.5c0 2.5 1.5 4.7 3.7 6.1L4.5 21l4.9-2.4c1.1.2 2.2.3 3.3.3 5.52 0 10-3.48 10-7.5S17.52 3 12 3z"
                    />
                  </svg>
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 w-full"
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  email: 'demo@example.com',
                  password: 'demo123',
                }))
                setIsLogin(true)
              }}
              disabled={isLoading}
            >
              데모 계정으로 로그인
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  email: 'user@example.com',
                  password: 'password123',
                  name: '사용자닉네임',
                  phone: '010-1234-5678',
                  address: '서울시 강남구',
                }))
                setIsLogin(false)
              }}
              disabled={isLoading}
            >
              테스트 데이터로 회원가입
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
