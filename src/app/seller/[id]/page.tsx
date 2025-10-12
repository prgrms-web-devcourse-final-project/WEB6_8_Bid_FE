import { SellerDetailClient } from '@/components/features/seller/SellerDetailClient'
import { HomeLayout } from '@/components/layout/HomeLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { serverApi } from '@/lib/api/server-api-client'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'

interface SellerDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function SellerDetailPage({
  params,
}: SellerDetailPageProps) {
  try {
    const { id } = await params
    const sellerId = parseInt(id)

    if (isNaN(sellerId)) {
      notFound()
    }

    // 쿠키에서 토큰 가져오기
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')?.value

    // 서버 API로 판매자 정보 가져오기 (임시로 상품 API 사용)
    // 실제로는 판매자 전용 API가 필요할 수 있음
    const response = await serverApi.getProducts({ page: 1, size: 100 })

    if (!response.success || !response.data) {
      notFound()
    }

    // 임시로 첫 번째 상품의 판매자 정보를 사용
    const data = response.data as any
    let products = []
    if (Array.isArray(data)) {
      products = data
    } else if (data.content && Array.isArray(data.content)) {
      products = data.content
    } else if (data.products && Array.isArray(data.products)) {
      products = data.products
    }

    // 해당 판매자의 상품들 필터링
    const sellerProducts = products.filter(
      (product: any) =>
        product.seller?.id === sellerId || product.sellerId === sellerId,
    )

    // 판매자 정보 추출 (첫 번째 상품에서)
    const sellerInfo = sellerProducts[0]?.seller || {
      id: sellerId,
      name: '판매자',
      email: '',
      phone: '',
      profileImage: null,
      trustScore: 0,
      reviewCount: 0,
      joinDate: '',
      isVerified: false,
    }

    console.log('판매자 정보:', sellerInfo)
    console.log('판매자 상품들:', sellerProducts)

    return (
      <HomeLayout isLoggedIn={!!accessToken}>
        <PageHeader
          title="판매자 정보"
          description="판매자의 상세 정보와 판매 상품을 확인하세요"
          showBackButton
        />
        <SellerDetailClient seller={sellerInfo} products={sellerProducts} />
      </HomeLayout>
    )
  } catch (error) {
    console.error('판매자 정보 조회 실패:', error)
    notFound()
  }
}

