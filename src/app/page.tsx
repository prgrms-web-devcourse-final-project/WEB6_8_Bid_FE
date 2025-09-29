import { HomeClient } from '@/components/features/home/HomeClient'
import { HomeLayout } from '@/components/layout/HomeLayout'

export default async function HomePage() {
  // 임시 통계 데이터 (실제 API가 없으므로)
  const stats = {
    activeAuctions: 567,
    endingToday: 23,
    totalParticipants: 8901,
    successRate: 87.5,
  }

  return (
    <HomeLayout>
      <HomeClient stats={stats} />
    </HomeLayout>
  )
}
