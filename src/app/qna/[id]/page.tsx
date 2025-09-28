import { QnADetailClient } from '@/components/features/qna/QnADetailClient'
import { HomeLayout } from '@/components/layout/HomeLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { boardApi } from '@/lib/api'

interface Props {
  params: { id: string }
}

export default async function QnADetailPage({ params }: Props) {
  // Q&A 상세 데이터 가져오기
  const { data: post, success } = await boardApi.getPost(params.id)

  if (!success || !post) {
    return (
      <HomeLayout>
        <PageHeader
          title="Q&A"
          description="궁금한 점을 질문하고 답변을 받아보세요"
          showBackButton
          backHref="/qna"
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
        backHref="/qna"
      />
      <QnADetailClient post={post} />
    </HomeLayout>
  )
}
