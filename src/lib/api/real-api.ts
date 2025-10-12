// 실제 백엔드 API 연결
import type {
  ApiResponse,
  BidRequest,
  BoardWriteRequest,
  BoardWriteResponse,
  LoginResponse,
  MyProductsParams,
  PaymentMethodCreateRequest,
  PaymentMethodEditRequest,
  PaymentRequest,
  ProductCreateRequest,
  ProductListParams,
  ProductModifyRequest,
  ReviewCreateRequest,
  ReviewUpdateRequest,
  SignupRequest,
  TossIssueBillingKeyRequest,
  UserInfo,
  UserInfoUpdate,
} from '@/types/api-types'
import { apiClient } from './api-client'

// API 응답을 표준화하는 헬퍼 함수 (swagger-generated 타입과 일치)
function normalizeApiResponse<T>(response: any) {
  return {
    data: response.data,
    success:
      response.resultCode === '200' ||
      response.resultCode === '200-1' ||
      response.resultCode === '200-2' ||
      response.resultCode === '201',
    resultCode: response.resultCode,
    msg: response.msg,
  }
}

// 인증 관련 API
export const authApi = {
  // 로그인 (WEB5_7_3star_FE 방식)
  login: async (email: string, password: string) => {
    const response = await fetch('/api/proxy/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw {
        response: {
          status: response.status,
          data: errorData,
        },
      }
    }

    const data = await response.json()

    // 로그인 성공 시 토큰을 쿠키에 저장
    if (data.resultCode === '200-2' && data.data) {
      console.log('🍪 로그인 성공, 토큰을 쿠키에 저장')

      // accessToken을 쿠키에 저장 (Secure 플래그 제거, 개발 환경용)
      document.cookie = `accessToken=${data.data.accessToken}; path=/; max-age=86400; SameSite=Lax`

      // refreshToken을 쿠키에 저장 (Secure 플래그 제거, 개발 환경용)
      document.cookie = `refreshToken=${data.data.refreshToken}; path=/; max-age=604800; SameSite=Lax`

      console.log('🍪 토큰 저장 완료:', {
        accessToken: data.data.accessToken.substring(0, 20) + '...',
        refreshToken: data.data.refreshToken.substring(0, 20) + '...',
        cookies: document.cookie,
      })
    }

    return normalizeApiResponse(data)
  },

  // 회원가입 (WEB5_7_3star_FE 방식)
  signup: async (userData: SignupRequest) => {
    const response = await fetch('/api/proxy/api/v1/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw {
        response: {
          status: response.status,
          data: errorData,
        },
      }
    }

    const data = await response.json()
    return normalizeApiResponse(data)
  },

  // 로그아웃
  logout: async () => {
    const response = await apiClient.post<ApiResponse<string>>(
      '/api/v1/auth/logout',
    )
    return normalizeApiResponse(response)
  },

  // 로그인 상태 확인
  check: async () => {
    const response = await apiClient.get<ApiResponse<any>>('/api/v1/auth/check')
    return normalizeApiResponse(response.data)
  },

  // 내 정보 조회
  getProfile: async () => {
    const response =
      await apiClient.get<ApiResponse<UserInfo>>('/api/v1/members/me')
    return normalizeApiResponse(response.data)
  },

  // 내 정보 조회 (별칭)
  getMyInfo: async () => {
    const response =
      await apiClient.get<ApiResponse<UserInfo>>('/api/v1/members/me')
    return normalizeApiResponse(response.data)
  },

  // 내 정보 수정
  updateProfile: async (userData: UserInfoUpdate) => {
    console.log('✏️ 내 정보 수정 요청:', userData)

    // 토큰 확인
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';')
      const accessTokenCookie = cookies.find((cookie) =>
        cookie.trim().startsWith('accessToken='),
      )
      const cookieToken = accessTokenCookie?.split('=')[1]
      console.log('🔍 updateProfile 토큰 확인:', {
        cookie: cookieToken ? '존재' : '없음',
        tokenLength: cookieToken?.length || 0,
      })
    }

    // multipart/form-data로 요청
    const formData = new FormData()
    const memberModifyBlob = new Blob([JSON.stringify(userData)], {
      type: 'application/json',
    })
    formData.append('memberModifyRequestDto', memberModifyBlob)

    const response = await apiClient.put<ApiResponse<UserInfo>>(
      '/api/v1/members/me',
      formData,
    )
    return normalizeApiResponse(response.data)
  },

  // 회원 탈퇴
  deleteProfile: async () => {
    const response =
      await apiClient.delete<ApiResponse<any>>('/api/v1/members/me')
    return normalizeApiResponse(response.data)
  },

  // 로그인 상태 확인
  checkLogin: async () => {
    const response =
      await apiClient.get<ApiResponse<string>>('/api/v1/auth/check')
    return normalizeApiResponse(response.data)
  },

  // 특정 회원 정보 조회
  getMemberInfo: async (memberId: number) => {
    const response = await apiClient.get<ApiResponse<UserInfo>>(
      `/api/v1/members/${memberId}`,
    )
    return normalizeApiResponse(response.data)
  },

  // 테스트 API
  getTestInfo: async () => {
    const response = await apiClient.get<ApiResponse<string>>(
      '/api/v1/members/test',
    )
    return normalizeApiResponse(response)
  },

  // 토큰 재발급
  reissue: async (refreshToken: string) => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      '/api/v1/auth/reissue',
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      },
    )
    return normalizeApiResponse(response)
  },
}

