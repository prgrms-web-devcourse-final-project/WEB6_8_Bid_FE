import { LoginPrompt } from '@/components/auth/LoginPrompt'
import { MyInfoClient } from '@/components/features/user/MyInfoClient'
import { HomeLayout } from '@/components/layout/HomeLayout'
import { PageHeader } from '@/components/layout/PageHeader'
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

    // 직접 API 호출 (토큰을 헤더에 포함)
    console.log('🚀 API 호출 시작: /api/v1/members/me')
    const response = await fetch('http://localhost:8080/api/v1/members/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    console.log('📊 API 응답 상태:', response.status, response.statusText)

    if (!response.ok) {
      console.log('❌ API 호출 실패:', response.status)
      if (response.status === 403) {
        console.log('🔒 403 에러 - 로그인 유도 UI 표시')
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
      throw new Error(`API 호출 실패: ${response.status}`)
    }

    const data = await response.json()
    console.log('📄 API 응답 데이터:', data)

    // 백엔드 응답 구조에 맞게 수정 (resultCode로 성공 여부 확인)
    if (data.resultCode !== '200-1' || !data.data) {
      console.log('❌ API 응답에서 데이터 없음:', {
        resultCode: data.resultCode,
        hasData: !!data.data,
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

    const user = data.data
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
