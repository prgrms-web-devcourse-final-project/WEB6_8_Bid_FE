// 사용자 관련 타입

export interface User {
  id: number
  email: string
  nickname: string
  phoneNumber: string
  address: string
}

export interface UserInfo {
  id: string
  email: string
  name: string
  phone: string
  profileImage?: string
  creditScore: number
  reviewCount: number
  joinDate: string
  isVerified: boolean
}

// 상품 관련 타입
export interface Product {
  productId: number
  name: string
  description: string
  category: ProductCategory
  images: (string | { imageUrl: string; id?: number; productId?: number })[]
  initialPrice: number
  currentPrice: number
  seller: {
    id: string
    nickname: string
    profileImage: string
    creditScore: number
    reviewCount: number
  }
  status: ProductStatus
  location: string
  createDate: string
  modifyDate: string
  auctionStartTime: string
  auctionEndTime: string
  deliveryMethod: 'DELIVERY' | 'TRADE' | 'BOTH'
  bidderCount: number
  thumbnailUrl: string
}

export type ProductCategory =
  | 'digital'
  | 'fashion'
  | 'beauty'
  | 'home'
  | 'sports'
  | 'books'
  | 'other'

export type ProductStatus = '경매 시작 전' | '경매 중' | '낙찰' | '유찰'

// 입찰 관련 타입
export interface Bid {
  id: number
  productId: number
  userId: number
  amount: number
  createdAt: string
  isWinning: boolean
}

export interface BidHistory {
  id: number
  product: Product
  bidAmount: number
  status: BidStatus
  bidTime: string
  auctionEndTime: string
  currentPrice: number
}

export type BidStatus = 'active' | 'won' | 'lost' | 'cancelled'

// 알림 관련 타입
export interface Notification {
  id: number
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  createdAt: string
  productId?: number
  bidId?: number
}

export type NotificationType = 'bid' | 'win' | 'payment' | 'system'

// 게시판 관련 타입
export interface Post {
  id: number
  title: string
  content: string
  author: string
  category: PostCategory
  createdAt: string
  isImportant: boolean
  isPinned: boolean
  viewCount: number
  commentCount: number
}

export type PostCategory = 'notice' | 'qna' | 'faq'

export interface QnA extends Post {
  status: QnAStatus
  answers: Answer[]
}

export type QnAStatus = 'pending' | 'answered'

export interface Answer {
  id: string
  content: string
  author: string
  createdAt: string
}

// 통계 관련 타입
export interface UserStats {
  totalSales: number
  totalPurchases: number
  totalAmount: number
  successRate: number
  activeBids: number
  completedSales: number
  failedBids: number
}

export interface ProductStats {
  totalProducts: number
  activeProducts: number
  completedSales: number
  cancelledProducts: number
  totalRevenue: number
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// 폼 관련 타입
export interface LoginForm {
  email: string
  password: string
  rememberMe: boolean
}

export interface SignupForm {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  agreeToTerms: boolean
  agreeToPrivacy: boolean
}

export interface ProductForm {
  name: string
  description: string
  categoryId: number
  images: File[]
  initialPrice: number
  auctionStartTime: string
  auctionDuration: string
  deliveryMethod: ('TRADE' | 'DELIVERY' | 'BOTH')[]
  location: string
}

// 필터 관련 타입
export interface ProductFilters {
  category?: ProductCategory
  status?: ProductStatus
  minPrice?: number
  maxPrice?: number
  location?: string
  search?: string
}

export interface BidFilters {
  status?: BidStatus
  dateRange?: {
    start: string
    end: string
  }
}

// 검색 관련 타입
export interface SearchResult {
  products: Product[]
  users: User[]
  posts: Post[]
  total: number
}

// 결제 관련 타입
export interface Payment {
  id: string
  productId: string
  amount: number
  status: PaymentStatus
  method: PaymentMethod
  createdAt: string
  completedAt?: string
}

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled'

export type PaymentMethod = 'card' | 'bank' | 'kakao' | 'naver'
