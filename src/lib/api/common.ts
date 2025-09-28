// 공통 에러 타입 정의
export interface StandardApiError {
  status: number
  message: string
  code?: string
}

// 공통 API 응답 타입
export interface StandardApiResponse<T = any> {
  status: number
  message?: string
  data?: T
}

// API 에러 처리 유틸리티
export const handleApiError = (error: any): StandardApiError => {
  console.error('API 에러:', error)

  if (error instanceof Response) {
    return {
      status: error.status,
      message: `HTTP ${error.status}: ${error.statusText}`,
    }
  }

  if (error instanceof Error) {
    if (
      error.message.includes('네트워크') ||
      error.message.includes('NetworkError') ||
      error.message.includes('fetch')
    ) {
      return {
        status: 0,
        message: '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.',
        code: 'NETWORK_ERROR',
      }
    }

    if (error.message.includes('CORS')) {
      return {
        status: 0,
        message: '브라우저 보안 정책으로 인해 요청이 차단되었습니다.',
        code: 'CORS_ERROR',
      }
    }

    if (
      error.message.includes('401') ||
      error.message.includes('Unauthorized')
    ) {
      return {
        status: 401,
        message: '로그인이 필요합니다.',
        code: 'UNAUTHORIZED',
      }
    }

    if (error.message.includes('403') || error.message.includes('Forbidden')) {
      return {
        status: 403,
        message: '권한이 없습니다.',
        code: 'FORBIDDEN',
      }
    }

    if (error.message.includes('404') || error.message.includes('Not Found')) {
      return {
        status: 404,
        message: '요청한 리소스를 찾을 수 없습니다.',
        code: 'NOT_FOUND',
      }
    }

    if (
      error.message.includes('500') ||
      error.message.includes('Internal Server Error')
    ) {
      return {
        status: 500,
        message: '서버 내부 오류가 발생했습니다.',
        code: 'INTERNAL_ERROR',
      }
    }

    return {
      status: 0,
      message: error.message,
    }
  }

  return {
    status: 0,
    message: '알 수 없는 오류가 발생했습니다.',
    code: 'UNKNOWN_ERROR',
  }
}

// 로그아웃 처리 유틸리티
export const handleLogout = async (): Promise<void> => {
  try {
    // 서버 로그아웃 요청
    await fetch('/api/proxy/api/v1/users/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
  } catch (error) {
    console.error('서버 로그아웃 요청 실패:', error)
  }

  // 클라이언트 상태 정리
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_state')
    localStorage.removeItem('user')
    localStorage.removeItem('last_login_time')
  }
}

// 401 에러 시 자동 로그아웃 처리
export const handle401Error = async (): Promise<void> => {
  await handleLogout()

  if (typeof window !== 'undefined') {
    alert('로그인이 만료되었습니다. 다시 로그인해주세요.')
    window.location.href = '/login'
  }
}

// 표준화된 fetch 래퍼
export const apiRequest = async <T = any>(
  url: string,
  options: RequestInit = {},
): Promise<StandardApiResponse<T>> => {
  try {
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (response.status === 401) {
      await handle401Error()
      throw new Error('Unauthorized')
    }

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`)
    }

    return {
      status: response.status,
      message: data.message,
      data: data.data || data,
    }
  } catch (error) {
    throw handleApiError(error)
  }
}

// 로컬 스토리지에서 사용자 정보 가져오기 유틸리티
export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null

  try {
    // useAuth 상태 확인
    const authData = localStorage.getItem('auth_state')
    if (authData) {
      const authState = JSON.parse(authData)
      if (authState.user && authState.isAuthenticated) {
        return authState.user
      }
    }

    // 레거시 user 확인
    const userData = localStorage.getItem('user')
    if (userData) {
      return JSON.parse(userData)
    }

    return null
  } catch (error) {
    console.error('사용자 정보 파싱 실패:', error)
    return null
  }
}

// 사용자 ID 가져오기 유틸리티
export const getCurrentUserId = (): string | null => {
  const user = getCurrentUser()
  return user?.userId?.toString() || null
}
