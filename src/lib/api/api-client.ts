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
      // Content-Type을 기본값으로 설정하지 않음 (FormData 요청을 위해)
    })

    // 요청 인터셉터 설정
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.log('API 요청:', config.method?.toUpperCase(), config.url)

        // PUT 요청에 대한 특별 로그
        if (config.method?.toUpperCase() === 'PUT') {
          console.log('🔧 PUT 요청 감지:', {
            url: config.url,
            hasData: !!config.data,
            dataType: config.data instanceof FormData ? 'FormData' : 'JSON',
            existingHeaders: Object.keys(config.headers || {}),
          })
        }

        // FormData인 경우 Content-Type 헤더 완전 제거 (브라우저가 자동으로 설정)
        if (config.data instanceof FormData) {
          console.log('📤 FormData 요청 감지, Content-Type 헤더 완전 제거')
          // 모든 Content-Type 관련 헤더 제거
          delete config.headers['Content-Type']
          delete config.headers['content-type']
          // axios 기본 헤더에서도 제거
          if (config.headers && config.headers.common) {
            delete config.headers.common['Content-Type']
          }
        } else {
          // JSON 요청인 경우 Content-Type 설정
          if (
            !config.headers['Content-Type'] &&
            !config.headers['content-type']
          ) {
            config.headers['Content-Type'] = 'application/json'
          }
        }

        // 토큰 가져와서 Authorization 헤더 추가 (쿠키 우선, localStorage 백업)
        if (typeof document !== 'undefined') {
          // 쿠키에서 토큰 확인 (우선순위)
          const cookies = document.cookie.split(';')
          const accessTokenCookie = cookies.find((cookie) =>
            cookie.trim().startsWith('accessToken='),
          )
          const cookieToken = accessTokenCookie?.split('=')[1]

          // localStorage에서 토큰 확인 (백업)
          const localStorageToken = localStorage.getItem('accessToken')

          // localStorage에 토큰이 있으면 쿠키에도 강제로 설정
          if (localStorageToken && !cookieToken) {
            console.log('🍪 localStorage 토큰을 쿠키에 강제 설정')
            document.cookie = `accessToken=${localStorageToken}; path=/; max-age=86400; SameSite=Lax; Secure`
            // 설정 후 다시 확인
            const updatedCookies = document.cookie.split(';')
            const updatedCookieToken = updatedCookies
              .find((cookie) => cookie.trim().startsWith('accessToken='))
              ?.split('=')[1]
            console.log(
              '🍪 쿠키 설정 후 확인:',
              updatedCookieToken ? '성공' : '실패',
            )
          }

          const accessToken = cookieToken || localStorageToken

          console.log('🔍 토큰 확인:', {
            localStorage: localStorageToken ? '존재' : '없음',
            cookie: cookieToken ? '존재' : '없음',
            selected: accessToken ? '존재' : '없음',
            tokenLength: accessToken?.length || 0,
          })

          if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`
            console.log(
              '🔑 Authorization 헤더 추가됨:',
              `Bearer ${accessToken.substring(0, 20)}...`,
            )

            // PUT 요청의 경우 최종 헤더 확인
            if (config.method?.toUpperCase() === 'PUT') {
              console.log('🔧 PUT 요청 최종 헤더:', {
                Authorization: config.headers.Authorization ? '존재' : '없음',
                ContentType: config.headers['Content-Type'] || '없음',
                allHeaders: Object.keys(config.headers || {}),
              })
            }
          } else {
            console.log('⚠️ accessToken이 없습니다')
            console.log('🍪 전체 쿠키:', document.cookie)
            console.log('📱 localStorage:', localStorage.getItem('accessToken'))
          }
        }

        // 쿠키 전달 확인
        console.log('🍪 요청 시 쿠키 전달 설정:', {
          withCredentials: config.withCredentials,
          cookies: typeof document !== 'undefined' ? document.cookie : 'N/A',
        })

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

        // PUT 요청에 대한 특별 로그
        if (response.config.method?.toUpperCase() === 'PUT') {
          console.log('🔧 PUT 응답 상세:', {
            status: response.status,
            statusText: response.statusText,
            url: response.config.url,
            requestHeaders: response.config.headers,
            responseHeaders: response.headers,
            data: response.data,
          })
        }

        console.log('📄 응답 데이터:', JSON.stringify(response.data, null, 2))
        return response
      },
      async (error) => {
        console.error('❌ API 응답 에러:')
        console.error('📊 상태 코드:', error.response?.status)
        console.error('🔗 요청 URL:', error.config?.url)
        console.error('📄 에러 데이터:', error.response?.data)
        console.error('📋 에러 헤더:', error.response?.headers)

        // 401 에러 시 토큰 재발급 시도 (임시로 비활성화)
        if (error.response?.status === 401) {
          console.log('🔐 401 에러 발생 - 토큰 재발급 비활성화됨')

          // PUT 요청에 대한 특별 로그
          if (error.config?.method?.toUpperCase() === 'PUT') {
            console.log('🔧 PUT 요청 401 에러 상세:', {
              url: error.config?.url,
              method: error.config?.method,
              requestHeaders: error.config?.headers,
              hasAuthorization: !!error.config?.headers?.Authorization,
              authorizationValue: error.config?.headers?.Authorization,
              dataType:
                error.config?.data instanceof FormData ? 'FormData' : 'JSON',
              responseStatus: error.response?.status,
              responseData: error.response?.data,
            })
          }

          console.log('🔍 요청 헤더:', error.config?.headers)
          console.log('🔍 요청 URL:', error.config?.url)
          console.log(
            '🔍 요청 데이터 타입:',
            error.config?.data instanceof FormData ? 'FormData' : 'JSON',
          )
          console.log('🔍 서버 응답 데이터:', error.response?.data)
          console.log('🔍 서버 응답 헤더:', error.response?.headers)
          console.log(
            '🔍 Authorization 헤더 값:',
            error.config?.headers?.Authorization,
          )

          // 토큰 재발급 로직을 임시로 비활성화하고 바로 에러 반환
          return Promise.reject(error)
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

      // 쿠키 정리
      document.cookie =
        'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      document.cookie =
        'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'

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
