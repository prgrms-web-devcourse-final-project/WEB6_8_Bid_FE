// API 명세에 맞는 타입 정의
import type { components } from './swagger-generated'

// API 응답 타입 (swagger-generated와 일치)
export type ApiResponse<T> = {
  resultCode: string
  msg: string
  data?: T
  success?: boolean // 호환성을 위한 추가
}

// swagger-generated RsData 타입들
export type RsData<T> = {
  resultCode: string
  msg: string
  data?: T
}

// 인증 관련 타입
export type LoginRequest = components['schemas']['LoginRequestDto']
export type LoginResponse = components['schemas']['RsDataLoginResponseDto']
export type SignupRequest = components['schemas']['MemberSignUpRequestDto']
export type SignupResponse =
  components['schemas']['RsDataMemberSignUpResponseDto']
export type LogoutResponse = components['schemas']['LogoutResponseDto']

// 사용자 관련 타입
export type UserInfo = components['schemas']['MemberMyInfoResponseDto']
export type UserInfoUpdate = components['schemas']['MemberModifyRequestDto']
export type UserInfoResponse =
  components['schemas']['RsDataMemberMyInfoResponseDto']

// 상품 관련 타입
export type ProductCreateRequest = components['schemas']['ProductCreateRequest']
export type ProductModifyRequest = components['schemas']['ProductModifyRequest']

// Swagger 스펙 기반 타입들
export type ProductCreateFormData =
  components['schemas']['ProductCreateRequest']
export type ProductModifyFormData =
  components['schemas']['ProductModifyRequest']
export type MemberSignUpFormData =
  components['schemas']['MemberSignUpRequestDto']
export type MemberModifyFormData =
  components['schemas']['MemberModifyRequestDto']
export type LoginFormData = components['schemas']['LoginRequestDto']
export type ReviewWriteFormData = components['schemas']['ReviewRequest']

// 입찰 관련 타입
export type BidRequest = components['schemas']['BidRequestDto']

// 알림 관련 타입
export type NotificationListResponse = {
  content: Notification[]
  totalElements: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  unreadCount: number
}

export type Notification = {
  id: number
  title: string
  content: string
  isRead: boolean
  createdAt: string
  type: string
}

export type NotificationUnreadCountResponse = number
export type BidResponse = components['schemas']['RsData']
export type MyBidsParams = {
  page?: number
  size?: number
  status?: 'ACTIVE' | 'WON' | 'LOST'
  sort?: 'LATEST' | 'PRICE_HIGH' | 'PRICE_LOW' | 'ENDING_SOON'
}

// 결제수단 관련 타입 (Swagger 스펙 기반)
export type PaymentMethodCreateRequest =
  components['schemas']['PaymentMethodCreateRequest']
export type PaymentMethodEditRequest =
  components['schemas']['PaymentMethodEditRequest']
export type PaymentMethodListResponse = components['schemas']['RsData']
export type PaymentMethodDetailResponse = components['schemas']['RsData']

// 결제 관련 타입
export type PaymentRequest = components['schemas']['PaymentRequest']
export type PaymentResponse = components['schemas']['RsData']
export type MyPaymentsResponse = components['schemas']['RsData']
export type MyPaymentDetailResponse = components['schemas']['RsData']

// 토스 빌링키 관련 타입
export type TossIssueBillingKeyRequest =
  components['schemas']['TossIssueBillingKeyRequest']
export type TossIssueBillingKeyResponse = components['schemas']['RsData']

// 지갑 관련 타입 (Swagger 스펙 기반)
export type CashResponse = components['schemas']['RsData']
export type CashTransactionsResponse = components['schemas']['RsData']
export type CashTransactionDetailResponse = components['schemas']['RsData']

// 게시판 관련 타입
export type BoardWriteRequest = components['schemas']['BoardWriteRequest']
export type BoardWriteResponse =
  components['schemas']['RsDataBoardWriteResponse']

// 리뷰 관련 타입
export type ReviewWriteRequest = components['schemas']['ReviewRequest']
export type ReviewWriteResponse = components['schemas']['RsDataReviewResponse']
export type ReviewEditResponse = components['schemas']['RsDataReviewResponse']
export type ReviewResponse = components['schemas']['RsDataReviewResponse']

// 리뷰 API 타입들
export type ReviewCreateRequest = {
  productId: number
  comment: string
  isSatisfied: boolean
}

export type ReviewDetailResponse = {
  id: number
  productId: number
  comment: string
  isSatisfied: boolean
  createdAt: string
  member: {
    id: number
    nickname: string
  }
}

export type ReviewUpdateRequest = {
  comment: string
  isSatisfied: boolean
}

// 상품 목록 조회 파라미터
export interface ProductListParams {
  page?: number
  size?: number
  keyword?: string
  category?: number[]
  location?: string[]
  isDelivery?: boolean
  status?: 'BEFORE_START' | 'BIDDING' | 'SUCCESSFUL' | 'FAILED'
  sort?: 'LATEST' | 'PRICE_HIGH' | 'PRICE_LOW' | 'ENDING_SOON' | 'POPULAR'
}

// 내 상품 조회 파라미터
export interface MyProductsParams {
  page?: number
  size?: number
  status?: 'BEFORE_START' | 'SELLING' | 'SOLD' | 'FAILED'
  sort?: 'LATEST' | 'PRICE_HIGH' | 'PRICE_LOW' | 'ENDING_SOON' | 'POPULAR'
}

// 알림 조회 파라미터
export interface NotificationParams {
  page?: number
  size?: number
  isRead?: boolean
}

// 결제 내역 조회 파라미터
export interface PaymentHistoryParams {
  page?: number
  size?: number
}

// 지갑 거래 내역 조회 파라미터
export interface CashTransactionParams {
  page?: number
  size?: number
}
