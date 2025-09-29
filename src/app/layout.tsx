import { AuthProvider } from '@/contexts/AuthContext'
import type { Metadata, Viewport } from 'next'
import { Noto_Sans_KR } from 'next/font/google'
import './globals.css'

const notoSansKR = Noto_Sans_KR({
  variable: '--font-noto-sans-kr',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Bid',
  description:
    '실시간 경매로 더 재미있게! 당신의 물건을 경매로 판매하고, 원하는 상품을 경쟁 입찰로 구매해보세요.',
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
        <meta property="og:title" content="Bid" />
        <meta
          property="og:description"
          content="실시간 경매로 더 재미있게! 당신의 물건을 경매로 판매하고, 원하는 상품을 경쟁 입찰로 구매해보세요."
        />
        <meta property="og:image:alt" content="Bid" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <script src="https://js.tosspayments.com/v1"></script>
      </head>
      <body className="font-noto-sans-kr">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
