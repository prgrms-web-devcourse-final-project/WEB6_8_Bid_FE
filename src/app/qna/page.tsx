import { QnAClient } from '@/components/features/qna/QnAClient'
import { HomeLayout } from '@/components/layout/HomeLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { boardApi } from '@/lib/api'

export default async function QnAPage() {
  try {
    // Q&A 데이터 가져오기
    const { data: posts, success } = await boardApi.getPosts({
      boardType: 'QNA',
      page: 1,
      size: 20,
    })

    if (!success || !posts) {
      return (
        <HomeLayout>
          <PageHeader
            title="Q&A"
            description="궁금한 점을 질문하고 답변을 받아보세요"
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
          title="Q&A"
          description="궁금한 점을 질문하고 답변을 받아보세요"
          showBackButton
        />
        <QnAClient initialPosts={posts} />
      </HomeLayout>
    )
  } catch (error) {
    // 빌드 타임이나 API 에러 시 빈 데이터로 렌더링
    return (
      <HomeLayout>
        <PageHeader
          title="Q&A"
          description="궁금한 점을 질문하고 답변을 받아보세요"
          showBackButton
        />
        <QnAClient initialPosts={[]} />
      </HomeLayout>
    )
  }
}
