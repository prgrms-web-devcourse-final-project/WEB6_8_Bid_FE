// 서버 컴포넌트용 API 클라이언트 (Next.js cookies() 사용)
import { cookies } from 'next/headers'

// API 응답을 표준화하는 헬퍼 함수
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

// 서버용 API 클라이언트
class ServerApiClient {
  private baseURL = `${process.env.API_BASE_URL || 'http://localhost:8080'}/api/v1`

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<{ data: T; success: boolean; resultCode: string; msg: string }> {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')?.value

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return normalizeApiResponse(data)
  }

  // 상품 관련 API
  async getProduct(productId: number) {
    return this.makeRequest(`/products/${productId}`)
  }

  async getProducts(params?: {
    page?: number
    size?: number
    category?: number
    status?: string
    location?: string
    isDelivery?: boolean
    sort?: string
    search?: string
  }) {
    const searchParams = new URLSearchParams()

    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.size) searchParams.append('size', params.size.toString())
    if (params?.category)
      searchParams.append('category', params.category.toString())
    if (params?.status) searchParams.append('status', params.status)
    if (params?.location) searchParams.append('location', params.location)
    if (params?.isDelivery !== undefined)
      searchParams.append('isDelivery', params.isDelivery.toString())
    if (params?.sort) searchParams.append('sort', params.sort)
    if (params?.search) searchParams.append('search', params.search)

    const queryString = searchParams.toString()
    const endpoint = queryString ? `/products?${queryString}` : '/products'

    return this.makeRequest(endpoint)
  }

  async getMyProducts(params?: {
    page?: number
    size?: number
    status?: string
  }) {
    const searchParams = new URLSearchParams()

    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.size) searchParams.append('size', params.size.toString())
    if (params?.status) searchParams.append('status', params.status)

    const queryString = searchParams.toString()
    const endpoint = queryString
      ? `/products/me?${queryString}`
      : '/products/me'

    return this.makeRequest(endpoint)
  }

  // 사용자 정보 API
  async getMyInfo() {
    return this.makeRequest('/members/me')
  }

  // 입찰 관련 API
  async getMyBids(params?: { page?: number; size?: number; status?: string }) {
    const searchParams = new URLSearchParams()

    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.size) searchParams.append('size', params.size.toString())
    if (params?.status) searchParams.append('status', params.status)

    const queryString = searchParams.toString()
    const endpoint = queryString ? `/bids/me?${queryString}` : '/bids/me'

    return this.makeRequest(endpoint)
  }

  // 알림 관련 API
  async getNotifications(params?: { page?: number; size?: number }) {
    const searchParams = new URLSearchParams()

    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.size) searchParams.append('size', params.size.toString())

    const queryString = searchParams.toString()
    const endpoint = queryString
      ? `/notifications?${queryString}`
      : '/notifications'

    return this.makeRequest(endpoint)
  }

  async getUnreadCount() {
    return this.makeRequest('/notifications/unread-count')
  }

  // 결제수단 관련 API
  async getPaymentMethods() {
    return this.makeRequest('/payment-methods')
  }

  // 리뷰 관련 API
  async getReviews(params?: {
    page?: number
    size?: number
    productId?: number
  }) {
    const searchParams = new URLSearchParams()

    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.size) searchParams.append('size', params.size.toString())
    if (params?.productId)
      searchParams.append('productId', params.productId.toString())

    const queryString = searchParams.toString()
    const endpoint = queryString ? `/reviews?${queryString}` : '/reviews'

    return this.makeRequest(endpoint)
  }
}

// 서버용 API 클라이언트 인스턴스
export const serverApiClient = new ServerApiClient()

// 서버용 API 함수들
export const serverApi = {
  // 상품 관련
  getProduct: (productId: number) => serverApiClient.getProduct(productId),
  getProducts: (params?: any) => serverApiClient.getProducts(params),
  getMyProducts: (params?: any) => serverApiClient.getMyProducts(params),

  // 사용자 관련
  getMyInfo: () => serverApiClient.getMyInfo(),

  // 입찰 관련
  getMyBids: (params?: any) => serverApiClient.getMyBids(params),

  // 알림 관련
  getNotifications: (params?: any) => serverApiClient.getNotifications(params),
  getUnreadCount: () => serverApiClient.getUnreadCount(),

  // 결제수단 관련
  getPaymentMethods: () => serverApiClient.getPaymentMethods(),

  // 리뷰 관련
  getReviews: (params?: any) => serverApiClient.getReviews(params),
}
