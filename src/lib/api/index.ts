// API 클라이언트 기본 설정
import type {
  ApiResponse,
  Bid,
  BidFilters,
  Notification,
  PaginatedResponse,
  Post,
  Product,
  ProductFilters,
  SearchResult,
  User,
} from '@/types'
import { apiClient } from './api-client'

// 인증 관련 API
export const authApi = {
  // 로그인
  login: async (email: string, password: string) => {
    return {
      data: {
        user: {
          id: '1',
          email: email,
          name: '홍길동',
          phone: '010-1234-5678',
          trustScore: 95,
          reviewCount: 127,
          joinDate: '2023-01-01',
          isVerified: true,
        },
        token: 'mock-jwt-token',
      },
      success: true,
    }
  },

  // 회원가입
  signup: async (userData: {
    name: string
    email: string
    phone: string
    password: string
  }) => {
    return {
      data: {
        user: {
          id: '1',
          email: userData.email,
          name: userData.name,
          phone: userData.phone,
          trustScore: 0,
          reviewCount: 0,
          joinDate: new Date().toISOString(),
          isVerified: false,
        },
        token: 'mock-jwt-token',
      },
      success: true,
    }
  },

  // 로그아웃
  logout: async () => {
    return {
      data: null,
      success: true,
    }
  },

  // 사용자 정보 조회
  getProfile: async () => {
    return {
      data: {
        id: '1',
        email: 'demo@example.com',
        name: '홍길동',
        phone: '010-1234-5678',
        trustScore: 95,
        reviewCount: 127,
        joinDate: '2023-01-01',
        isVerified: true,
      },
      success: true,
    }
  },

  // 사용자 정보 수정
  updateProfile: async (userData: Partial<User>) => {
    return {
      data: {
        id: '1',
        email: 'demo@example.com',
        name: '홍길동',
        phone: '010-1234-5678',
        trustScore: 95,
        reviewCount: 127,
        joinDate: '2023-01-01',
        isVerified: true,
        ...userData,
      },
      success: true,
    }
  },
}

