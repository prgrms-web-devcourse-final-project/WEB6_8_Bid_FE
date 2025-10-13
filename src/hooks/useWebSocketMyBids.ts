'use client'

import { useWebSocket, WebSocketMessage } from '@/contexts/WebSocketContext'
import { useEffect, useRef, useState } from 'react'

// 내가 입찰한 상품 정보 타입
export interface MyBidUpdate {
  productId: number
  productTitle: string
  currentPrice: number
  bidCount: number
  myBidAmount: number
  isOutbid: boolean
  timeLeft: string
  status:
    | 'BEFORE_START'
    | 'BIDDING'
    | 'ENDING_SOON'
    | 'ENDED'
    | 'SUCCESSFUL'
    | 'FAILED'
  lastBidder?: string
  timestamp: string
}

// useWebSocketMyBids 훅의 반환 타입
export interface UseWebSocketMyBidsReturn {
  myBidUpdates: MyBidUpdate[]
  isSubscribed: boolean
  subscribe: (userId: number) => void
  unsubscribe: () => void
  error: string | null
}

/**
 * 내가 입찰한 상품들의 실시간 모니터링 훅
 * @param userId 사용자 ID
 * @param autoSubscribe 자동 구독 여부 (기본값: true)
 */
export function useWebSocketMyBids(
  userId: number | null,
  autoSubscribe: boolean = true,
): UseWebSocketMyBidsReturn {
  const { subscribe, unsubscribe, isConnected } = useWebSocket()
  const [myBidUpdates, setMyBidUpdates] = useState<MyBidUpdate[]>([])
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const subscriptionIdRef = useRef<string | null>(null)

  // 구독 함수
  const subscribeToMyBids = (targetUserId: number) => {
    if (!targetUserId) {
      setError('사용자 ID가 필요합니다')
      return
    }

    if (!isConnected) {
      setError('WebSocket이 연결되지 않았습니다')
      return
    }

    // 이미 구독 중이면 중복 구독 방지
    if (isSubscribed) {
      console.log('🎯 이미 내 입찰 구독 중')
      return
    }

    // 기존 구독 해제
    if (subscriptionIdRef.current) {
      unsubscribe(subscriptionIdRef.current)
    }

    try {
      const destination = `/user/queue/my-bids/${targetUserId}`
      const subscriptionId = subscribe(
        destination,
        (message: WebSocketMessage) => {
          console.log('🎯 내 입찰 업데이트 수신:', message)

          switch (message.type) {
            case 'BID_UPDATE':
              // 내가 입찰한 상품에 새로운 입찰 발생
              if (message.data) {
                const bidData: MyBidUpdate = {
                  productId: message.data.productId,
                  productTitle: message.data.productTitle || '상품',
                  currentPrice: message.data.currentPrice || message.data.price,
                  bidCount: message.data.bidCount || 0,
                  myBidAmount: message.data.myBidAmount || 0,
                  isOutbid: message.data.isOutbid || false,
                  timeLeft: message.data.timeLeft || '',
                  status: 'BIDDING',
                  lastBidder: message.data.lastBidder || message.data.bidder,
                  timestamp: message.timestamp || new Date().toISOString(),
                }

                setMyBidUpdates((prev) => {
                  const existingIndex = prev.findIndex(
                    (item) => item.productId === bidData.productId,
                  )
                  if (existingIndex >= 0) {
                    // 기존 상품 업데이트
                    const updated = [...prev]
                    updated[existingIndex] = bidData
                    return updated
                  } else {
                    // 새 상품 추가
                    return [bidData, ...prev]
                  }
                })

                setError(null)

                // 입찰가가 올라갔을 때 알림 표시
                if (bidData.isOutbid) {
                  showBidNotification(bidData)
                }
              }
              break

            case 'AUCTION_END':
              // 경매 종료 알림
              if (message.data) {
                const endData: MyBidUpdate = {
                  productId: message.data.productId,
                  productTitle: message.data.productTitle || '상품',
                  currentPrice: message.data.finalPrice || 0,
                  bidCount: message.data.bidCount || 0,
                  myBidAmount: message.data.myBidAmount || 0,
                  isOutbid: false,
                  timeLeft: '0분',
                  status: message.data.isWon ? 'SUCCESSFUL' : 'FAILED',
                  timestamp: message.timestamp || new Date().toISOString(),
                }

                setMyBidUpdates((prev) => {
                  const existingIndex = prev.findIndex(
                    (item) => item.productId === endData.productId,
                  )
                  if (existingIndex >= 0) {
                    const updated = [...prev]
                    updated[existingIndex] = {
                      ...updated[existingIndex],
                      ...endData,
                    }
                    return updated
                  } else {
                    return [endData, ...prev]
                  }
                })

                // 경매 종료 알림 표시
                showAuctionEndNotification(endData)
              }
              break

            default:
              console.log('🎯 알 수 없는 메시지 타입:', message.type)
          }
        },
      )

      subscriptionIdRef.current = subscriptionId
      setIsSubscribed(true)
      setError(null)
      console.log('🎯 내 입찰 구독 성공:', targetUserId, subscriptionId)
    } catch (error) {
      console.error('🎯 내 입찰 구독 실패:', error)
      setError('구독에 실패했습니다')
      setIsSubscribed(false)
    }
  }

  // 구독 해제 함수
  const unsubscribeFromMyBids = () => {
    if (subscriptionIdRef.current) {
      unsubscribe(subscriptionIdRef.current)
      subscriptionIdRef.current = null
      setIsSubscribed(false)
      setMyBidUpdates([])
      console.log('🎯 내 입찰 구독 해제')
    }
  }

  // 입찰가 상승 알림 표시
  const showBidNotification = (bidData: MyBidUpdate) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`⚠️ 입찰가 상승 - ${bidData.productTitle}`, {
        body: `현재가: ${bidData.currentPrice.toLocaleString()}원\n내 입찰가보다 높아졌습니다!`,
        icon: '/favicon.ico',
        tag: `bid-${bidData.productId}`,
        requireInteraction: true, // 사용자가 직접 닫을 때까지 유지
      })
    }
  }

  // 경매 종료 알림 표시
  const showAuctionEndNotification = (bidData: MyBidUpdate) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const isWon = bidData.status === 'SUCCESSFUL'
      new Notification(
        isWon
          ? `🎉 낙찰 성공! - ${bidData.productTitle}`
          : `⏰ 경매 종료 - ${bidData.productTitle}`,
        {
          body: isWon
            ? `축하합니다! ${bidData.currentPrice.toLocaleString()}원에 낙찰되었습니다.`
            : `경매가 종료되었습니다.\n최종가: ${bidData.currentPrice.toLocaleString()}원`,
          icon: '/favicon.ico',
          tag: `auction-end-${bidData.productId}`,
          requireInteraction: true, // 사용자가 직접 닫을 때까지 유지
        },
      )
    }
  }

  // 자동 구독
  useEffect(() => {
    if (autoSubscribe && userId && isConnected && !isSubscribed) {
      subscribeToMyBids(userId)
    }

    return () => {
      unsubscribeFromMyBids()
    }
  }, [userId, autoSubscribe, isConnected])

  // 로그인 상태 변경 시 구독 해제
  useEffect(() => {
    if (!autoSubscribe || !userId) {
      unsubscribeFromMyBids()
    }
  }, [autoSubscribe, userId])

  return {
    myBidUpdates,
    isSubscribed,
    subscribe: subscribeToMyBids,
    unsubscribe: unsubscribeFromMyBids,
    error,
  }
}
