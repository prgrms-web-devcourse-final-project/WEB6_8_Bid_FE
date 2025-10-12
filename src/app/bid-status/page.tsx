import { LoginPrompt } from '@/components/auth/LoginPrompt'
import { BidStatusClient } from '@/components/features/bids/BidStatusClient'
import { HomeLayout } from '@/components/layout/HomeLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { serverApi } from '@/lib/api/server-api-client'
import { cookies } from 'next/headers'

export default async function BidStatusPage() {
  try {
    // 쿠키에서 토큰 가져오기
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')?.value

    if (!accessToken) {
      return (
        <HomeLayout>
          <PageHeader
            title="입찰 현황"
            description="내가 참여한 경매의 현황을 확인하세요"
            showBackButton
          />
          <LoginPrompt
            title="입찰 현황"
            description="입찰 내역을 확인하려면 로그인해주세요."
          />
        </HomeLayout>
      )
    }

    // 서버 API로 입찰 현황 데이터 가져오기
    console.log('🔍 서버에서 입찰 현황 조회 시작')
    const response = await serverApi.getMyBids()
    console.log('🔍 서버 API 응답:', response)

    if (!response.success || !response.data) {
      console.log('🔍 서버 API 실패 또는 데이터 없음')
      return (
        <HomeLayout isLoggedIn={true}>
          <PageHeader
            title="입찰 현황"
            description="내가 참여한 경매의 현황을 확인하세요"
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

    // API 응답 데이터 구조에 맞게 변환
    let bids = []
    if (response.data) {
      if (Array.isArray(response.data)) {
        bids = response.data
      } else if (
        response.data.content &&
        Array.isArray(response.data.content)
      ) {
        bids = response.data.content
      } else if (response.data.bids && Array.isArray(response.data.bids)) {
        bids = response.data.bids
      }
    }

    return (
      <HomeLayout isLoggedIn={true}>
        <PageHeader
          title="입찰 현황"
          description="내가 참여한 경매의 현황을 확인하세요"
          showBackButton
        />
        <BidStatusClient initialBids={bids} />
      </HomeLayout>
    )
  } catch (error: any) {
    console.error('BidStatus 페이지 에러:', error)

    // 403 에러 시 로그인 유도 UI 표시
    if (error?.message?.includes('403')) {
      return (
        <HomeLayout>
          <PageHeader
            title="입찰 현황"
            description="내가 참여한 경매의 현황을 확인하세요"
            showBackButton
          />
          <LoginPrompt
            title="입찰 현황"
            description="입찰 내역을 확인하려면 로그인해주세요."
          />
        </HomeLayout>
      )
    }

    // 기타 에러 시 빈 데이터로 렌더링
    return (
      <HomeLayout isLoggedIn={true}>
        <PageHeader
          title="입찰 현황"
          description="내가 참여한 경매의 현황을 확인하세요"
          showBackButton
        />
        <BidStatusClient initialBids={[]} />
      </HomeLayout>
    )
  }
}