// 상품 관련 API
export const productApi = {
  // 상품 목록 조회
  getProducts: async (filters?: ProductFilters, page = 1, limit = 20) => {
    const params = new URLSearchParams()
    if (filters?.category) params.append('category', filters.category)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.minPrice)
      params.append('minPrice', filters.minPrice.toString())
    if (filters?.maxPrice)
      params.append('maxPrice', filters.maxPrice.toString())
    if (filters?.location) params.append('location', filters.location)
    if (filters?.search) params.append('search', filters.search)
    params.append('page', page.toString())
    params.append('limit', limit.toString())

    return apiClient.get<PaginatedResponse<Product>>(
      `/products?${params.toString()}`,
    )
  },

  // 상품 상세 조회
  getProduct: async (id: string) => {
    return apiClient.get<ApiResponse<Product>>(`/products/${id}`)
  },

  // 상품 등록
  createProduct: async (productData: FormData) => {
    return apiClient.post<ApiResponse<Product>>('/products', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // 상품 수정
  updateProduct: async (id: string, productData: Partial<Product>) => {
    return apiClient.put<ApiResponse<Product>>(`/products/${id}`, productData)
  },

  // 상품 삭제
  deleteProduct: async (id: string) => {
    return apiClient.delete<ApiResponse<null>>(`/products/${id}`)
  },

  // 내 상품 목록
  getMyProducts: async (status?: string) => {
    // 개발 환경에서는 mock 데이터 반환
    const mockProducts: Product[] = [
      {
        id: '1',
        name: '갤럭시 S23 Ultra 256GB',
        description:
          '갤럭시 S23 Ultra 256GB 스마트폰입니다. 상태 양호하며 박스와 액세서리 포함입니다.',
        startingPrice: 800000,
        currentPrice: 850000,
        images: ['/images/galaxy-s23.jpg'],
        category: 'electronics',
        status: 'sold',
        endTime: '2024-01-10T18:00:00Z',
        bidCount: 18,
        sellerId: 'user1',
        createdAt: '2024-01-05T00:00:00Z',
      },
      {
        id: '2',
        name: '애플워치 SE 2세대',
        description:
          '애플워치 SE 2세대 44mm GPS 모델입니다. 사용감 적고 상태 양호합니다.',
        startingPrice: 250000,
        currentPrice: 280000,
        images: ['/images/apple-watch-se.jpg'],
        category: 'electronics',
        status: 'sold',
        endTime: '2024-01-08T15:30:00Z',
        bidCount: 12,
        sellerId: 'user1',
        createdAt: '2024-01-03T00:00:00Z',
      },
      {
        id: '3',
        name: '나이키 에어맥스 270',
        description:
          '나이키 에어맥스 270 화이트 컬러 270mm입니다. 몇 번 신었지만 상태 양호합니다.',
        startingPrice: 80000,
        currentPrice: 95000,
        images: ['/images/nike-airmax.jpg'],
        category: 'fashion',
        status: 'active',
        endTime: '2024-01-20T20:00:00Z',
        bidCount: 5,
        sellerId: 'user1',
        createdAt: '2024-01-15T00:00:00Z',
      },
    ]

    // 상태 필터링
    const filteredProducts = status
      ? mockProducts.filter((p) => p.status === status)
      : mockProducts

    return {
      data: filteredProducts,
      success: true,
    }
  },

  // 상품 찜하기
  toggleLike: async (id: string) => {
    return apiClient.post<ApiResponse<{ isLiked: boolean }>>(
      `/products/${id}/like`,
    )
  },
}

// 입찰 관련 API
export const bidApi = {
  // 입찰하기
  placeBid: async (productId: string, amount: number) => {
    return apiClient.post<ApiResponse<Bid>>('/bids', {
      productId,
      amount,
    })
  },

  // 입찰 내역 조회
  getBids: async (filters?: BidFilters) => {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.dateRange?.start)
      params.append('startDate', filters.dateRange.start)
    if (filters?.dateRange?.end) params.append('endDate', filters.dateRange.end)

    return apiClient.get<ApiResponse<Bid[]>>(`/bids?${params.toString()}`)
  },

  // 입찰 취소
  cancelBid: async (id: string) => {
    return apiClient.delete<ApiResponse<null>>(`/bids/${id}`)
  },

  // 내 입찰 목록
  getMyBids: async (status?: string) => {
    // 개발 환경에서는 mock 데이터 반환
    const mockBids: Bid[] = [
      {
        id: '1',
        productId: '1',
        productName: 'Sony WH-1000XM4 헤드폰',
        bidAmount: 180000,
        bidTime: '2024-01-12T15:30:00Z',
        status: 'won',
        userId: 'user1',
        createdAt: '2024-01-12T15:30:00Z',
      },
      {
        id: '2',
        productId: '2',
        productName: 'iPad Pro 11인치 3세대',
        bidAmount: 650000,
        bidTime: '2024-01-08T14:20:00Z',
        status: 'completed',
        userId: 'user1',
        createdAt: '2024-01-08T14:20:00Z',
      },
      {
        id: '3',
        productId: '3',
        productName: 'iPhone 14 Pro 128GB',
        bidAmount: 950000,
        bidTime: '2024-01-15T19:30:00Z',
        status: 'active',
        userId: 'user1',
        createdAt: '2024-01-15T19:30:00Z',
      },
      {
        id: '4',
        productId: '4',
        productName: 'MacBook Air M2 13인치',
        bidAmount: 1300000,
        bidTime: '2024-01-15T18:45:00Z',
        status: 'active',
        userId: 'user1',
        createdAt: '2024-01-15T18:45:00Z',
      },
      {
        id: '5',
        productId: '5',
        productName: 'Nintendo Switch OLED',
        bidAmount: 280000,
        bidTime: '2024-01-10T16:00:00Z',
        status: 'lost',
        userId: 'user1',
        createdAt: '2024-01-10T16:00:00Z',
      },
      {
        id: '6',
        productId: '6',
        productName: '에어팟 프로 2세대',
        bidAmount: 220000,
        bidTime: '2024-01-05T14:30:00Z',
        status: 'lost',
        userId: 'user1',
        createdAt: '2024-01-05T14:30:00Z',
      },
    ]

    // 상태 필터링
    const filteredBids = status
      ? mockBids.filter((b) => b.status === status)
      : mockBids

    return {
      data: filteredBids,
      success: true,
    }
  },
}

