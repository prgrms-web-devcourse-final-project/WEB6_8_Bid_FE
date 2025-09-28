'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Notification } from '@/types'
import { Bell, Check, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface NotificationsClientProps {
  initialNotifications: Notification[]
}

// 임시 알림 데이터
const mockNotifications = [
  {
    id: '1',
    type: 'bid',
    title: '입찰 성공 알림',
    message: '갤럭시 S23 Ultra 경매에서 낙찰되었습니다!',
    isRead: false,
    createdAt: '2024-01-15T14:30:00Z',
    relatedId: 'product1',
  },
  {
    id: '2',
    type: 'payment',
    title: '결제 완료',
    message: 'iPad Pro 11인치 3세대 결제가 완료되었습니다.',
    isRead: false,
    createdAt: '2024-01-15T12:15:00Z',
    relatedId: 'payment1',
  },
  {
    id: '3',
    type: 'system',
    title: '시스템 점검 안내',
    message: '1월 20일 새벽 2시~4시 시스템 점검이 있을 예정입니다.',
    isRead: true,
    createdAt: '2024-01-14T09:00:00Z',
    relatedId: null,
  },
  {
    id: '4',
    type: 'bid',
    title: '입찰 실패 알림',
    message: 'MacBook Air M2 경매에서 입찰에 실패했습니다.',
    isRead: true,
    createdAt: '2024-01-14T18:00:00Z',
    relatedId: 'product2',
  },
  {
    id: '5',
    type: 'event',
    title: '신규 이벤트',
    message: '신규 회원 대상 경매 수수료 50% 할인 이벤트가 시작되었습니다!',
    isRead: true,
    createdAt: '2024-01-13T10:00:00Z',
    relatedId: 'event1',
  },
]

const notificationTypes = [
  { id: 'all', label: '전체' },
  { id: 'bid', label: '입찰' },
  { id: 'payment', label: '결제' },
  { id: 'system', label: '시스템' },
  { id: 'event', label: '이벤트' },
]

export function NotificationsClient({
  initialNotifications,
}: NotificationsClientProps) {
  const [selectedType, setSelectedType] = useState('all')
  const [notifications, setNotifications] = useState(mockNotifications)

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'bid':
        return { label: '입찰', variant: 'primary' as const }
      case 'payment':
        return { label: '결제', variant: 'success' as const }
      case 'system':
        return { label: '시스템', variant: 'warning' as const }
      case 'event':
        return { label: '이벤트', variant: 'secondary' as const }
      default:
        return { label: '알림', variant: 'neutral' as const }
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    if (selectedType === 'all') return true
    return notification.type === selectedType
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification,
      ),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true })),
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      {/* 알림 요약 */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="text-primary-500 h-5 w-5" />
            <h2 className="text-lg font-semibold text-neutral-900">
              알림 ({notifications.length})
            </h2>
            {unreadCount > 0 && (
              <Badge variant="error">{unreadCount}개 읽지 않음</Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button size="sm" variant="outline" onClick={markAllAsRead}>
              <Check className="mr-2 h-4 w-4" />
              모두 읽음
            </Button>
          )}
        </div>
      </div>

      {/* 알림 타입 필터 */}
      <div className="mb-6">
        <div className="flex space-x-1 rounded-lg bg-neutral-100 p-1">
          {notificationTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                selectedType === type.id
                  ? 'text-primary-600 bg-white shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* 알림 목록 */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card variant="outlined">
            <CardContent className="py-12 text-center">
              <div className="mb-4">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                  <Bell className="h-8 w-8 text-neutral-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-neutral-900">
                  알림이 없습니다
                </h3>
                <p className="text-neutral-600">
                  새로운 알림이 오면 여기에 표시됩니다
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => {
            const typeBadge = getTypeBadge(notification.type)

            return (
              <Card
                key={notification.id}
                variant="outlined"
                className={`transition-colors ${
                  !notification.isRead
                    ? 'border-primary-200 bg-primary-50'
                    : 'bg-white'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    {/* 알림 아이콘 */}
                    <div className="flex-shrink-0">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          !notification.isRead
                            ? 'bg-primary-100 text-primary-600'
                            : 'bg-neutral-100 text-neutral-500'
                        }`}
                      >
                        <Bell className="h-4 w-4" />
                      </div>
                    </div>

                    {/* 알림 내용 */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center space-x-2">
                        <Badge variant={typeBadge.variant}>
                          {typeBadge.label}
                        </Badge>
                        {!notification.isRead && (
                          <div className="bg-primary-500 h-2 w-2 rounded-full"></div>
                        )}
                      </div>

                      <h3 className="mb-1 text-sm font-semibold text-neutral-900">
                        {notification.title}
                      </h3>

                      <p className="mb-2 text-sm text-neutral-600">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral-500">
                          {formatDateTime(notification.createdAt)}
                        </span>

                        <div className="flex items-center space-x-2">
                          {!notification.isRead && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
