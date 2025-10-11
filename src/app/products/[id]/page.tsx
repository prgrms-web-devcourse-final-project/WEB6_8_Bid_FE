import { ProductDetailClient } from '@/components/features/products/ProductDetailClient'
import { productApi } from '@/lib/api'
import { notFound } from 'next/navigation'

interface ProductDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params
  const productId = parseInt(id)

  if (isNaN(productId)) {
    notFound()
  }

  try {
    const response = await productApi.getProduct(productId)

    if (!response.success || !response.data) {
      notFound()
    }

    return <ProductDetailClient product={response.data} />
  } catch (error) {
    console.error('상품 조회 실패:', error)
    notFound()
  }
}
