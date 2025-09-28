import { BidStatusClient } from '@/components/features/bids/BidStatusClient'
import { HomeLayout } from '@/components/layout/HomeLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { bidApi } from '@/lib/api'

export default async function BidStatusPage() {
  // 입찰 현황 데이터 가져오기
  const { data: bids, success } = await bidApi.getMyBids()

  if (!success || !bids) {
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
}