// 상품 관련 API
export const productApi = {
  // 상품 목록 조회 (일반 DB)
  getProducts: async (params?: ProductListParams) => {
    const response = await apiClient.get<ApiResponse<any>>('/api/v1/products', {
      params,
    })
    return normalizeApiResponse(response.data)
  },

  // 상품 검색 (Elasticsearch)
  searchProducts: async (params?: ProductListParams) => {
    const response = await apiClient.get<ApiResponse<any>>(
      '/api/v1/products/es',
      {
        params,
      },
    )
    return normalizeApiResponse(response.data)
  },

  // 상품 상세 조회
  getProduct: async (productId: number) => {
    const response = await apiClient.get<ApiResponse<any>>(
      `/api/v1/products/${productId}`,
    )
    return normalizeApiResponse(response.data)
  },

  // 상품 수정
  updateProduct: async (
    productId: number,
    productData: ProductModifyRequest,
    images?: File[],
    deleteImageIds?: number[],
  ) => {
    const formData = new FormData()

    // request 필드에 JSON 데이터 추가 (curl과 동일한 형식)
    const requestBlob = new Blob([JSON.stringify(productData)], {
      type: 'application/json',
    })
    formData.append('request', requestBlob)

    // 이미지 추가
    if (images) {
      images.forEach((image) => {
        formData.append('images', image)
      })
    }

    // 삭제할 이미지 ID 추가
    if (deleteImageIds) {
      deleteImageIds.forEach((id) => {
        formData.append('deleteImageIds', id.toString())
      })
    }

    // 토큰을 명시적으로 가져와서 헤더에 설정 (쿠키 우선)
    const accessToken =
      typeof document !== 'undefined'
        ? document.cookie
            .split(';')
            .find((c) => c.trim().startsWith('accessToken='))
            ?.split('=')[1] || localStorage.getItem('accessToken')
        : null

    console.log('🔍 updateProduct 토큰 확인:', {
      cookie: accessToken ? '존재' : '없음',
      tokenLength: accessToken?.length || 0,
      tokenPreview: accessToken ? `${accessToken.substring(0, 20)}...` : '없음',
    })

    const response = await apiClient.put<ApiResponse<any>>(
      `/api/v1/products/${productId}`,
      formData,
      {
        headers: {
          // Authorization 헤더를 명시적으로 설정
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      },
    )
    return normalizeApiResponse(response.data)
  },

  // 상품 삭제
  deleteProduct: async (productId: number) => {
    const response = await apiClient.delete<ApiResponse<any>>(
      `/api/v1/products/${productId}`,
    )
    return normalizeApiResponse(response.data)
  },

  // 상품 등록
  createProduct: async (productData: ProductCreateRequest, images: File[]) => {
    const formData = new FormData()

    // curl과 정확히 동일한 방식: request 필드에 JSON Blob (type 지정)
    const requestBlob = new Blob([JSON.stringify(productData)], {
      type: 'application/json',
    })
    formData.append('request', requestBlob)

    // 이미지 추가
    images.forEach((image) => {
      formData.append('images', image)
    })

    // FormData 내용 확인
    console.log('🔍 FormData 내용 확인:')
    for (const [key, value] of formData.entries()) {
      if ((value as any) instanceof File) {
        const file = value as File
        console.log(
          `  ${key}: File(${file.name}, ${file.size}bytes, ${file.type})`,
        )
      } else if ((value as any) instanceof Blob) {
        const blob = value as Blob
        console.log(`  ${key}: Blob(${blob.size}bytes, ${blob.type})`)
      } else {
        console.log(`  ${key}: ${String(value)}`)
      }
    }

    // 쿠키에서 토큰 가져오기
    const accessToken =
      typeof document !== 'undefined'
        ? document.cookie
            .split(';')
            .find((c) => c.trim().startsWith('accessToken='))
            ?.split('=')[1]
        : null

    console.log('🔑 상품 등록 API - 쿠키 토큰 확인:', {
      token: accessToken ? '존재' : '없음',
      length: accessToken?.length || 0,
      tokenPreview: accessToken ? `${accessToken.substring(0, 20)}...` : '없음',
      allCookies: document.cookie,
    })

    // 토큰 디코딩 시도 (JWT 토큰인 경우)
    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]))
        const now = Math.floor(Date.now() / 1000)
        const isExpired = payload.exp < now
        console.log('🔍 토큰 상세 정보:', {
          subject: payload.sub,
          issuedAt: new Date(payload.iat * 1000).toISOString(),
          expiresAt: new Date(payload.exp * 1000).toISOString(),
          isExpired,
          timeUntilExpiry: payload.exp - now,
        })
      } catch (error) {
        console.log('⚠️ 토큰 디코딩 실패:', error)
      }
    }

    const headers: Record<string, string> = {}
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
      console.log(
        '🔑 Authorization 헤더 추가됨:',
        `Bearer ${accessToken.substring(0, 20)}...`,
      )
    } else {
      console.error('❌ 쿠키에 토큰이 없습니다! 로그인 필요:', {
        cookie: document.cookie.includes('accessToken=') ? '존재' : '없음',
        allCookies: document.cookie,
      })
      throw new Error('로그인이 필요합니다. 토큰이 없습니다.')
    }

    console.log('🔑 Authorization 헤더만 사용 (쿠키 전송 안함)')
    console.log(
      '📤 FormData 요청 - Content-Type 헤더 제거됨 (브라우저가 자동 설정)',
    )
    console.log('🔍 최종 요청 헤더:', headers)

    const response = await fetch('/api/proxy/api/v1/products', {
      method: 'POST',
      body: formData,
      headers,
      credentials: 'omit', // 쿠키 전송 안함
    })

    console.log('🔍 fetch API 응답 상태:', {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.log('❌ fetch API 에러 응답:', {
        status: response.status,
        statusText: response.statusText,
        data: errorData,
        headers: Object.fromEntries(response.headers.entries()),
      })
      throw {
        response: {
          status: response.status,
          data: errorData,
          headers: response.headers,
        },
      }
    }

    const data = await response.json()
    return normalizeApiResponse(data)
  },

  // 내 상품 조회
  getMyProducts: async (params?: MyProductsParams) => {
    const response = await apiClient.get<ApiResponse<any>>(
      '/api/v1/products/me',
      {
        params,
      },
    )
    return normalizeApiResponse(response.data)
  },

  // 특정 회원 상품 조회
  getProductsByMember: async (
    memberId: number,
    params?: {
      page?: number
      size?: number
      status?: 'SELLING' | 'SOLD' | 'FAILED'
      sort?: 'LATEST' | 'PRICE_HIGH' | 'PRICE_LOW' | 'ENDING_SOON' | 'POPULAR'
    },
  ) => {
    const response = await apiClient.get<ApiResponse<any>>(
      `/api/v1/products/members/${memberId}`,
      {
        params,
      },
    )
    return normalizeApiResponse(response.data)
  },
}

