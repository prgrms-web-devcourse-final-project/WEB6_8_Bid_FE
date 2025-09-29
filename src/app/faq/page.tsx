import { FAQClient } from '@/components/features/faq/FAQClient'
import { HomeLayout } from '@/components/layout/HomeLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { boardApi } from '@/lib/api'

export default async function FAQPage() {
  try {
    // FAQ 데이터 가져오기
    const { data: posts, success } = await boardApi.getPosts({
      boardType: 'FAQ',
      page: 1,
      size: 20,
    })

    if (!success || !posts) {
      return (
        <HomeLayout>
          <PageHeader
            title="FAQ"
            description="자주 묻는 질문을 확인하세요"
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
      <HomeLayout>
        <PageHeader
          title="FAQ"
          description="자주 묻는 질문을 확인하세요"
          showBackButton
        />
        <FAQClient initialPosts={posts} />
      </HomeLayout>
    )
  } catch (error) {
    // 빌드 타임이나 API 에러 시 빈 데이터로 렌더링
    return (
      <HomeLayout>
        <PageHeader
          title="FAQ"
          description="자주 묻는 질문을 확인하세요"
          showBackButton
        />
        <FAQClient initialPosts={[]} />
      </HomeLayout>
    )
  }
}
