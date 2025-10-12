import { LoginPrompt } from '@/components/auth/LoginPrompt'
import { MyInfoClient } from '@/components/features/user/MyInfoClient'
import { HomeLayout } from '@/components/layout/HomeLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { serverApi } from '@/lib/api/server-api-client'
import { cookies } from 'next/headers'

export default async function MyInfoPage() {
  try {
    // 쿠키에서 토큰 가져오기
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')?.value

    if (!accessToken) {
      console.log('❌ 토큰이 없어서 로그인 유도 UI 표시')
      return (
        <HomeLayout>
          <PageHeader
            title="내 정보"
            description="프로필 정보와 활동 내역을 확인하세요"
            showBackButton
          />
          <LoginPrompt
            title="내 정보"
            description="내 정보를 확인하려면 로그인해주세요."
          />
        </HomeLayout>
      )
    }

    // 서버 API로 사용자 정보 가져오기
    console.log('🚀 서버 API 호출 시작: getMyInfo')
    const response = await serverApi.getMyInfo()

    console.log('📊 서버 API 응답:', response)

    if (!response.success || !response.data) {
      console.log('❌ 서버 API 응답에서 데이터 없음:', {
        success: response.success,
        hasData: !!response.data,
        msg: response.msg,
      })
      return (
        <HomeLayout isLoggedIn={true}>
          <PageHeader
            title="내 정보"
            description="프로필 정보와 활동 내역을 확인하세요"
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

    const user = response.data
    console.log('✅ 사용자 데이터:', user)

    // 알림 개수 가져오기 (현재는 0으로 설정, 추후 API 연동)
    const notificationCount = 0

    return (
      <HomeLayout
        isLoggedIn={true}
        user={user}
        notificationCount={notificationCount}
      >
        <PageHeader
          title="내 정보"
          description="프로필 정보와 활동 내역을 확인하세요"
          showBackButton
        />
        <MyInfoClient user={user} />
      </HomeLayout>
    )
  } catch (error: any) {
    console.error('MyInfo 페이지 에러:', error)

    return (
      <HomeLayout isLoggedIn={true}>
        <PageHeader
          title="내 정보"
          description="프로필 정보와 활동 내역을 확인하세요"
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
}