// 입찰 관련 API
export const bidApi = {
  // 입찰 현황 조회
  getBidStatus: async (productId: number) => {
    const response = await apiClient.get<ApiResponse<any>>(
      `/api/v1/bids/products/${productId}`,
    )
    return normalizeApiResponse(response.data)
  },

  // 입찰 생성
  createBid: async (productId: number, price: number) => {
    const response = await apiClient.post<ApiResponse<any>>(
      `/api/v1/bids/products/${productId}`,
      { price } as BidRequest,
    )
    return normalizeApiResponse(response.data)
  },

  // 내 입찰 내역 조회
  getMyBids: async (params?: { page?: number; size?: number }) => {
    console.log('🔍 내 입찰 내역 조회 요청:', params)
    const response = await apiClient.get<ApiResponse<any>>('/api/v1/bids/me', {
      params,
    })
    console.log('🔍 내 입찰 내역 API 응답:', response.data)
    return normalizeApiResponse(response.data)
  },
}

// 기존 결제 관련 API (제거됨)
/*
export const paymentApi = {
  // 결제 수단 목록 조회
  getPaymentMethods: async () => {
    const response = await apiClient.get<PaymentMethodListResponse>(
      '/api/v1/paymentMethods',
    )
    return normalizeApiResponse(response)
  },

  // 결제 수단 등록
  createPaymentMethod: async (paymentData: PaymentMethodCreateRequest) => {
    const response = await apiClient.post<PaymentMethodResponse>(
      '/api/v1/paymentMethods',
      paymentData,
    )
    return normalizeApiResponse(response)
  },

  // 결제 수단 수정
  updatePaymentMethod: async (
    id: number,
    paymentData: PaymentMethodEditRequest,
  ) => {
    const response = await apiClient.put<PaymentMethodResponse>(
      `/api/v1/paymentMethods/${id}`,
      paymentData,
    )
    return normalizeApiResponse(response)
  },

  // 결제 수단 삭제
  deletePaymentMethod: async (id: number) => {
    const response = await apiClient.delete<ApiResponse<any>>(
      `/api/v1/paymentMethods/${id}`,
    )
    return normalizeApiResponse(response)
  },

  // 결제 수단 단건 조회
  getPaymentMethod: async (id: number) => {
    const response = await apiClient.get<PaymentMethodResponse>(
      `/api/v1/paymentMethods/${id}`,
    )
    return normalizeApiResponse(response)
  },

  // 결제 상세 내역 조회
  getPaymentDetail: async (paymentId: number) => {
    const response = await apiClient.get<MyPaymentResponse>(
      `/api/v1/payments/me/${paymentId}`,
    )
    return normalizeApiResponse(response)
  },

  // 내 결제 내역 조회
  getMyPayments: async (params?: PaymentHistoryParams) => {
    const response = await apiClient.get<MyPaymentsResponse>(
      '/api/v1/payments/me',
      {
        params,
      },
    )
    return normalizeApiResponse(response)
  },

  // 결제 요청(충전)
  charge: async (
    amount: number,
    paymentMethodId: number,
    idempotencyKey: string,
  ) => {
    const response = await apiClient.post<PaymentResponse>('/api/v1/payments', {
      amount,
      paymentMethodId,
      idempotencyKey,
    })
    return normalizeApiResponse(response)
  },
}

// 지갑 관련 API
export const cashApi = {
  // 내 지갑 잔액 조회
  getMyCash: async () => {
    const response = await apiClient.get<CashResponse>('/api/v1/cash')
    return normalizeApiResponse(response)
  },

  // 내 원장 목록(입금/출금 내역)
  getCashTransactions: async (params?: CashTransactionParams) => {
    const response = await apiClient.get<CashTransactionsResponse>(
      '/api/v1/cash/transactions',
      {
        params,
      },
    )
    return normalizeApiResponse(response)
  },

  // 내 원장 단건 상세 조회
  getCashTransactionDetail: async (transactionId: number) => {
    const response = await apiClient.get<CashTransactionResponse>(
      `/api/v1/cash/transactions/${transactionId}`,
    )
    return normalizeApiResponse(response)
  },
}
*/

