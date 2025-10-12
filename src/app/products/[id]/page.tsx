import { ProductDetailClient } from '@/components/features/products/ProductDetailClient'
import { HomeLayout } from '@/components/layout/HomeLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { serverApi } from '@/lib/api/server-api-client'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'

interface ProductDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  try {
    const { id } = await params
    const productId = parseInt(id)

    if (isNaN(productId)) {
      notFound()
    }

    // 쿠키에서 토큰 가져오기
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')?.value

    // 서버 API로 상품 정보 가져오기
    const response = await serverApi.getProduct(productId)

    if (!response.success || !response.data) {
      notFound()
    }

    // 입찰 현황도 서버에서 가져오기
    let bidStatus = null
    try {
      const bidResponse = await serverApi.getMyBids()
      if (bidResponse.success && bidResponse.data) {
        const bids = Array.isArray(bidResponse.data)
          ? bidResponse.data
          : (bidResponse.data as any).content || []
        // 해당 상품의 입찰 현황 찾기
        bidStatus = bids.find((bid: any) => bid.productId === productId) || null
      }
    } catch (error) {
      // 입찰 현황 조회 실패 시 무시
    }

    // API 응답을 컴포넌트에서 사용하는 형식으로 매핑
    const data = response.data as any
    const mappedProduct = {
      id: data.productId || data.id || productId,
      title: data.name || data.title || '상품명 없음',
      description: data.description || '상품 설명이 없습니다.',
      category: data.category || '기타',
      images: data.images || [],
      startingPrice: Number(data.initialPrice || data.startingPrice || 0),
      currentPrice: Number(
        data.currentPrice || data.initialPrice || data.startingPrice || 0,
      ),
      seller: {
        id: data.seller?.id || '1',
        email: data.seller?.email || '',
        name: data.seller?.name || data.sellerName || '판매자',
        phone: data.seller?.phone || '',
        profileImage: data.seller?.profileImage || null,
        trustScore: Number(
          data.seller?.trustScore || data.sellerTrustScore || 0,
        ),
        reviewCount: Number(data.seller?.reviewCount || 0),
        joinDate: data.seller?.joinDate || '',
        isVerified: data.seller?.isVerified || false,
      },
      status: data.status || 'BIDDING',
      location: data.location || data.seller?.location || '위치 정보 없음',
      createdAt: data.createdAt || new Date().toISOString(),
      endTime:
        data.auctionEndTime ||
        data.endTime ||
        data.endDate ||
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7일 후
      bidCount: Number(data.bidderCount || data.bidCount || 0),
      isLiked: data.isLiked || false,
      deliveryMethod: data.deliveryMethod || '직접거래',
      auctionStartTime: data.auctionStartTime,
      auctionEndTime: data.auctionEndTime,
      auctionDuration: data.auctionDuration,
    }

    return (
      <HomeLayout isLoggedIn={!!accessToken}>
        <PageHeader
          title="상품 상세"
          description="상품 정보를 확인하고 입찰에 참여하세요"
          showBackButton
        />
        <ProductDetailClient
          product={mappedProduct as any}
          initialBidStatus={bidStatus}
        />
      </HomeLayout>
    )
  } catch (error) {
    console.error('상품 조회 실패:', error)
    notFound()
  }
}
