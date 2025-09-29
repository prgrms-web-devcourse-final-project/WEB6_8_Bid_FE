import { LoginPrompt } from '@/components/auth/LoginPrompt'
import { NotificationsClient } from '@/components/features/notifications/NotificationsClient'
import { HomeLayout } from '@/components/layout/HomeLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { notificationApi } from '@/lib/api'

export default async function NotificationsPage() {
  try {
    // 알림 데이터 가져오기
    const { data: notifications, success } =
      await notificationApi.getNotifications()

    if (!success || !notifications) {
      return (
        <HomeLayout isLoggedIn={true}>
          <PageHeader
            title="알림"
            description="새로운 소식과 업데이트를 확인하세요"
            showBackButton
          />
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="mb-4 text-2xl font-bold text-neutral-900">
                데이터를 불러올 수 없습니다
              </h1>
              <p className="text-neutral-600">잠시 후 다시 시도해주세요.</p>
            </div>
          </div>
        </HomeLayout>
      )
    }

    return (
      <HomeLayout isLoggedIn={true}>
        <PageHeader
          title="알림"
          description="새로운 소식과 업데이트를 확인하세요"
          showBackButton
        />
        <NotificationsClient
          initialNotifications={(notifications as any) || []}
        />
      </HomeLayout>
    )
  } catch (error: any) {
    // 403 에러 시 로그인 유도 UI 표시
    if (error?.response?.status === 403) {
      return (
        <HomeLayout>
          <PageHeader
            title="알림"
            description="새로운 소식과 업데이트를 확인하세요"
            showBackButton
          />
          <LoginPrompt
            title="알림"
            description="알림을 확인하려면 로그인해주세요."
          />
        </HomeLayout>
      )
    }

    // 기타 에러 시 빈 데이터로 렌더링
    return (
      <HomeLayout isLoggedIn={true}>
        <PageHeader
          title="알림"
          description="새로운 소식과 업데이트를 확인하세요"
          showBackButton
        />
        <NotificationsClient initialNotifications={[]} />
      </HomeLayout>
    )
  }
}
