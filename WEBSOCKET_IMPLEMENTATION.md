# 🔌 WebSocket 실시간 기능 구현 가이드

## 📋 구현 완료 사항

### ✅ 1. WebSocket 클라이언트 라이브러리 설치

- `sockjs-client`: WebSocket 연결을 위한 클라이언트 라이브러리
- `stompjs`: STOMP 프로토콜 지원
- TypeScript 타입 정의 포함

### ✅ 2. WebSocket Context 생성

**파일**: `src/contexts/WebSocketContext.tsx`

**주요 기능**:

- WebSocket 연결 관리 (자동 연결/재연결)
- 구독/구독 해제 관리
- 메시지 전송 기능
- 연결 상태 표시 컴포넌트

**사용법**:

```tsx
import { useWebSocket } from '@/contexts/WebSocketContext'

const { isConnected, subscribe, unsubscribe, sendMessage } = useWebSocket()
```

### ✅ 3. 실시간 입찰 정보 훅

**파일**: `src/hooks/useWebSocketBid.ts`

**주요 기능**:

- 상품별 실시간 입찰 정보 구독
- 경매 상태 업데이트 (시작, 종료 임박, 종료 등)
- 자동 구독/구독 해제

**사용법**:

```tsx
import { useWebSocketBid } from '@/hooks/useWebSocketBid'

const { bidUpdate, auctionStatus, isSubscribed } = useWebSocketBid(productId)
```

### ✅ 4. 개인 알림 시스템 훅

**파일**: `src/hooks/useWebSocketNotifications.ts`

**주요 기능**:

- 개인 알림 구독
- 알림 읽음/삭제 관리
- 브라우저 알림 표시

**사용법**:

```tsx
import { useWebSocketNotifications } from '@/hooks/useWebSocketNotifications'

const { notifications, unreadCount, markAsRead } = useWebSocketNotifications()
```

### ✅ 5. 상품 상세 페이지 실시간 연동

**파일**: `src/components/features/products/ProductDetailClient.tsx`

**구현된 기능**:

- 실시간 현재가 업데이트
- 실시간 입찰 수 업데이트
- 실시간 연결 상태 표시
- 최근 입찰자 정보 표시

### ✅ 6. 알림 센터 컴포넌트

**파일**: `src/components/features/notifications/NotificationCenter.tsx`

**주요 기능**:

- 실시간 알림 목록 표시
- 알림 읽음/삭제 관리
- 필터링 (전체/읽지 않음)
- 브라우저 알림 연동

### ✅ 7. Header에 알림 기능 통합

**파일**: `src/components/layout/Header.tsx`

**구현된 기능**:

- 실시간 알림 개수 표시
- 알림 센터 모달 열기
- WebSocket과 API 알림 통합

## 🚀 사용 방법

### 1. 기본 설정

WebSocket Provider가 이미 `src/app/layout.tsx`에 추가되어 있어 별도 설정이 필요하지 않습니다.

### 2. 상품 상세 페이지에서 실시간 입찰 정보 사용

```tsx
import { useWebSocketBid } from '@/hooks/useWebSocketBid'

function ProductDetail() {
  const { bidUpdate, auctionStatus, isSubscribed } = useWebSocketBid(productId)

  // bidUpdate가 있으면 실시간으로 UI 업데이트
  // auctionStatus로 경매 상태 관리
}
```

### 3. 개인 알림 사용

```tsx
import { useWebSocketNotifications } from '@/hooks/useWebSocketNotifications'

function MyComponent() {
  const { notifications, unreadCount } = useWebSocketNotifications()

  // notifications 배열에서 알림 목록 표시
  // unreadCount로 읽지 않은 알림 개수 표시
}
```

### 4. WebSocket 연결 상태 확인

```tsx
import { useWebSocket } from '@/contexts/WebSocketContext'

function MyComponent() {
  const { isConnected } = useWebSocket()

  return <div>{isConnected ? '연결됨' : '연결 끊김'}</div>
}
```

## 🔧 백엔드 연동 정보

### WebSocket 엔드포인트

- **연결 URL**: `/ws` (SockJS 지원)
- **구독 경로**: `/topic/bid/{productId}` (입찰 정보)
- **개인 알림**: `/user/queue/notifications`

### 메시지 타입

```typescript
interface WebSocketMessage {
  type: 'CHAT' | 'BID' | 'AUCTION_TIMER' | 'NOTIFICATION' | 'SYSTEM'
  sender?: string
  content: string
  data?: any
  timestamp?: string
}
```

### 주요 기능

1. **실시간 입찰 브로드캐스트**: 새로운 입찰 시 모든 구독자에게 즉시 전송
2. **경매 상태 알림**: 시작, 종료 임박, 종료 등 자동 알림
3. **개인 알림**: 입찰 성공/실패, 경매 결과 등 개인별 알림

## 🎯 주요 특징

### 1. 자동 재연결

- 연결 실패 시 자동으로 재연결 시도
- 최대 5회까지 재시도
- 지수 백오프 방식으로 재시도 간격 증가

### 2. 연결 상태 관리

- 페이지 가시성 변경 시 연결 상태 확인
- 백그라운드에서도 연결 유지
- 연결 상태 시각적 표시

### 3. 성능 최적화

- 구독 관리로 불필요한 메시지 처리 방지
- 메모리 누수 방지를 위한 자동 구독 해제
- 최대 알림 개수 제한

### 4. 사용자 경험

- 실시간 업데이트 시각적 표시
- 브라우저 알림 지원
- 읽지 않은 알림 개수 표시

## 🔍 디버깅

### 콘솔 로그 확인

- `🔌` 접두사: WebSocket 연결 관련
- `🎯` 접두사: 입찰 정보 관련
- `🔔` 접두사: 알림 관련

### 연결 상태 확인

- 우측 하단에 WebSocket 연결 상태 표시
- 상품 상세 페이지에 실시간 연결 상태 표시

## 📱 모바일 지원

- SockJS를 통한 WebSocket 폴백 지원
- 모바일 브라우저에서도 안정적인 연결
- 터치 인터페이스에 최적화된 알림 UI

---

**🎉 WebSocket 실시간 기능이 성공적으로 구현되었습니다!**

이제 사용자들은 실시간으로 입찰 정보를 확인하고, 개인 알림을 받을 수 있습니다.
