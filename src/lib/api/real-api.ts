// 실제 백엔드 API 연결
import type {
  ApiResponse,
  BidRequest,
  BoardWriteRequest,
  BoardWriteResponse,
  CashResponse,
  CashTransactionParams,
  CashTransactionResponse,
  CashTransactionsResponse,
  LoginRequest,
  LoginResponse,
  MyBidsParams,
  MyPaymentResponse,
  MyPaymentsResponse,
  MyProductsParams,
  Notification,
  NotificationParams,
  PaymentHistoryParams,
  PaymentMethodCreateRequest,
  PaymentMethodEditRequest,
  PaymentMethodResponse,
  PaymentResponse,
  ProductCreateRequest,
  ProductListParams,
  ProductModifyRequest,
  SignupRequest,
  SignupResponse,
  UserInfo,
  UserInfoUpdate,
} from '@/types/api-types'
import { apiClient } from './api-client'

// API 응답을 표준화하는 헬퍼 함수
function normalizeApiResponse<T>(response: any) {
  return {
    data: response.data.data,
    success: response.data.resultCode === '200-1',
    resultCode: response.data.resultCode,
    msg: response.data.msg,
  }
}

// 인증 관련 API
export const authApi = {
  // 로그인
  login: async (email: string, password: string) => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      '/api/v1/auth/login',
      { email, password } as LoginRequest,
    )
    return normalizeApiResponse(response)
  },

  // 회원가입
  signup: async (userData: SignupRequest) => {
    const response = await apiClient.post<ApiResponse<SignupResponse>>(
      '/api/v1/auth/signup',
      userData,
    )
    return normalizeApiResponse(response)
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
    return normalizeApiResponse(response)
  },

  // 내 정보 조회
  getProfile: async () => {
    const response =
      await apiClient.get<ApiResponse<UserInfo>>('/api/v1/members/me')
    return normalizeApiResponse(response)
  },

  // 내 정보 수정
  updateProfile: async (userData: UserInfoUpdate) => {
    const response = await apiClient.put<ApiResponse<UserInfo>>(
      '/api/v1/members/me',
      userData,
    )
    return normalizeApiResponse(response)
  },

  // 로그인 상태 확인
  checkLogin: async () => {
    const response =
      await apiClient.get<ApiResponse<string>>('/api/v1/auth/check')
    return normalizeApiResponse(response)
  },

  // 특정 회원 정보 조회
  getMemberInfo: async (memberId: number) => {
    const response = await apiClient.get<ApiResponse<UserInfo>>(
      `/api/v1/members/${memberId}`,
    )
    return normalizeApiResponse(response)
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
  // 상품 목록 조회
  getProducts: async (params?: ProductListParams) => {
    const response = await apiClient.get<ApiResponse<any>>('/api/v1/products', {
      params,
    })
    return normalizeApiResponse(response)
  },

  // 상품 상세 조회
  getProduct: async (productId: number) => {
    const response = await apiClient.get<ApiResponse<any>>(
      `/api/v1/products/${productId}`,
    )
    return normalizeApiResponse(response)
  },

  // 상품 수정
  updateProduct: async (
    productId: number,
    productData: ProductModifyRequest,
    images?: File[],
    deleteImageIds?: number[],
  ) => {
    const formData = new FormData()

    // 상품 데이터 추가
    Object.entries(productData).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value.toString())
      }
    })

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

    const response = await apiClient.put<ApiResponse<any>>(
      `/api/v1/products/${productId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    )
    return normalizeApiResponse(response)
  },

  // 상품 삭제
  deleteProduct: async (productId: number) => {
    const response = await apiClient.delete<ApiResponse<any>>(
      `/api/v1/products/${productId}`,
    )
    return normalizeApiResponse(response)
  },

  // 상품 등록
  createProduct: async (productData: ProductCreateRequest, images: File[]) => {
    const formData = new FormData()

    // 상품 데이터 추가
    Object.entries(productData).forEach(([key, value]) => {
      formData.append(key, value.toString())
    })

    // 이미지 추가
    images.forEach((image) => {
      formData.append('images', image)
    })

    const response = await apiClient.post<ApiResponse<any>>(
      '/api/v1/products',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    )
    return normalizeApiResponse(response)
  },

  // 내 상품 조회
  getMyProducts: async (params?: MyProductsParams) => {
    const response = await apiClient.get<ApiResponse<any>>(
      '/api/v1/products/me',
      {
        params,
      },
    )
    return normalizeApiResponse(response)
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
    return normalizeApiResponse(response)
  },
}

// 입찰 관련 API
export const bidApi = {
  // 입찰 현황 조회
  getBidStatus: async (productId: number) => {
    const response = await apiClient.get<ApiResponse<any>>(
      `/api/v1/bids/products/${productId}`,
    )
    return normalizeApiResponse(response)
  },

  // 입찰 생성
  createBid: async (productId: number, price: number) => {
    const response = await apiClient.post<ApiResponse<any>>(
      `/api/v1/bids/products/${productId}`,
      { price } as BidRequest,
    )
    return normalizeApiResponse(response)
  },

  // 내 입찰 내역 조회
  getMyBids: async (params?: MyBidsParams) => {
    const response = await apiClient.get<ApiResponse<any>>('/api/v1/bids/me', {
      params,
    })
    return normalizeApiResponse(response)
  },
}

// 알림 관련 API
export const notificationApi = {
  // 알림 목록 조회
  getNotifications: async (params?: NotificationParams) => {
    const response = await apiClient.get<ApiResponse<Notification[]>>(
      '/notifications',
      {
        params,
      },
    )
    return normalizeApiResponse(response)
  },

  // 읽지 않은 알림 개수 조회
  getUnreadCount: async () => {
    const response = await apiClient.get<ApiResponse<number>>(
      '/notifications/unread-count',
    )
    return normalizeApiResponse(response)
  },

  // 알림 읽음 처리
  markAsRead: async (notificationId: number) => {
    const response = await apiClient.put<ApiResponse<any>>(
      `/notifications/${notificationId}/read`,
    )
    return normalizeApiResponse(response)
  },

  // 모든 알림 읽음 처리
  markAllAsRead: async () => {
    const response = await apiClient.put<ApiResponse<any>>(
      '/notifications/read-all',
    )
    return normalizeApiResponse(response)
  },
}

// 결제 관련 API
export const paymentApi = {
  // 결제 수단 목록 조회
  getPaymentMethods: async () => {
    const response = await apiClient.get<ApiResponse<PaymentMethodResponse[]>>(
      '/api/v1/paymentMethods',
    )
    return normalizeApiResponse(response)
  },

  // 결제 수단 등록
  createPaymentMethod: async (paymentData: PaymentMethodCreateRequest) => {
    const response = await apiClient.post<ApiResponse<PaymentMethodResponse>>(
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
    const response = await apiClient.put<ApiResponse<PaymentMethodResponse>>(
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
    const response = await apiClient.get<ApiResponse<PaymentMethodResponse>>(
      `/api/v1/paymentMethods/${id}`,
    )
    return normalizeApiResponse(response)
  },

  // 결제 상세 내역 조회
  getPaymentDetail: async (paymentId: number) => {
    const response = await apiClient.get<ApiResponse<MyPaymentResponse>>(
      `/api/v1/payments/payments/me/${paymentId}`,
    )
    return normalizeApiResponse(response)
  },

  // 내 결제 내역 조회
  getMyPayments: async (params?: PaymentHistoryParams) => {
    const response = await apiClient.get<ApiResponse<MyPaymentsResponse>>(
      '/api/v1/payments/payments/me',
      {
        params,
      },
    )
    return normalizeApiResponse(response)
  },

  // 결제 요청(충전)
  charge: async (amount: number, paymentMethodId: number) => {
    const response = await apiClient.post<ApiResponse<PaymentResponse>>(
      '/api/v1/payments/payments',
      {
        amount,
        paymentMethodId,
      },
    )
    return normalizeApiResponse(response)
  },
}

// 지갑 관련 API
export const cashApi = {
  // 내 지갑 잔액 조회
  getMyCash: async () => {
    const response =
      await apiClient.get<ApiResponse<CashResponse>>('/api/v1/cashs/cash')
    return normalizeApiResponse(response)
  },

  // 내 원장 목록(입금/출금 내역)
  getCashTransactions: async (params?: CashTransactionParams) => {
    const response = await apiClient.get<ApiResponse<CashTransactionsResponse>>(
      '/api/v1/cashs/cash/transactions',
      {
        params,
      },
    )
    return normalizeApiResponse(response)
  },

  // 내 원장 단건 상세 조회
  getCashTransactionDetail: async (transactionId: number) => {
    const response = await apiClient.get<ApiResponse<CashTransactionResponse>>(
      `/api/v1/cashs/cash/transactions/${transactionId}`,
    )
    return normalizeApiResponse(response)
  },
}

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
    const response = await apiClient.post<ApiResponse<BoardWriteResponse>>(
      '/api/v1/boards',
      boardData,
    )
    return normalizeApiResponse(response)
  },

  // 게시글 수정
  updatePost: async (postId: number, boardData: BoardWriteRequest) => {
    const response = await apiClient.put<ApiResponse<BoardWriteResponse>>(
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
}
