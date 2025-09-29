import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// API 클라이언트 기본 설정 - Next.js proxy를 통한 연결
const API_BASE_URL = '/api/proxy' // Next.js proxy를 통한 연결

class ApiClient {
  private axiosInstance: AxiosInstance

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 10000,
      withCredentials: true, // 쿠키 전달을 위해 활성화
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // 요청 인터셉터 설정
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.log('API 요청:', config.method?.toUpperCase(), config.url)

        // 쿠키에서 토큰 가져와서 Authorization 헤더 추가 (클라이언트 사이드에서만)
        if (typeof document !== 'undefined') {
          const cookies = document.cookie.split(';')
          const accessTokenCookie = cookies.find((cookie) =>
            cookie.trim().startsWith('accessToken='),
          )
          const accessToken = accessTokenCookie?.split('=')[1]

          if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`
            console.log(
              '🔑 Authorization 헤더 추가됨:',
              `Bearer ${accessToken.substring(0, 20)}...`,
            )
          } else {
            console.log('⚠️ accessToken이 쿠키에 없습니다')
          }
        }

        return config
      },
      (error) => {
        console.error('API 요청 에러:', error)
        return Promise.reject(error)
      },
    )

    // 응답 인터셉터 설정
    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log('✅ API 응답 성공:', response.status, response.config.url)
        console.log('📄 응답 데이터:', response.data)
        return response
      },
      (error) => {
        console.error('❌ API 응답 에러:')
        console.error('📊 상태 코드:', error.response?.status)
        console.error('🔗 요청 URL:', error.config?.url)
        console.error('📄 에러 데이터:', error.response?.data)
        console.error('📋 에러 헤더:', error.response?.headers)

        // 401 에러 시 자동 로그아웃 처리
        if (error.response?.status === 401) {
          this.handleUnauthorized()
        }

        // 400 에러 시 잘못된 요청 처리
        if (error.response?.status === 400) {
          console.error('잘못된 요청:', error.response.data)
          if (typeof window !== 'undefined') {
            const errorMessage =
              error.response.data?.errorMessage || '잘못된 요청입니다.'
            alert(`요청 실패: ${errorMessage}`)
          }
        }

        // 403 에러 시 로그인 필요 알림
        if (error.response?.status === 403) {
          console.log('권한 없음, 로그인 필요')
          if (typeof window !== 'undefined') {
            alert('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')
          }
        }

        // 500 에러 시 서버 오류 알림
        if (error.response?.status === 500) {
          if (typeof window !== 'undefined') {
            alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
          }
        }

        // 네트워크 에러 처리
        if (!error.response) {
          if (typeof window !== 'undefined') {
            alert('네트워크 연결을 확인해주세요.')
          }
        }

        return Promise.reject(error)
      },
    )
  }

  private handleUnauthorized() {
    if (typeof window !== 'undefined') {
      // 로컬 스토리지 정리
      localStorage.removeItem('auth_state')
      localStorage.removeItem('user')
      localStorage.removeItem('last_login_time')

      alert('로그인이 만료되었습니다. 다시 로그인해주세요.')
      window.location.href = '/login'
    }
  }

  async get<T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get<T>(url, config)
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post<T>(url, data, config)
  }

  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.put<T>(url, data, config)
  }

  async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.patch<T>(url, data, config)
  }

  async delete<T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.delete<T>(url, config)
  }
}

// API 클라이언트 인스턴스 생성
export const apiClient = new ApiClient(API_BASE_URL)

// 공통 응답 타입 (백엔드 명세에 맞춤)
export interface BaseApiResponse<T = any> {
  status: string
  message: string
  data?: T
}

export default apiClient
