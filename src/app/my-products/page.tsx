import { LoginPrompt } from '@/components/auth/LoginPrompt'
import { MyProductsClient } from '@/components/features/products/MyProductsClient'
import { HomeLayout } from '@/components/layout/HomeLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { productApi } from '@/lib/api'

export default async function MyProductsPage() {
  try {
    // 내 상품 데이터 가져오기
    const { data: products, success } = await productApi.getMyProducts()

    if (!success) {
      return (
        <HomeLayout isLoggedIn={true}>
          <PageHeader
            title="내 상품 관리"
            description="등록한 상품을 관리하고 판매 현황을 확인하세요"
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
          title="내 상품 관리"
          description="등록한 상품을 관리하고 판매 현황을 확인하세요"
          showBackButton
          rightAction={
            <a
              href="/register-product"
              className="bg-primary-500 hover:bg-primary-600 inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
            >
              + 새 상품 등록
            </a>
          }
        />
        <MyProductsClient initialProducts={products || []} />
      </HomeLayout>
    )
  } catch (error: any) {
    // 403 에러 시 로그인 유도 UI 표시
    if (error?.response?.status === 403) {
      return (
        <HomeLayout>
          <PageHeader
            title="내 상품 관리"
            description="등록한 상품을 관리하고 판매 현황을 확인하세요"
            showBackButton
          />
          <LoginPrompt
            title="내 상품 관리"
            description="내 상품을 확인하려면 로그인해주세요."
          />
        </HomeLayout>
      )
    }

    // 기타 에러 시 빈 데이터로 렌더링
    return (
      <HomeLayout isLoggedIn={true}>
        <PageHeader
          title="내 상품 관리"
          description="등록한 상품을 관리하고 판매 현황을 확인하세요"
          showBackButton
          rightAction={
            <a
              href="/register-product"
              className="bg-primary-500 hover:bg-primary-600 inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
            >
              + 새 상품 등록
            </a>
          }
        />
        <MyProductsClient initialProducts={[]} />
      </HomeLayout>
    )
  }
}