// 알림 관련 API
export const notificationApi = {
  // 알림 목록 조회
  getNotifications: async (type?: string) => {
    // 개발 환경에서는 mock 데이터 반환
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'bid',
        title: '입찰 성공 알림',
        message: '갤럭시 S23 Ultra 경매에서 낙찰되었습니다!',
        isRead: false,
        userId: 'user1',
        createdAt: '2024-01-15T14:30:00Z',
      },
      {
        id: '2',
        type: 'payment',
        title: '결제 완료',
        message: 'iPad Pro 11인치 3세대 결제가 완료되었습니다.',
        isRead: false,
        userId: 'user1',
        createdAt: '2024-01-15T12:15:00Z',
      },
      {
        id: '3',
        type: 'system',
        title: '시스템 점검 안내',
        message: '1월 20일 새벽 2시~4시 시스템 점검이 있을 예정입니다.',
        isRead: true,
        userId: 'user1',
        createdAt: '2024-01-14T09:00:00Z',
      },
      {
        id: '4',
        type: 'bid',
        title: '입찰 실패 알림',
        message: 'MacBook Air M2 경매에서 입찰에 실패했습니다.',
        isRead: true,
        userId: 'user1',
        createdAt: '2024-01-14T18:00:00Z',
      },
      {
        id: '5',
        type: 'event',
        title: '신규 이벤트',
        message: '신규 회원 대상 경매 수수료 50% 할인 이벤트가 시작되었습니다!',
        isRead: true,
        userId: 'user1',
        createdAt: '2024-01-13T10:00:00Z',
      },
    ]

    // 타입 필터링
    const filteredNotifications = type
      ? mockNotifications.filter((n) => n.type === type)
      : mockNotifications

    return {
      data: filteredNotifications,
      success: true,
    }
  },

  // 알림 읽음 처리
  markAsRead: async (id: string) => {
    return apiClient.put<ApiResponse<null>>(`/notifications/${id}/read`)
  },

  // 모든 알림 읽음 처리
  markAllAsRead: async () => {
    return apiClient.put<ApiResponse<null>>('/notifications/read-all')
  },

  // 알림 삭제
  deleteNotification: async (id: string) => {
    return apiClient.delete<ApiResponse<null>>(`/notifications/${id}`)
  },
}