// 게시판 관련 API
export const boardApi = {
  // 게시글 목록 조회
  getPosts: async (params?: {
    page?: number
    size?: number
    boardType?: 'NOTICE' | 'QNA' | 'FAQ'
    keyword?: string
  }) => {
    const response = await apiClient.get<ApiResponse<any>>('/api/v1/boards', {
      params,
    })
    return normalizeApiResponse(response)
  },

  // 게시글 상세 조회
  getPost: async (postId: number) => {
    const response = await apiClient.get<ApiResponse<any>>(
      `/api/v1/boards/${postId}`,
    )
    return normalizeApiResponse(response)
  },

  // 게시글 작성
  writeBoard: async (boardData: BoardWriteRequest) => {
    const response = await apiClient.post<BoardWriteResponse>(
      '/api/v1/boards',
      boardData,
    )
    return normalizeApiResponse(response)
  },

  // 게시글 수정
  updatePost: async (postId: number, boardData: BoardWriteRequest) => {
    const response = await apiClient.put<BoardWriteResponse>(
      `/api/v1/boards/${postId}`,
      boardData,
    )
    return normalizeApiResponse(response)
  },

  // 게시글 삭제
  deletePost: async (postId: number) => {
    const response = await apiClient.delete<ApiResponse<any>>(
      `/api/v1/boards/${postId}`,
    )
    return normalizeApiResponse(response)
  },
}

