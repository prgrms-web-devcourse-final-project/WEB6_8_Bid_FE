'use client'

import { useWebSocket, WebSocketMessage } from '@/contexts/WebSocketContext'
import { useEffect, useRef, useState } from 'react'

// 알림 타입 정의
export interface Notification {
  id: string
  type:
    | 'BID_SUCCESS'
    | 'BID_FAILED'
    | 'AUCTION_WON'
    | 'AUCTION_LOST'
    | 'AUCTION_ENDING'
    | 'PAYMENT_REMINDER'
    | 'SYSTEM'
  title: string
  message: string
  productId?: number
  productTitle?: string
  timestamp: string
  isRead: boolean
}

// useWebSocketNotifications 훅의 반환 타입
export interface UseWebSocketNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  isSubscribed: boolean
  subscribe: () => void
  unsubscribe: () => void
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
  error: string | null
}

/**
 * 개인 알림을 구독하는 훅
 * @param autoSubscribe 자동 구독 여부 (기본값: true)
 * @param maxNotifications 최대 알림 개수 (기본값: 50)
 */
export function useWebSocketNotifications(
  autoSubscribe: boolean = true,
  maxNotifications: number = 50,
): UseWebSocketNotificationsReturn {
  const { subscribeToNotifications, unsubscribe, isConnected } = useWebSocket()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const subscriptionIdRef = useRef<string | null>(null)

  // 구독되지 않은 알림 개수 계산
  const unreadCount = notifications.filter((n) => !n.isRead).length

  // 구독 함수
  const subscribe = () => {
    if (!isConnected) {
      setError('WebSocket이 연결되지 않았습니다')
      return
    }

    // 이미 구독 중이면 중복 구독 방지
    if (isSubscribed) {
      console.log('🔔 이미 알림 구독 중')
      return
    }

    // 기존 구독 해제
    if (subscriptionIdRef.current) {
      unsubscribe(subscriptionIdRef.current)
    }

    try {
      const subscriptionId = subscribeToNotifications(
        (message: WebSocketMessage) => {
          console.log('🔔 알림 수신:', message)

          const notification: Notification = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: getNotificationType(message.type, message.content),
            title: getNotificationTitle(message.type, message.content),
            message: message.content,
            productId: message.data?.productId,
            productTitle: message.data?.productTitle,
            timestamp: message.timestamp || new Date().toISOString(),
            isRead: false,
          }

          setNotifications((prev) => {
            const newNotifications = [notification, ...prev]
            // 최대 개수 제한
            return newNotifications.slice(0, maxNotifications)
          })

          setError(null)

          // 브라우저 알림 표시 (사용자 권한이 있는 경우)
          showBrowserNotification(notification)
        },
      )

      subscriptionIdRef.current = subscriptionId
      setIsSubscribed(true)
      setError(null)
      console.log('🔔 알림 구독 성공:', subscriptionId)
    } catch (error) {
      console.error('🔔 알림 구독 실패:', error)
      setError('구독에 실패했습니다')
      setIsSubscribed(false)
    }
  }

  // 구독 해제 함수
  const unsubscribeFromNotifications = () => {
    if (subscriptionIdRef.current) {
      unsubscribe(subscriptionIdRef.current)
      subscriptionIdRef.current = null
      setIsSubscribed(false)
      console.log('🔔 알림 구독 해제')
    }
  }

  // 알림 타입 결정
  const getNotificationType = (
    messageType: string,
    content: string,
  ): Notification['type'] => {
    if (messageType === 'BID') {
      if (content.includes('성공') || content.includes('등록'))
        return 'BID_SUCCESS'
      if (content.includes('실패') || content.includes('오류'))
        return 'BID_FAILED'
    }

    if (content.includes('낙찰') || content.includes('당첨'))
      return 'AUCTION_WON'
    if (content.includes('유찰') || content.includes('낙찰 실패'))
      return 'AUCTION_LOST'
    if (content.includes('종료 임박') || content.includes('10분 후'))
      return 'AUCTION_ENDING'
    if (content.includes('결제') || content.includes('입금'))
      return 'PAYMENT_REMINDER'

    return 'SYSTEM'
  }

  // 알림 제목 생성
  const getNotificationTitle = (
    messageType: string,
    content: string,
  ): string => {
    switch (messageType) {
      case 'BID':
        return '입찰 알림'
      case 'AUCTION_TIMER':
        return '경매 알림'
      case 'NOTIFICATION':
        return '알림'
      case 'SYSTEM':
        return '시스템 알림'
      default:
        return '알림'
    }
  }

  // 브라우저 알림 표시
  const showBrowserNotification = (notification: Notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.png',
        tag: notification.id,
      })
    }
  }

  // 알림 읽음 처리
  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification,
      ),
    )
  }

  // 모든 알림 읽음 처리
  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true })),
    )
  }

  // 알림 삭제
  const clearNotifications = () => {
    setNotifications([])
  }

  // 브라우저 알림 권한 요청
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // 자동 구독 (단일 useEffect로 통합)
  useEffect(() => {
    if (autoSubscribe && isConnected && !isSubscribed) {
      subscribe()
    }

    return () => {
      unsubscribeFromNotifications()
    }
  }, [autoSubscribe, isConnected]) // isSubscribed 의존성 제거

  // 로그인 상태 변경 시 구독 해제
  useEffect(() => {
    if (!autoSubscribe) {
      unsubscribeFromNotifications()
    }
  }, [autoSubscribe])

  return {
    notifications,
    unreadCount,
    isSubscribed,
    subscribe,
    unsubscribe: unsubscribeFromNotifications,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    error,
  }
}