// 게시판 관련 API
export const boardApi = {
  // 게시글 목록 조회
  getPosts: async (category: string, page = 1, limit = 20) => {
    // 개발 환경에서는 mock 데이터 반환
    const mockPosts: Post[] = [
      {
        id: '1',
        title: '비드 앱 버전 2.0 업데이트 안내',
        content: '실시간 알림 기능과 새로운 UI가 추가되었습니다.',
        author: '관리자',
        category: 'notice',
        createdAt: '2024-01-15T00:00:00Z',
        isImportant: true,
        isPinned: false,
        viewCount: 1234,
        commentCount: 0,
      },
      {
        id: '2',
        title: '설날 연휴 고객센터 운영시간 안내',
        content: '2월 9일~12일 고객센터 운영시간이 단축됩니다.',
        author: '관리자',
        category: 'notice',
        createdAt: '2024-01-12T00:00:00Z',
        isImportant: false,
        isPinned: false,
        viewCount: 567,
        commentCount: 0,
      },
      {
        id: '3',
        title: "신규 카테고리 '반려동물용품' 추가",
        content: '반려동물 관련 상품을 더욱 쉽게 찾으실 수 있습니다.',
        author: '관리자',
        category: 'notice',
        createdAt: '2024-01-10T00:00:00Z',
        isImportant: false,
        isPinned: false,
        viewCount: 234,
        commentCount: 0,
      },
      {
        id: '4',
        title: '시스템 점검 안내',
        content: '1월 20일 새벽 2시~4시 시스템 점검이 있을 예정입니다.',
        author: '관리자',
        category: 'notice',
        createdAt: '2024-01-08T00:00:00Z',
        isImportant: true,
        isPinned: false,
        viewCount: 890,
        commentCount: 0,
      },
      {
        id: '5',
        title: '개인정보 처리방침 개정 안내',
        content: '개인정보 처리방침이 개정되어 안내드립니다.',
        author: '관리자',
        category: 'notice',
        createdAt: '2024-01-05T00:00:00Z',
        isImportant: false,
        isPinned: false,
        viewCount: 345,
        commentCount: 0,
      },
    ]

    // Q&A 카테고리인 경우 Q&A 데이터 반환
    if (category === 'qna') {
      const qnaPosts: Post[] = [
        {
          id: 'qna1',
          title: '입찰 취소가 가능한가요?',
          content: '경매 진행 중 입찰을 취소하고 싶은데 방법이 있나요?',
          author: '경매초보',
          category: 'qna',
          createdAt: '2024-01-15T00:00:00Z',
          isImportant: false,
          isPinned: false,
          viewCount: 1234,
          commentCount: 2,
        },
        {
          id: 'qna2',
          title: '판매자와 연락이 안 돼요',
          content:
            '낙찰받은 상품의 판매자와 연락이 안 되는 경우 어떻게 해야 하나요?',
          author: '걱정많은구매자',
          category: 'qna',
          createdAt: '2024-01-14T00:00:00Z',
          isImportant: false,
          isPinned: false,
          viewCount: 567,
          commentCount: 1,
        },
        {
          id: 'qna3',
          title: '상품 등록 시 사진 업로드 오류',
          content: '상품 사진을 업로드하려고 하는데 계속 오류가 발생합니다.',
          author: '판매하고싶어요',
          category: 'qna',
          createdAt: '2024-01-13T00:00:00Z',
          isImportant: false,
          isPinned: false,
          viewCount: 234,
          commentCount: 0,
        },
        {
          id: 'qna4',
          title: '입찰 내역을 확인하는 방법은?',
          content: '내가 입찰한 상품들의 현황을 어디서 볼 수 있나요?',
          author: '궁금한사용자',
          category: 'qna',
          createdAt: '2024-01-12T00:00:00Z',
          isImportant: false,
          isPinned: false,
          viewCount: 890,
          commentCount: 1,
        },
        {
          id: 'qna5',
          title: '배송비는 누가 부담하나요?',
          content: '낙찰 후 배송비는 판매자와 구매자 중 누가 부담하는 건가요?',
          author: '신규회원',
          category: 'qna',
          createdAt: '2024-01-11T00:00:00Z',
          isImportant: false,
          isPinned: false,
          viewCount: 345,
          commentCount: 3,
        },
      ]
      return {
        data: qnaPosts,
        success: true,
      }
    }

    // FAQ 카테고리인 경우 FAQ 데이터 반환
    if (category === 'faq') {
      const faqPosts: Post[] = [
        {
          id: 'faq1',
          title: '경매는 어떻게 진행되나요?',
          content:
            '상품 등록 → 경매 시작 → 입찰 참여 → 경매 종료 → 낙찰자 결정 → 거래 진행 순으로 이루어집니다.',
          author: '관리자',
          category: 'faq',
          createdAt: '2024-01-15T00:00:00Z',
          isImportant: false,
          isPinned: false,
          viewCount: 1234,
          commentCount: 0,
        },
        {
          id: 'faq2',
          title: '입찰가는 어떻게 결정해야 하나요?',
          content:
            '시장 가격을 참고하여 적정한 금액을 입찰하시길 권합니다. 너무 높게 입찰하지 않도록 주의하세요.',
          author: '관리자',
          category: 'faq',
          createdAt: '2024-01-14T00:00:00Z',
          isImportant: false,
          isPinned: false,
          viewCount: 567,
          commentCount: 0,
        },
        {
          id: 'faq3',
          title: '거래는 어떻게 이루어지나요?',
          content:
            '낙찰 후 판매자와 구매자의 연락처가 서로 공개되어 직접 연락하여 거래를 진행합니다.',
          author: '관리자',
          category: 'faq',
          createdAt: '2024-01-13T00:00:00Z',
          isImportant: false,
          isPinned: false,
          viewCount: 234,
          commentCount: 0,
        },
        {
          id: 'faq4',
          title: '사기를 당한 경우 어떻게 하나요?',
          content:
            '고객센터로 신고해 주시면 조사 후 적절한 조치를 취해드립니다. 증거자료를 함께 제출해 주세요.',
          author: '관리자',
          category: 'faq',
          createdAt: '2024-01-12T00:00:00Z',
          isImportant: false,
          isPinned: false,
          viewCount: 890,
          commentCount: 0,
        },
        {
          id: 'faq5',
          title: '배송비는 누가 부담하나요?',
          content: '낙찰 후 배송비는 판매자와 구매자 중 누가 부담하는 건가요?',
          author: '관리자',
          category: 'faq',
          createdAt: '2024-01-11T00:00:00Z',
          isImportant: false,
          isPinned: false,
          viewCount: 345,
          commentCount: 0,
        },
        {
          id: 'faq6',
          title: '경매 시간은 어떻게 정해지나요?',
          content:
            '판매자가 직접 설정할 수 있으며, 최소 1시간부터 최대 7일까지 설정 가능합니다.',
          author: '관리자',
          category: 'faq',
          createdAt: '2024-01-10T00:00:00Z',
          isImportant: false,
          isPinned: false,
          viewCount: 234,
          commentCount: 0,
        },
        {
          id: 'faq7',
          title: '입찰 취소가 가능한가요?',
          content:
            '경매 종료 1시간 전까지는 입찰 취소가 가능합니다. 이후에는 취소할 수 없습니다.',
          author: '관리자',
          category: 'faq',
          createdAt: '2024-01-09T00:00:00Z',
          isImportant: false,
          isPinned: false,
          viewCount: 567,
          commentCount: 0,
        },
      ]
      return {
        data: faqPosts,
        success: true,
      }
    }

    return {
      data: mockPosts,
      success: true,
    }
  },

  // 게시글 상세 조회
  getPost: async (id: string) => {
    // 개발 환경에서는 mock 데이터 반환
    const mockPost: Post = {
      id: id,
      title: '입찰 취소가 가능한가요?',
      content: '경매 진행 중 입찰을 취소하고 싶은데 방법이 있나요?',
      author: '경매초보',
      category: 'qna',
      createdAt: '2024-01-15T00:00:00Z',
      isImportant: false,
      isPinned: false,
      viewCount: 1234,
      commentCount: 2,
    }

    return {
      data: mockPost,
      success: true,
    }
  },

  // 게시글 작성
  createPost: async (postData: Partial<Post>) => {
    return apiClient.post<ApiResponse<Post>>('/posts', postData)
  },

  // 게시글 수정
  updatePost: async (id: string, postData: Partial<Post>) => {
    return apiClient.put<ApiResponse<Post>>(`/posts/${id}`, postData)
  },

  // 게시글 삭제
  deletePost: async (id: string) => {
    return apiClient.delete<ApiResponse<null>>(`/posts/${id}`)
  },

  // Q&A 답변 작성
  createAnswer: async (postId: string, content: string) => {
    return apiClient.post<
      ApiResponse<{
        id: string
        content: string
        author: string
        createdAt: string
      }>
    >(`/posts/${postId}/answers`, {
      content,
    })
  },
}

