import { LoginPrompt } from '@/components/auth/LoginPrompt'
import { BidStatusClient } from '@/components/features/bids/BidStatusClient'
import { HomeLayout } from '@/components/layout/HomeLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { serverApi } from '@/lib/api/server-api-client'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

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

    // API 응답이 실패해도 클라이언트에서 재시도할 수 있도록 빈 배열로 전달
    let bids: any[] = []
    if (response.success && response.data) {
      const data = response.data as any
      if (Array.isArray(data)) {
        bids = data
      } else if (data.content && Array.isArray(data.content)) {
        bids = data.content
      } else if (data.bids && Array.isArray(data.bids)) {
        bids = data.bids
      }
    }

    console.log('🔍 파싱된 입찰 데이터:', bids)

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

    // 401/403 에러 시 로그인 유도 UI 표시
    if (error?.message?.includes('403') || error?.message?.includes('401')) {
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

    // 기타 에러 시에도 로그인된 상태로 빈 데이터 렌더링 (클라이언트에서 재시도)
    console.log('🔍 에러 발생, 빈 데이터로 렌더링')
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