// 테스트 관련 API
export const testApi = {
  // 스케줄러 수동 실행
  runScheduler: async () => {
    const response = await apiClient.put<ApiResponse<string>>(
      '/api/test/scheduler/run',
    )
    return normalizeApiResponse(response)
  },

  // 경매 종료 임박 설정 (GET)
  setAuctionEndSoonGet: async (productId: number) => {
    const response = await apiClient.get<ApiResponse<string>>(
      `/api/test/products/${productId}/end-soon`,
    )
    return normalizeApiResponse(response)
  },

  // 경매 종료 임박 설정 (PUT)
  setAuctionEndSoonPut: async (productId: number) => {
    const response = await apiClient.put<ApiResponse<string>>(
      `/api/test/products/${productId}/end-soon`,
    )
    return normalizeApiResponse(response)
  },

  // 테스트 데이터 생성
  generateTestData: async (count?: number) => {
    const response = await apiClient.post<ApiResponse<any>>(
      '/api/v1/test-data/generate',
      {},
      {
        params: count ? { count } : undefined,
      },
    )
    return normalizeApiResponse(response)
  },

  // 데이터 통계 조회
  getDataStats: async () => {
    const response = await apiClient.get<ApiResponse<any>>(
      '/api/v1/test-data/stats',
    )
    return normalizeApiResponse(response)
  },

  // 테스트 데이터 정리
  cleanupTestData: async () => {
    const response = await apiClient.delete<ApiResponse<string>>(
      '/api/v1/test-data/cleanup',
    )
    return normalizeApiResponse(response)
  },
}

// ElasticSearch 관련 API
export const elasticsearchApi = {
  // ElasticSearch를 사용한 상품 목록 조회
  getProducts: async (params?: ProductListParams) => {
    const response = await apiClient.get<ApiResponse<any>>(
      '/api/v1/products/es',
      {
        params,
      },
    )
    return normalizeApiResponse(response)
  },

  // ElasticSearch를 사용한 특정 회원 상품 조회
  getProductsByMember: async (
    memberId: number,
    params?: {
      page?: number
      size?: number
      status?: 'SELLING' | 'SOLD' | 'FAILED'
      sort?: 'LATEST' | 'PRICE_HIGH' | 'PRICE_LOW' | 'ENDING_SOON' | 'POPULAR'
    },
  ) => {
    const response = await apiClient.get<ApiResponse<any>>(
      `/api/v1/products/es/members/${memberId}`,
      {
        params,
      },
    )
    return normalizeApiResponse(response)
  },

  // ElasticSearch를 사용한 내 상품 조회
  getMyProducts: async (params?: MyProductsParams) => {
    const response = await apiClient.get<ApiResponse<any>>(
      '/api/v1/products/es/me',
      {
        params,
      },
    )
    return normalizeApiResponse(response)
  },
}

