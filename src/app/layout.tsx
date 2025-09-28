import type { Metadata, Viewport } from 'next'
import { Noto_Sans_KR } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/main-header'
import Footer from '@/components/layout/footer'

const notoSansKR = Noto_Sans_KR({
  variable: '--font-noto-sans-kr',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'TrainUs',
  description: 'TrainUs는 지역 기반의 운동 메이트/트레이너 매칭 플랫폼입니다.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ko-KR"
      className={`${notoSansKR.variable} ${notoSansKR.className} antialiased`}
    >
      <head>
        <meta property="og:title" content="TrainUs" />
        <meta
          property="og:description"
          content="TrainUs는 지역 기반의 운동 메이트/트레이너 매칭 플랫폼입니다."
        />
        <meta property="og:image:alt" content="TrainUs" />
        <meta property="og:image:type" content="image/png" />
        {/* <meta
          property="og:image"
          content="https://ockzfqnjzylkevsdlyfi.supabase.co/storage/v1/object/public/public_file/logos/opengraph-image.png"
        /> */}
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <script src="https://js.tosspayments.com/v1"></script>
      </head>
      <body className="font-noto-sans-kr">
        <div className="flex min-h-screen flex-col">
          <Header isAdmin={true} isInstructor={true} />
          <main className="w-full bg-gradient-to-br from-[#D4E3FF]/30 via-white to-[#E1D8FB]/30 p-6">
            {/* 배경 장식 요소 */}
            <div className="pointer-events-none fixed top-24 left-[-50px] h-48 w-48 rounded-full bg-gradient-to-r from-blue-100/30 to-purple-100/30 blur-3xl" />
            <div className="pointer-events-none fixed top-72 right-[-80px] h-36 w-36 rounded-full bg-gradient-to-r from-purple-100/20 to-blue-100/20 blur-3xl" />
            <div className="mx-auto min-h-screen w-full max-w-7xl">
              {children}
            </div>
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