// 통계 관련 API
export const statsApi = {
  // 사용자 통계
  getUserStats: async () => {
    return {
      data: {
        totalSales: 47,
        totalPurchases: 15,
        totalAmount: 2500000,
        successRate: 85,
        activeBids: 8,
        completedSales: 42,
        failedBids: 3,
      },
      success: true,
    }
  },

  // 상품 통계
  getProductStats: async () => {
    return {
      data: {
        totalProducts: 156,
        activeProducts: 89,
        completedSales: 67,
        cancelledProducts: 12,
        totalRevenue: 45000000,
      },
      success: true,
    }
  },

  // 홈페이지 통계
  getHomeStats: async () => {
    return {
      data: {
        activeAuctions: 89,
        endingToday: 12,
        totalParticipants: 1250,
        successRate: 78,
      },
      success: true,
    }
  },
}

// 검색 관련 API
export const searchApi = {
  // 통합 검색
  search: async (query: string, type?: 'products' | 'users' | 'posts') => {
    const params = new URLSearchParams()
    params.append('q', query)
    if (type) params.append('type', type)

    return apiClient.get<ApiResponse<SearchResult>>(
      `/search?${params.toString()}`,
    )
  },
}

// 결제 관련 API
export const paymentApi = {
  // 결제 내역 조회
  getPayments: async () => {
    return apiClient.get<ApiResponse<any[]>>('/payments')
  },

  // 결제 처리
  processPayment: async (productId: string, amount: number, method: string) => {
    return apiClient.post<
      ApiResponse<{ paymentId: string; redirectUrl?: string }>
    >('/payments', {
      productId,
      amount,
      method,
    })
  },

  // 구매 내역 조회
  getPurchaseHistory: async () => {
    // 개발 환경에서는 mock 데이터 반환
    const mockPurchases: Payment[] = [
      {
        id: '1',
        productId: '1',
        productName: 'Sony WH-1000XM4 헤드폰',
        amount: 180000,
        status: 'completed',
        paymentMethod: 'card',
        userId: 'user1',
        createdAt: '2024-01-12T00:00:00Z',
      },
      {
        id: '2',
        productId: '2',
        productName: 'iPad Pro 11인치 3세대',
        amount: 650000,
        status: 'pending',
        paymentMethod: 'card',
        userId: 'user1',
        createdAt: '2024-01-08T00:00:00Z',
      },
      {
        id: '3',
        productId: '3',
        productName: '맥북 에어 M2 13인치',
        amount: 1350000,
        status: 'completed',
        paymentMethod: 'bank',
        userId: 'user1',
        createdAt: '2024-01-06T00:00:00Z',
      },
      {
        id: '4',
        productId: '4',
        productName: '나이키 에어맥스 270',
        amount: 135000,
        status: 'completed',
        paymentMethod: 'card',
        userId: 'user1',
        createdAt: '2024-01-03T00:00:00Z',
      },
    ]

    return {
      data: mockPurchases,
      success: true,
    }
  },
}
