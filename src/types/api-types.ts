// API 명세에 맞는 타입 정의
import type { components } from './swagger-generated'

// API 응답 타입
export type ApiResponse<T> = {
  resultCode: string
  msg: string
  data: T
  success?: boolean // 호환성을 위한 추가
}

// 인증 관련 타입
export type LoginRequest = components['schemas']['LoginRequestDto']
export type LoginResponse = components['schemas']['LoginResponseDto']
export type SignupRequest = components['schemas']['MemberSignUpRequestDto']
export type SignupResponse = components['schemas']['MemberSignUpResponseDto']
export type LogoutResponse = components['schemas']['LogoutResponseDto']

// 사용자 관련 타입
export type UserInfo = components['schemas']['MemberMyInfoResponseDto']['data']
export type UserInfoUpdate = components['schemas']['MemberModifyRequestDto']
export type UserInfoResponse = components['schemas']['MemberMyInfoResponseDto']

// 상품 관련 타입
export type ProductCreateRequest = components['schemas']['ProductCreateRequest']
export type ProductModifyRequest = components['schemas']['ProductModifyRequest']

// 입찰 관련 타입
export type BidRequest = components['schemas']['BidRequestDto']

// 결제 관련 타입
export type PaymentMethodResponse =
  components['schemas']['PaymentMethodResponse']
export type PaymentMethodCreateRequest =
  components['schemas']['PaymentMethodCreateRequest']
export type PaymentMethodEditRequest =
  components['schemas']['PaymentMethodEditRequest']
export type PaymentResponse = components['schemas']['PaymentResponse']
export type MyPaymentResponse = components['schemas']['MyPaymentResponse']
export type MyPaymentsResponse = components['schemas']['MyPaymentsResponse']

// 지갑 관련 타입
export type CashResponse = components['schemas']['CashResponse']['data']
export type CashTransactionResponse =
  components['schemas']['CashTransactionResponse']['data']
export type CashTransactionsResponse =
  components['schemas']['CashTransactionsResponse']['data']

// 게시판 관련 타입
export type BoardWriteRequest = components['schemas']['BoardWriteRequest']
export type BoardWriteResponse = components['schemas']['BoardWriteResponse']

// 알림 관련 타입 (API 명세에 명시적 타입이 없으므로 추정)
export interface Notification {
  id: number
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
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
  status?: 'SELLING' | 'SOLD' | 'FAILED'
  sort?: 'LATEST' | 'PRICE_HIGH' | 'PRICE_LOW' | 'ENDING_SOON' | 'POPULAR'
}

// 알림 조회 파라미터
export interface NotificationParams {
  page?: number
  size?: number
  isRead?: boolean
}

// 입찰 내역 조회 파라미터
export interface MyBidsParams {
  page?: number
  size?: number
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
