import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 상태값을 한글로 변환하는 유틸리티 함수들

/**
 * 레슨 상태를 한글로 변환
 */
export function getLessonStatusText(status: string): string {
  switch (status) {
    case 'RECRUITING':
      return '모집중'
    case 'RECRUITMENT_COMPLETED':
      return '모집완료'
    case 'IN_PROGRESS':
      return '진행중'
    case 'COMPLETED':
      return '완료'
    case 'CANCELLED':
      return '취소'
    default:
      return status
  }
}

export const categories: { label: string; value: string }[] = [
  { label: '체육관', value: 'GYM' },
  { label: '필라테스', value: 'PILATES' },
  { label: '요가', value: 'YOGA' },
  { label: '러닝', value: 'RUNNING' },
  { label: '자전거', value: 'CYCLING' },
  { label: '하이킹', value: 'HIKING' },
  { label: '클라이밍', value: 'CLIMBING' },
  { label: '수영', value: 'SWIMMING' },
  { label: '테니스', value: 'TENNIS' },
  { label: '배드민턴', value: 'BADMINTON' },
  { label: '스쿼시', value: 'SQUASH' },
  { label: '축구', value: 'FOOTBALL' },
  { label: '농구', value: 'BASKETBALL' },
  { label: '야구', value: 'BASEBALL' },
  { label: '골프', value: 'GOLF' },
  { label: '댄스', value: 'DANCE' },
  { label: '무술', value: 'MARTIAL_ARTS' },
  { label: '크로스핏', value: 'CROSS_FIT' },
  { label: '보드스포츠', value: 'BOARD_SPORTS' },
  { label: 'e스포츠', value: 'ESPORTS' },
  { label: '탁구', value: 'TABLE_TENNIS' },
  { label: '배구', value: 'VOLLEYBALL' },
  { label: '복싱', value: 'BOXING' },
  { label: '킥복싱', value: 'KICKBOXING' },
  { label: '검도', value: 'FENCING' },
  { label: '인라인 스케이트', value: 'INLINE_SKATING' },
  { label: '스케이트', value: 'SKATING' },
  { label: '서핑', value: 'SURFING' },
  { label: '말 타기', value: 'HORSE_RIDING' },
  { label: '스키', value: 'SKIING' },
  { label: '스노우보드', value: 'SNOWBOARDING' },
  { label: '트라이아트론', value: 'TRIATHLON' },
  { label: '스포츠 워치 파티', value: 'SPORTS_WATCHING_PARTY' },
  { label: '기타', value: 'ETC' },
] as const

export type Category = (typeof categories)[number]['value']

/**
 * 카테고리를 한글로 변환
 */
export function getCategoryText(
  category: Category,
): (typeof categories)[number]['label'] {
  switch (category) {
    case 'GYM':
      return '체육관'
    case 'PILATES':
      return '필라테스'
    case 'YOGA':
      return '요가'
    case 'RUNNING':
      return '러닝'
    case 'CYCLING':
      return '자전거'
    case 'HIKING':
      return '하이킹'
    case 'CLIMBING':
      return '클라이밍'
    case 'SWIMMING':
      return '수영'
    case 'TENNIS':
      return '테니스'
    case 'BADMINTON':
      return '배드민턴'
    case 'SQUASH':
      return '스쿼시'
    case 'FOOTBALL':
      return '축구'
    case 'BASKETBALL':
      return '농구'
    case 'BASEBALL':
      return '야구'
    case 'GOLF':
      return '골프'
    case 'DANCE':
      return '댄스'
    case 'MARTIAL_ARTS':
      return '무술'
    case 'CROSS_FIT':
      return '크로스핏'
    case 'BOARD_SPORTS':
      return '보드스포츠'
    case 'ESPORTS':
      return 'e스포츠'
    case 'TABLE_TENNIS':
      return '탁구'
    case 'VOLLEYBALL':
      return '배구'
    case 'BOXING':
      return '복싱'
    case 'KICKBOXING':
      return '킥복싱'
    case 'FENCING':
      return '검도'
    case 'INLINE_SKATING':
      return '인라인 스케이트'
    case 'SKATING':
      return '스케이트'
    case 'SURFING':
      return '서핑'
    case 'HORSE_RIDING':
      return '말 타기'
    case 'SKIING':
      return '스키'
    case 'SNOWBOARDING':
      return '스노우보드'
    case 'TRIATHLON':
      return '트라이아트론'
    case 'SPORTS_WATCHING_PARTY':
      return '스포츠 워치 파티'
    default:
      return category
  }
}

/**
 * 레슨 신청 상태를 한글로 변환
 */
export function getApplicationStatusText(status: string): string {
  switch (status) {
    case 'PENDING':
      return '승인대기'
    case 'APPROVED':
      return '승인완료'
    case 'REJECTED':
      return '거절됨'
    case 'CANCELLED':
      return '취소됨'
    default:
      return status
  }
}

/**
 * 쿠폰 상태를 한글로 변환
 */
export function getCouponStatusText(status: string): string {
  switch (status) {
    case 'ACTIVE':
      return '사용가능'
    case 'INACTIVE':
      return '사용완료'
    default:
      return status
  }
}

/**
 * 결제 상태를 한글로 변환
 */
export function getPaymentStatusText(status: string): string {
  switch (status) {
    case 'COMPLETED':
      return '결제완료'
    case 'PENDING':
      return '결제대기'
    case 'FAILED':
      return '결제실패'
    default:
      return status
  }
}

/**
 * 쿠폰 소유 상태를 한글로 변환
 */
export function getOwnedStatusText(status: string): string {
  switch (status) {
    case 'OWNED':
      return '보유중'
    case 'NOT_OWNED':
      return '미보유'
    default:
      return status
  }
}

/**
 * 날짜를 한국어 형식으로 포맷팅
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * 날짜와 시간을 한국어 형식으로 포맷팅
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * 금액을 한국어 형식으로 포맷팅
 */
export function formatPrice(price: number): string {
  return `${price.toLocaleString()}원`
}

/**
 * 할인율을 한국어 형식으로 포맷팅
 */
export function formatDiscount(discount: number): string {
  return `${discount}% 할인`
}