// 결제수단 API
export const paymentMethodApi = {
  // 결제수단 목록 조회
  getPaymentMethods: async () => {
    console.log('💳 결제수단 목록 조회 요청')
    const response = await apiClient.get<ApiResponse<any>>(
      '/api/v1/paymentMethods',
    )
    return normalizeApiResponse(response.data)
  },

  // 결제수단 단건 조회
  getPaymentMethod: async (id: number) => {
    console.log(`💳 결제수단 단건 조회 요청: ID ${id}`)
    const response = await apiClient.get<ApiResponse<any>>(
      `/api/v1/paymentMethods/${id}`,
    )
    return normalizeApiResponse(response.data)
  },

  // 결제수단 등록
  createPaymentMethod: async (data: PaymentMethodCreateRequest) => {
    console.log('💳 결제수단 등록 요청:', data)
    const response = await apiClient.post<ApiResponse<any>>(
      '/api/v1/paymentMethods',
      data,
    )
    return normalizeApiResponse(response.data)
  },

  // 결제수단 수정
  updatePaymentMethod: async (id: number, data: PaymentMethodEditRequest) => {
    console.log(`💳 결제수단 수정 요청: ID ${id}`, data)
    const response = await apiClient.put<ApiResponse<any>>(
      `/api/v1/paymentMethods/${id}`,
      data,
    )
    return normalizeApiResponse(response.data)
  },

  // 결제수단 삭제
  deletePaymentMethod: async (id: number) => {
    console.log(`💳 결제수단 삭제 요청: ID ${id}`)
    const response = await apiClient.delete<ApiResponse<any>>(
      `/api/v1/paymentMethods/${id}`,
    )
    return normalizeApiResponse(response.data)
  },
}

// 결제 API
export const paymentApi = {
  // 지갑 충전 요청
  charge: async (data: PaymentRequest) => {
    console.log('💰 지갑 충전 요청:', data)
    const response = await apiClient.post<ApiResponse<any>>(
      '/api/v1/payments',
      data,
    )
    return normalizeApiResponse(response.data)
  },

  // 내 결제 내역 조회
  getMyPayments: async (params?: { page?: number; size?: number }) => {
    console.log('💰 내 결제 내역 조회 요청:', params)
    const response = await apiClient.get<ApiResponse<any>>(
      '/api/v1/payments/me',
      { params },
    )
    return normalizeApiResponse(response.data)
  },

  // 내 결제 단건 상세 조회
  getMyPaymentDetail: async (paymentId: number) => {
    console.log(`💰 내 결제 단건 상세 조회 요청: ID ${paymentId}`)
    const response = await apiClient.get<ApiResponse<any>>(
      `/api/v1/payments/me/${paymentId}`,
    )
    return normalizeApiResponse(response.data)
  },

  // 토스 빌링키 발급
  issueBillingKey: async (data: TossIssueBillingKeyRequest) => {
    console.log('🔑 토스 빌링키 발급 요청:', data)
    const response = await apiClient.post<ApiResponse<any>>(
      '/api/v1/payments/toss/issue-billing-key',
      data,
    )
    return normalizeApiResponse(response.data)
  },
}

// 지갑 API
export const cashApi = {
  // 내 지갑 잔액 조회
  getMyCash: async () => {
    console.log('💵 내 지갑 잔액 조회 요청')
    const response = await apiClient.get<ApiResponse<any>>('/api/v1/cash')
    return normalizeApiResponse(response.data)
  },

  // 내 원장 목록 조회 (입금/출금 내역)
  getMyTransactions: async (params?: { page?: number; size?: number }) => {
    console.log('💵 내 원장 목록 조회 요청:', params)
    const response = await apiClient.get<ApiResponse<any>>(
      '/api/v1/cash/transactions',
      { params },
    )
    return normalizeApiResponse(response.data)
  },

  // 내 원장 단건 상세 조회
  getMyTransactionDetail: async (transactionId: number) => {
    console.log(`💵 내 원장 단건 상세 조회 요청: ID ${transactionId}`)
    const response = await apiClient.get<ApiResponse<any>>(
      `/api/v1/cash/transactions/${transactionId}`,
    )
    return normalizeApiResponse(response.data)
  },
}

