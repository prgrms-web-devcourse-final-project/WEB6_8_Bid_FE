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
      // accessToken을 쿠키에 저장 (Secure 플래그 제거, 개발 환경용)
      document.cookie = `accessToken=${data.data.accessToken}; path=/; max-age=86400; SameSite=Lax`

      // refreshToken을 쿠키에 저장 (Secure 플래그 제거, 개발 환경용)
      document.cookie = `refreshToken=${data.data.refreshToken}; path=/; max-age=604800; SameSite=Lax`
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

  // 내 정보 수정 (multipart/form-data)
  updateProfile: async (userData: UserInfoUpdate) => {
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

  // 내 정보 수정 (JSON)
  updateMyInfo: async (userData: any) => {
    const response = await apiClient.put<ApiResponse<UserInfo>>(
      '/api/v1/members/me',
      userData,
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

  // 상품 등록
  createProduct: async (productData: ProductCreateRequest, images: File[]) => {
    const formData = new FormData()

    const requestBlob = new Blob([JSON.stringify(productData)], {
      type: 'application/json',
    })
    formData.append('request', requestBlob)

    images.forEach((image, index) => {
      formData.append('images', image)
    })

    const accessToken =
      typeof document !== 'undefined'
        ? document.cookie
            .split(';')
            .find((c) => c.trim().startsWith('accessToken='))
            ?.split('=')[1]
        : undefined

    const response = await apiClient.post<ApiResponse<any>>(
      '/api/v1/products',
      formData,
      {
        headers: {
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      },
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

    const requestBlob = new Blob([JSON.stringify(productData)], {
      type: 'application/json',
    })
    formData.append('request', requestBlob)

    if (images) {
      images.forEach((image, index) => {
        formData.append('images', image)
      })
    }

    if (deleteImageIds && deleteImageIds.length > 0) {
      deleteImageIds.forEach((id) => {
        formData.append('deleteImageIds', id.toString())
      })
    }

    const accessToken =
      typeof document !== 'undefined'
        ? document.cookie
            .split(';')
            .find((c) => c.trim().startsWith('accessToken='))
            ?.split('=')[1]
        : undefined

    const response = await apiClient.put<ApiResponse<any>>(
      `/api/v1/products/${productId}`,
      formData,
      {
        headers: {
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      },
    )

    return normalizeApiResponse(response.data)
  },

  // 내 상품 목록 조회
  getMyProducts: async (params?: MyProductsParams) => {
    const response = await apiClient.get<ApiResponse<any>>(
      '/api/v1/products/me',
      {
        params,
      },
    )
    return normalizeApiResponse(response.data)
  },

  // 특정 회원의 상품 목록 조회
  getProductsByMember: async (memberId: number, params?: ProductListParams) => {
    const response = await apiClient.get<ApiResponse<any>>(
      `/api/v1/products/member/${memberId}`,
      {
        params,
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
}

// 입찰 관련 API
export const bidApi = {
  // 입찰하기
  createBid: async (productId: number, bidData: BidRequest) => {
    const response = await apiClient.post<ApiResponse<any>>(
      `/api/v1/bids/products/${productId}`,
      bidData,
    )
    return normalizeApiResponse(response.data)
  },

  // 내 입찰 현황 조회
  getMyBids: async (params?: {
    page?: number
    size?: number
    status?: string
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.size) searchParams.append('size', params.size.toString())
    if (params?.status) searchParams.append('status', params.status)

    const queryString = searchParams.toString()
    const endpoint = queryString
      ? `/api/v1/bids/me?${queryString}`
      : '/api/v1/bids/me'

    const response = await apiClient.get<ApiResponse<any>>(endpoint)
    return normalizeApiResponse(response.data)
  },

  // 특정 상품의 입찰 현황 조회
  getBidStatus: async (productId: number) => {
    const response = await apiClient.get<ApiResponse<any>>(
      `/api/v1/bids/products/${productId}`,
    )
    return normalizeApiResponse(response.data)
  },

  // 입찰 취소
  cancelBid: async (bidId: number) => {
    const response = await apiClient.delete<ApiResponse<any>>(
      `/api/v1/bids/${bidId}`,
    )
    return normalizeApiResponse(response.data)
  },
}

// 리뷰 관련 API
export const reviewApi = {
  // 리뷰 작성
  createReview: async (data: ReviewCreateRequest) => {
    const response = await apiClient.post<ApiResponse<any>>(
      '/api/v1/reviews',
      data,
    )
    return normalizeApiResponse(response.data)
  },

  // 리뷰 조회
  getReview: async (reviewId: number) => {
    const response = await apiClient.get<ApiResponse<any>>(
      `/api/v1/reviews/${reviewId}`,
    )
    return normalizeApiResponse(response.data)
  },

  // 리뷰 수정
  updateReview: async (reviewId: number, data: ReviewUpdateRequest) => {
    const response = await apiClient.put<ApiResponse<any>>(
      `/api/v1/reviews/${reviewId}`,
      data,
    )
    return normalizeApiResponse(response.data)
  },

  // 리뷰 삭제
  deleteReview: async (reviewId: number) => {
    const response = await apiClient.delete<ApiResponse<any>>(
      `/api/v1/reviews/${reviewId}`,
    )
    return normalizeApiResponse(response.data)
  },

  // 상품별 리뷰 목록 조회
  getReviewsByProduct: async (productId: number) => {
    const response = await apiClient.get<ApiResponse<any>>(
      `/api/v1/reviews/product/${productId}`,
    )
    return normalizeApiResponse(response.data)
  },

  // 내 리뷰 목록 조회
  getMyReviews: async () => {
    const response = await apiClient.get<ApiResponse<any>>('/api/v1/reviews/my')
    return normalizeApiResponse(response.data)
  },
}

// 알림 관련 API
export const notificationApi = {
  // 알림 목록 조회
  getNotifications: async (params?: { page?: number; size?: number }) => {
    const response = await apiClient.get<ApiResponse<any>>('/notifications', {
      params,
    })
    return normalizeApiResponse(response.data)
  },

  // 읽지 않은 알림 개수 조회
  getUnreadCount: async () => {
    const response = await apiClient.get<ApiResponse<any>>(
      '/notifications/unread-count',
    )
    return normalizeApiResponse(response.data)
  },

  // 모든 알림 읽음 처리
  markAllAsRead: async () => {
    const response = await apiClient.put<ApiResponse<any>>(
      '/notifications/read-all',
    )
    return normalizeApiResponse(response.data)
  },

  // 특정 알림 읽음 처리
  markAsRead: async (notificationId: number) => {
    const response = await apiClient.put<ApiResponse<any>>(
      `/notifications/${notificationId}/read`,
    )
    return normalizeApiResponse(response.data)
  },
}

// 결제 수단 관련 API
export const paymentMethodApi = {
  // 결제 수단 등록
  createPaymentMethod: async (data: PaymentMethodCreateRequest) => {
    const response = await apiClient.post<ApiResponse<any>>(
      '/api/v1/paymentMethods',
      data,
    )
    return normalizeApiResponse(response.data)
  },

  // 결제 수단 목록 조회
  getPaymentMethods: async () => {
    const response = await apiClient.get<ApiResponse<any>>(
      '/api/v1/paymentMethods',
    )
    return normalizeApiResponse(response.data)
  },

  // 결제 수단 수정
  updatePaymentMethod: async (
    paymentMethodId: number,
    data: PaymentMethodEditRequest,
  ) => {
    const response = await apiClient.put<ApiResponse<any>>(
      `/api/v1/paymentMethods/${paymentMethodId}`,
      data,
    )
    return normalizeApiResponse(response.data)
  },

  // 결제 수단 삭제
  deletePaymentMethod: async (paymentMethodId: number) => {
    const response = await apiClient.delete<ApiResponse<any>>(
      `/api/v1/paymentMethods/${paymentMethodId}`,
    )
    return normalizeApiResponse(response.data)
  },
}

// 캐시/지갑 관련 API
export const cashApi = {
  // 지갑 잔액 조회
  getWalletBalance: async () => {
    const response = await apiClient.get<ApiResponse<any>>(
      '/api/v1/payments/me',
    )
    return normalizeApiResponse(response.data)
  },

  // 거래 내역 조회
  getTransactionHistory: async () => {
    const response = await apiClient.get<ApiResponse<any>>(
      '/api/v1/payments/history',
    )
    return normalizeApiResponse(response.data)
  },

  // 거래 상세 조회
  getTransactionDetail: async (transactionId: number) => {
    const response = await apiClient.get<ApiResponse<any>>(
      `/api/v1/payments/${transactionId}`,
    )
    return normalizeApiResponse(response.data)
  },

  // 지갑 충전
  chargeWallet: async (data: PaymentRequest) => {
    const response = await apiClient.post<ApiResponse<any>>(
      '/api/v1/payments',
      data,
    )
    return normalizeApiResponse(response.data)
  },
}

// 결제 관련 API
export const paymentApi = {
  // 결제하기
  createPayment: async (data: PaymentRequest) => {
    const response = await apiClient.post<ApiResponse<any>>(
      '/api/v1/payments',
      data,
    )
    return normalizeApiResponse(response.data)
  },

  // 결제 내역 조회
  getPaymentHistory: async () => {
    const response = await apiClient.get<ApiResponse<any>>(
      '/api/v1/payments/history',
    )
    return normalizeApiResponse(response.data)
  },

  // Toss 결제 키 발급
  issueTossBillingKey: async (data: TossIssueBillingKeyRequest) => {
    const response = await apiClient.post<ApiResponse<any>>(
      '/api/v1/payments/toss/issue-billing-key',
      data,
    )
    return normalizeApiResponse(response.data)
  },
}

// 게시판 관련 API
export const boardApi = {
  // 게시글 작성
  createPost: async (data: BoardWriteRequest) => {
    const response = await apiClient.post<ApiResponse<BoardWriteResponse>>(
      '/api/v1/boards',
      data,
    )
    return normalizeApiResponse(response.data)
  },

  // 게시글 목록 조회
  getPosts: async (params?: {
    page?: number
    size?: number
    category?: string
  }) => {
    const response = await apiClient.get<ApiResponse<any>>('/api/v1/boards', {
      params,
    })
    return normalizeApiResponse(response.data)
  },

  // 게시글 상세 조회
  getPost: async (postId: number) => {
    const response = await apiClient.get<ApiResponse<any>>(
      `/api/v1/boards/${postId}`,
    )
    return normalizeApiResponse(response.data)
  },

  // 게시글 수정
  updatePost: async (postId: number, data: BoardWriteRequest) => {
    const response = await apiClient.put<ApiResponse<any>>(
      `/api/v1/boards/${postId}`,
      data,
    )
    return normalizeApiResponse(response.data)
  },

  // 게시글 삭제
  deletePost: async (postId: number) => {
    const response = await apiClient.delete<ApiResponse<any>>(
      `/api/v1/boards/${postId}`,
    )
    return normalizeApiResponse(response.data)
  },
}
