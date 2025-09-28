import { PostWriteClient } from '@/components/features/posts/PostWriteClient'
import { HomeLayout } from '@/components/layout/HomeLayout'
import { PageHeader } from '@/components/layout/PageHeader'

export default function PostWritePage() {
  return (
    <HomeLayout isLoggedIn={true}>
      <PageHeader
        title="공지사항 작성"
        description="중요한 공지사항을 작성하세요"
        showBackButton
        backHref="/posts"
      />
      <PostWriteClient />
    </HomeLayout>
  )
}
