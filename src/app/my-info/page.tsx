import { MyInfoClient } from '@/components/features/user/MyInfoClient'
import { HomeLayout } from '@/components/layout/HomeLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { authApi } from '@/lib/api'

export default async function MyInfoPage() {
  // 사용자 정보 가져오기
  const { data: user, success } = await authApi.getProfile()

  if (!success || !user) {
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

  return (
    <HomeLayout isLoggedIn={true} user={user}>
      <PageHeader
        title="내 정보"
        description="프로필 정보와 활동 내역을 확인하세요"
        showBackButton
      />
      <MyInfoClient user={user} />
    </HomeLayout>
  )
}
