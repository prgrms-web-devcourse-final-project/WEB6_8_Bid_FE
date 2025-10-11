import { ReviewManagementClient } from '@/components/features/reviews/ReviewManagementClient'
import { HomeLayout } from '@/components/layout/HomeLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { cookies } from 'next/headers'

export default async function MyReviewsPage() {
  try {
    // 쿠키에서 토큰 가져오기
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')?.value

    if (!accessToken) {
      return (
        <HomeLayout>
          <PageHeader
            title="내 리뷰 관리"
            description="작성한 리뷰를 관리하세요"
            showBackButton
          />
          <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="mb-4 text-2xl font-bold text-neutral-900">
                로그인이 필요합니다
              </h1>
              <p className="text-neutral-600">
                리뷰를 관리하려면 로그인해주세요.
              </p>
            </div>
          </div>
        </HomeLayout>
      )
    }

    return (
      <HomeLayout isLoggedIn={true}>
        <PageHeader
          title="내 리뷰 관리"
          description="작성한 리뷰를 관리하세요"
          showBackButton
        />
        <ReviewManagementClient />
      </HomeLayout>
    )
  } catch (error: any) {
    console.error('MyReviews 페이지 에러:', error)

    return (
      <HomeLayout isLoggedIn={true}>
        <PageHeader
          title="내 리뷰 관리"
          description="작성한 리뷰를 관리하세요"
          showBackButton
        />
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-neutral-900">
              페이지를 불러올 수 없습니다
            </h1>
            <p className="text-neutral-600">잠시 후 다시 시도해주세요.</p>
          </div>
        </div>
      </HomeLayout>
    )
  }
}
