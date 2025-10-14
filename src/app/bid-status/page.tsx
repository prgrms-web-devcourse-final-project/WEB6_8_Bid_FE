import { BidStatusClient } from '@/components/features/bids/BidStatusClient'
import { HomeLayout } from '@/components/layout/HomeLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { serverApi } from '@/lib/api/server-api-client'

export const dynamic = 'force-dynamic'

export default async function BidStatusPage() {
  try {
    const response = await serverApi.getMyBids()

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
