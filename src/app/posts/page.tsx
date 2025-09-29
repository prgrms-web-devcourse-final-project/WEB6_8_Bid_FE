import { PostsClient } from '@/components/features/posts/PostsClient'
import { HomeLayout } from '@/components/layout/HomeLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { boardApi } from '@/lib/api'

export default async function PostsPage() {
  try {
    // 공지사항 데이터 가져오기
    const { data: posts, success } = await boardApi.getPosts({
      boardType: 'NOTICE',
      page: 1,
      size: 20,
    })

    if (!success || !posts) {
      return (
        <HomeLayout>
          <PageHeader
            title="게시판"
            description="공지사항과 자주 묻는 질문을 확인하세요"
            showBackButton
          />
          <PostsClient initialPosts={[]} />
        </HomeLayout>
      )
    }

    return (
      <HomeLayout>
        <PageHeader
          title="게시판"
          description="공지사항과 자주 묻는 질문을 확인하세요"
          showBackButton
        />
        <PostsClient initialPosts={posts} />
      </HomeLayout>
    )
  } catch (error) {
    // 빌드 타임이나 API 에러 시 빈 데이터로 렌더링
    return (
      <HomeLayout>
        <PageHeader
          title="게시판"
          description="공지사항과 자주 묻는 질문을 확인하세요"
          showBackButton
        />
        <PostsClient initialPosts={[]} />
      </HomeLayout>
    )
  }
}