// 기타 API
export const miscApi = {
  // 멤버 정보 조회
  getMemberInfo: async (id: number) => {
    const response = await apiClient.get<ApiResponse<any>>(
      `/api/v1/members/${id}`,
    )
    return normalizeApiResponse(response)
  },

  // 알림 큐 상태 조회
  getQueueStatus: async () => {
    const response = await apiClient.get<ApiResponse<any>>(
      '/api/v1/notification-queue/status',
    )
    return normalizeApiResponse(response)
  },
}

// 알림 API
export const notificationApi = {
  // 알림 목록 조회
  getNotifications: async (params?: { page?: number; size?: number }) => {
    console.log('🔔 알림 목록 조회 요청:', params)
    const response = await apiClient.get<ApiResponse<any>>('/notifications', {
      params,
    })
    return normalizeApiResponse(response.data)
  },

  // 읽지 않은 알림 개수 조회
  getUnreadCount: async () => {
    console.log('🔔 읽지 않은 알림 개수 조회 요청')
    const response = await apiClient.get<ApiResponse<any>>(
      '/notifications/unread-count',
    )
    return normalizeApiResponse(response.data)
  },

  // 모든 알림 읽음 처리
  markAllAsRead: async () => {
    console.log('🔔 모든 알림 읽음 처리 요청')
    const response = await apiClient.put<ApiResponse<any>>(
      '/notifications/read-all',
    )
    return normalizeApiResponse(response.data)
  },

  // 특정 알림 읽음 처리
  markAsRead: async (notificationId: number) => {
    console.log(`🔔 특정 알림 읽음 처리 요청: ID ${notificationId}`)
    const response = await apiClient.put<ApiResponse<any>>(
      `/notifications/${notificationId}/read`,
    )
    return normalizeApiResponse(response.data)
  },
}

// 리뷰 API
export const reviewApi = {
  // 리뷰 작성
  createReview: async (data: ReviewCreateRequest) => {
    console.log('⭐ 리뷰 작성 요청:', data)
    const response = await apiClient.post<ApiResponse<any>>(
      '/api/v1/reviews',
      data,
    )
    return normalizeApiResponse(response.data)
  },

  // 리뷰 조회
  getReview: async (reviewId: number) => {
    console.log(`⭐ 리뷰 조회 요청: ID ${reviewId}`)
    const response = await apiClient.get<ApiResponse<any>>(
      `/api/v1/reviews/${reviewId}`,
    )
    return normalizeApiResponse(response.data)
  },

  // 상품별 리뷰 목록 조회
  getReviewsByProduct: async (productId: number) => {
    console.log(`⭐ 상품별 리뷰 조회 요청: 상품 ID ${productId}`)
    try {
      // 올바른 엔드포인트 사용
      const response = await apiClient.get<ApiResponse<any>>(
        `/api/v1/reviews/products/${productId}`,
      )
      console.log('⭐ 리뷰 조회 성공:', response.data)
      return normalizeApiResponse(response.data)
    } catch (error) {
      console.log('⭐ 리뷰 조회 실패:', error)
      // 에러가 발생해도 빈 배열 반환하여 UI가 깨지지 않도록 함
      return {
        success: true,
        data: [],
        resultCode: 'SUCCESS',
        msg: '리뷰가 없습니다',
      }
    }
  },

  // 리뷰 수정
  updateReview: async (reviewId: number, data: ReviewUpdateRequest) => {
    console.log(`⭐ 리뷰 수정 요청: ID ${reviewId}`, data)
    const response = await apiClient.put<ApiResponse<any>>(
      `/api/v1/reviews/${reviewId}`,
      data,
    )
    return normalizeApiResponse(response.data)
  },

  // 리뷰 삭제
  deleteReview: async (reviewId: number) => {
    console.log(`⭐ 리뷰 삭제 요청: ID ${reviewId}`)
    const response = await apiClient.delete<ApiResponse<any>>(
      `/api/v1/reviews/${reviewId}`,
    )
    return normalizeApiResponse(response.data)
  },
}
