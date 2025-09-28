import { PurchaseHistoryClient } from '@/components/features/purchase/PurchaseHistoryClient'
import { HomeLayout } from '@/components/layout/HomeLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { paymentApi } from '@/lib/api'

export default async function PurchaseHistoryPage() {
  // 구매 내역 데이터 가져오기
  const { data: purchases, success } = await paymentApi.getPurchaseHistory()

  if (!success || !purchases) {
    return (
      <HomeLayout isLoggedIn={true}>
        <PageHeader
          title="구매 내역"
          description="낙찰 받은 상품의 구매 내역을 확인하세요"
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
        title="구매 내역"
        description="낙찰 받은 상품의 구매 내역을 확인하세요"
        showBackButton
      />
      <PurchaseHistoryClient initialPurchases={purchases} />
    </HomeLayout>
  )
}
