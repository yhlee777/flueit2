import type React from "react"
import type { Metadata, Viewport } from "next"
import { Suspense } from "react"
import { CampaignProvider } from "@/lib/campaign-store"
import { ConditionalBottomNavigation } from "@/components/conditional-bottom-navigation"
import { Providers } from "./providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "잇다 (It-da) - 인플루언서 광고주 매칭",
  description: "인플루언서와 광고주를 연결하는 플랫폼",
  generator: "v0.app",
}

export const viewport: Viewport = {
  width: "device-width",
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
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className="font-sans antialiased">
        <Providers>
          {/* ✅ ApprovalChecker 제거됨 - 자동 승인으로 변경 */}
          <CampaignProvider>
            <Suspense fallback={null}>{children}</Suspense>
            <ConditionalBottomNavigation />
          </CampaignProvider>
        </Providers>
      </body>
    </html>
  )
}
