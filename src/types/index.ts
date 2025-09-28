// 사용자 관련 타입
export interface User {
  id: string
  email: string
  name: string
  phone: string
  profileImage?: string
  trustScore: number
  reviewCount: number
  joinDate: string
  isVerified: boolean
}

// 상품 관련 타입
export interface Product {
  id: string
  title: string
  description: string
  category: ProductCategory
  images: string[]
  startingPrice: number
  currentPrice: number
  seller: User
  status: ProductStatus
  location: string
  createdAt: string
  endTime: string
  bidCount: number
  isLiked: boolean
}

export type ProductCategory =
  | 'digital'
  | 'fashion'
  | 'beauty'
  | 'home'
  | 'sports'
  | 'books'
  | 'other'

export type ProductStatus = 'active' | 'completed' | 'cancelled' | 'sold'

// 입찰 관련 타입
export interface Bid {
  id: string
  productId: string
  userId: string
  amount: number
  createdAt: string
  isWinning: boolean
}

export interface BidHistory {
  id: string
  product: Product
  bidAmount: number
  status: BidStatus
  bidTime: string
  endTime: string
  currentPrice: number
}

export type BidStatus = 'active' | 'won' | 'lost' | 'cancelled'

// 알림 관련 타입
export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  createdAt: string
  productId?: string
  bidId?: string
}

export type NotificationType = 'bid' | 'win' | 'payment' | 'system'

// 게시판 관련 타입
export interface Post {
  id: string
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
  title: string
  description: string
  category: ProductCategory
  images: File[]
  startingPrice: number
  duration: number
  startTime: 'immediate' | 'scheduled'
  scheduledTime?: string
  deliveryMethod: ('shipping' | 'pickup')[]
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
