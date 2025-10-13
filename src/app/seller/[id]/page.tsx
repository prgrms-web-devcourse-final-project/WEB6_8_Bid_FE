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

    // 서버 API로 판매자 정보 가져오기
    const response = await serverApi.getProducts({ page: 1, size: 100 })

    if (!response.success || !response.data) {
      notFound()
    }

    // API 응답 데이터 파싱
    const data = response.data as any
    let allProducts = []
    if (Array.isArray(data)) {
      allProducts = data
    } else if (data.content && Array.isArray(data.content)) {
      allProducts = data.content
    } else if (data.products && Array.isArray(data.products)) {
      allProducts = data.products
    }

    console.log('🔍 모든 상품 데이터:', allProducts)
    console.log('🔍 찾는 판매자 ID:', sellerId)

    // 해당 판매자의 상품들 필터링
    const sellerProducts = allProducts.filter((product: any) => {
      const productSellerId = product.seller?.id || product.sellerId
      console.log(
        '🔍 상품 판매자 ID:',
        productSellerId,
        '타입:',
        typeof productSellerId,
      )
      return (
        productSellerId === sellerId || productSellerId === String(sellerId)
      )
    })

    console.log('🔍 필터링된 판매자 상품:', sellerProducts)

    // 상품 데이터를 Product 타입으로 매핑
    const mappedProducts = sellerProducts.map((product: any) => ({
      id: product.productId || product.id,
      title: product.name || product.title,
      description: product.description || '',
      category: product.category,
      startingPrice: product.initialPrice || product.startingPrice,
      currentPrice: product.currentPrice,
      endTime: product.auctionEndTime || product.endTime,
      status: product.status || 'BIDDING',
      images: product.thumbnailUrl
        ? [product.thumbnailUrl]
        : product.images || [],
      thumbnailUrl: product.thumbnailUrl || '',
      seller: {
        id: String(product.seller?.id || product.sellerId || '1'),
        email: product.seller?.email || '',
        name: product.seller?.nickname || product.seller?.name || '판매자',
        phone: product.seller?.phone || '',
        profileImage:
          product.seller?.profileImageUrl || product.seller?.profileImage,
        trustScore:
          product.seller?.creditScore || product.seller?.trustScore || 0,
        reviewCount: product.seller?.reviewCount || 0,
        joinDate: product.seller?.joinDate || '',
        isVerified: product.seller?.isVerified || false,
      },
      location: product.location || '',
      createdAt: product.createdAt || '',
      bidCount: product.bidderCount || product.bidCount || 0,
      isLiked: product.isLiked || false,
    }))

    // 판매자 정보 추출 - 더 나은 기본값 설정
    const sellerInfo = sellerProducts[0]?.seller
      ? {
          id: String(sellerProducts[0].seller.id || sellerId),
          name:
            sellerProducts[0].seller.nickname ||
            sellerProducts[0].seller.name ||
            '판매자',
          email: sellerProducts[0].seller.email || '',
          phone: sellerProducts[0].seller.phone || '',
          profileImage:
            sellerProducts[0].seller.profileImageUrl ||
            sellerProducts[0].seller.profileImage ||
            null,
          trustScore:
            sellerProducts[0].seller.creditScore ||
            sellerProducts[0].seller.trustScore ||
            75, // 기본 신뢰도 점수
          reviewCount: sellerProducts[0].seller.reviewCount || 0,
          joinDate: sellerProducts[0].seller.joinDate || '',
          isVerified: sellerProducts[0].seller.isVerified || false,
        }
      : {
          id: String(sellerId),
          name: '판매자',
          email: '',
          phone: '',
          profileImage: null,
          trustScore: 75, // 기본 신뢰도 점수
          reviewCount: 0,
          joinDate: '',
          isVerified: false,
        }

    console.log('🔍 매핑된 상품 데이터:', mappedProducts)
    console.log('🔍 판매자 정보:', sellerInfo)

    return (
      <HomeLayout isLoggedIn={!!accessToken}>
        <PageHeader
          title="판매자 정보"
          description="판매자의 상세 정보와 판매 상품을 확인하세요"
          showBackButton
        />
        <SellerDetailClient seller={sellerInfo} products={mappedProducts} />
      </HomeLayout>
    )
  } catch (error) {
    console.error('판매자 정보 조회 실패:', error)
    notFound()
  }
}
