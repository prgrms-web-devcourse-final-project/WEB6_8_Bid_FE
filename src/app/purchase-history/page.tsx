import { LoginPrompt } from '@/components/auth/LoginPrompt'
import { PurchaseHistoryClient } from '@/components/features/purchase/PurchaseHistoryClient'
import { HomeLayout } from '@/components/layout/HomeLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { paymentApi } from '@/lib/api'

export default async function PurchaseHistoryPage() {
  try {
    // 구매 내역 데이터 가져오기
    const { data: purchases, success } = await paymentApi.getMyPayments()

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
        <PurchaseHistoryClient
          initialPurchases={(purchases?.items as any) || []}
        />
      </HomeLayout>
    )
  } catch (error: any) {
    // 403 에러 시 로그인 유도 UI 표시
    if (error?.response?.status === 403) {
      return (
        <HomeLayout>
          <PageHeader
            title="구매 내역"
            description="낙찰 받은 상품의 구매 내역을 확인하세요"
            showBackButton
          />
          <LoginPrompt
            title="구매 내역"
            description="구매 내역을 확인하려면 로그인해주세요."
          />
        </HomeLayout>
      )
    }

    // 기타 에러 시 빈 데이터로 렌더링
    return (
      <HomeLayout isLoggedIn={true}>
        <PageHeader
          title="구매 내역"
          description="낙찰 받은 상품의 구매 내역을 확인하세요"
          showBackButton
        />
        <PurchaseHistoryClient initialPurchases={[]} />
      </HomeLayout>
    )
  }
}
