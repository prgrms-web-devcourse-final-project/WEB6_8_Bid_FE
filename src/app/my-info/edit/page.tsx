import { LoginPrompt } from '@/components/auth/LoginPrompt'
import { MyInfoEditClient } from '@/components/features/user/MyInfoEditClient'
import { HomeLayout } from '@/components/layout/HomeLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { authApi } from '@/lib/api'

export default async function MyInfoEditPage() {
  try {
    // 사용자 프로필 데이터 가져오기
    const { data: profile, success } = await authApi.getProfile()

    if (!success || !profile) {
      return (
        <HomeLayout isLoggedIn={true}>
          <PageHeader
            title="내 프로필"
            description="프로필 정보와 활동 내역을 확인하세요"
            showBackButton
            backHref="/my-info"
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
          title="내 프로필"
          description="프로필 정보와 활동 내역을 확인하세요"
          showBackButton
          backHref="/my-info"
        />
        <MyInfoEditClient initialProfile={profile} />
      </HomeLayout>
    )
  } catch (error: any) {
    // 403 에러 시 로그인 유도 UI 표시
    if (error?.response?.status === 403) {
      return (
        <HomeLayout>
          <PageHeader
            title="내 프로필"
            description="프로필 정보와 활동 내역을 확인하세요"
            showBackButton
            backHref="/my-info"
          />
          <LoginPrompt
            title="내 프로필"
            description="내 프로필을 수정하려면 로그인해주세요."
          />
        </HomeLayout>
      )
    }

    // 기타 에러 시 빈 데이터로 렌더링
    return (
      <HomeLayout isLoggedIn={true}>
        <PageHeader
          title="내 프로필"
          description="프로필 정보와 활동 내역을 확인하세요"
          showBackButton
          backHref="/my-info"
        />
        <MyInfoEditClient />
      </HomeLayout>
    )
  }
}
