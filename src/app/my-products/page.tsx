import { LoginPrompt } from '@/components/auth/LoginPrompt'
import { MyProductsClient } from '@/components/features/products/MyProductsClient'
import { HomeLayout } from '@/components/layout/HomeLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { cookies } from 'next/headers'

export default async function MyProductsPage() {
  try {
    // 쿠키에서 토큰 가져오기
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')?.value

    if (!accessToken) {
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

    // 직접 API 호출 (토큰을 헤더에 포함)
    const response = await fetch('http://localhost:8080/api/v1/products/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 403) {
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
      throw new Error(`API 호출 실패: ${response.status}`)
    }

    const data = await response.json()
    console.log('📊 내 상품 API 응답:', data)

    if (data.resultCode !== '200-1' && data.resultCode !== '200') {
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

    // API 응답 데이터 구조에 맞게 변환
    let products = []
    if (data.data) {
      if (Array.isArray(data.data)) {
        products = data.data
      } else if (data.data.content && Array.isArray(data.data.content)) {
        products = data.data.content
      } else if (data.data.products && Array.isArray(data.data.products)) {
        products = data.data.products
      }
    }

    console.log('📦 처리된 상품 목록:', products)

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
        <MyProductsClient initialProducts={products} />
      </HomeLayout>
    )
  } catch (error: any) {
    console.error('MyProducts 페이지 에러:', error)

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
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-neutral-900">
              페이지를 불러올 수 없습니다
            </h1>
            <p className="text-neutral-600">잠시 후 다시 시도해주세요.</p>
          </div>
        </div>
      </HomeLayout>
    )
  }
}
