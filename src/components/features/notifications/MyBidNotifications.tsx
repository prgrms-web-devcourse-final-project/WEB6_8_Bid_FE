'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { MyBidUpdate, useWebSocketMyBids } from '@/hooks/useWebSocketMyBids'
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  XCircle,
  Zap,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function MyBidNotifications() {
  const { user } = useAuth()
  const router = useRouter()
  const { myBidUpdates, isSubscribed } = useWebSocketMyBids(user?.id || null)
  const [dismissedNotifications, setDismissedNotifications] = useState<
    Set<number>
  >(new Set())
  const [showNotifications, setShowNotifications] = useState(true)

  // 브라우저 알림 권한 요청
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // 알림 해제 함수
  const dismissNotification = (productId: number) => {
    setDismissedNotifications((prev) => new Set([...prev, productId]))
  }

  // 상품 상세 페이지로 이동
  const goToProduct = (productId: number) => {
    router.push(`/products/${productId}`)
  }

  // 가격 포맷팅
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원'
  }

  // 상태별 아이콘과 색상
  const getStatusInfo = (status: MyBidUpdate['status'], isOutbid: boolean) => {
    if (isOutbid) {
      return {
        icon: <AlertTriangle className="h-4 w-4" />,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        text: '입찰가 상승',
      }
    }

    switch (status) {
      case 'SUCCESSFUL':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          text: '낙찰 성공',
        }
      case 'FAILED':
        return {
          icon: <XCircle className="h-4 w-4" />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          text: '경매 종료',
        }
      case 'ENDING_SOON':
        return {
          icon: <Clock className="h-4 w-4" />,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          text: '종료 임박',
        }
      default:
        return {
          icon: <TrendingUp className="h-4 w-4" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          text: '입찰 업데이트',
        }
    }
  }

  // 표시할 알림들 필터링 (해제되지 않은 것들만)
  const visibleNotifications = myBidUpdates.filter(
    (update) => !dismissedNotifications.has(update.productId),
  )

  // 알림이 없거나 숨김 상태면 표시하지 않음
  if (!isSubscribed || visibleNotifications.length === 0) {
    return null
  }

  // 알림이 숨겨진 상태면 플로팅 버튼만 표시
  if (!showNotifications) {
    return (
      <div className="fixed right-4 bottom-4 z-50">
        <Button
          onClick={() => setShowNotifications(true)}
          className="rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600"
          size="sm"
        >
          <Zap className="mr-2 h-4 w-4" />
          입찰 알림 ({visibleNotifications.length})
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 max-w-sm space-y-3">
      {/* 실시간 연결 상태 */}
      <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
        <div className="flex items-center space-x-2">
          <Zap className="h-4 w-4 animate-pulse" />
          <span>내 입찰 실시간 모니터링 중</span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowNotifications(false)}
          className="h-auto p-1 text-green-600 hover:text-green-700"
        >
          ✕
        </Button>
      </div>

      {/* 알림 목록 */}
      {visibleNotifications.map((update) => {
        const statusInfo = getStatusInfo(update.status, update.isOutbid)

        return (
          <Card key={update.productId} className="animate-slide-in shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* 상품 제목 */}
                  <h4 className="mb-1 line-clamp-2 text-sm font-semibold text-gray-900">
                    {update.productTitle}
                  </h4>

                  {/* 상태 정보 */}
                  <div
                    className={`mb-2 flex items-center space-x-2 ${statusInfo.color}`}
                  >
                    {statusInfo.icon}
                    <span className="text-xs font-medium">
                      {statusInfo.text}
                    </span>
                  </div>

                  {/* 가격 정보 */}
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>현재가:</span>
                      <span className="font-semibold">
                        {formatPrice(update.currentPrice)}
                      </span>
                    </div>
                    {update.myBidAmount > 0 && (
                      <div className="flex justify-between">
                        <span>내 입찰가:</span>
                        <span
                          className={
                            update.isOutbid ? 'text-red-600' : 'text-green-600'
                          }
                        >
                          {formatPrice(update.myBidAmount)}
                        </span>
                      </div>
                    )}
                    {update.timeLeft && (
                      <div className="flex justify-between">
                        <span>남은 시간:</span>
                        <span className="text-orange-600">
                          {update.timeLeft}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 액션 버튼들 */}
                <div className="ml-2 flex flex-col space-y-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => goToProduct(update.productId)}
                    className="h-auto px-2 py-1 text-xs"
                  >
                    보기
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => dismissNotification(update.productId)}
                    className="h-auto px-2 py-1 text-xs text-gray-500"
                  >
                    닫기
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
