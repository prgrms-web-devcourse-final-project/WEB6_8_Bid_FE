import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// API 클라이언트 기본 설정 - Next.js API 라우트를 통해 프록시
const API_BASE_URL = '/api/proxy' // Next.js API 라우트 사용

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
        console.log('API 응답:', response.status, response.config.url)
        return response
      },
      (error) => {
        console.error(
          'API 응답 에러:',
          error.response?.status,
          error.config?.url,
        )

        // 401 에러 시 자동 로그아웃 처리
        if (error.response?.status === 401) {
          this.handleUnauthorized()
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
