import { QnAWriteClient } from '@/components/features/qna/QnAWriteClient'
import { HomeLayout } from '@/components/layout/HomeLayout'
import { PageHeader } from '@/components/layout/PageHeader'

export default function QnAWritePage() {
  return (
    <HomeLayout isLoggedIn={true}>
      <PageHeader
        title="질문 작성"
        description="궁금한 점을 질문해주세요"
        showBackButton
        backHref="/qna"
      />
      <QnAWriteClient />
    </HomeLayout>
  )
}
