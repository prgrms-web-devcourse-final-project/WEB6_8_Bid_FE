import { FAQWriteClient } from '@/components/features/faq/FAQWriteClient'
import { HomeLayout } from '@/components/layout/HomeLayout'
import { PageHeader } from '@/components/layout/PageHeader'

export default function FAQWritePage() {
  return (
    <HomeLayout isLoggedIn={true}>
      <PageHeader
        title="FAQ 작성"
        description="자주 묻는 질문을 작성하세요"
        showBackButton
        backHref="/faq"
      />
      <FAQWriteClient />
    </HomeLayout>
  )
}
