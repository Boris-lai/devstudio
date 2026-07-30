import type { Metadata } from "next"
import { Noto_Sans_Mono, Noto_Sans_TC } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site"

const notoSansTC = Noto_Sans_TC({
  variable: "--font-sans",
  subsets: ["latin"],
})

// 日期、mono 小標、inline code、程式碼區塊都用這套（DESIGN.md 第 2 節）。
// 這是可變字體，wght 涵蓋設計要求的 400/500。
const notoSansMono = Noto_Sans_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  // 有了 metadataBase，各頁的相對 canonical 與 OG 圖才組得出絕對網址
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "接案",
    "全端開發",
    "網站設計",
    "形象官網",
    "企業管理系統",
    "自動化表單",
    "手機 App",
    "Next.js",
    "Supabase",
    "台灣",
  ],
  authors: [{ name: "Boris Lai" }],
  creator: "Boris Lai",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "zh_TW",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // next-themes 會在 hydration 前就把 class 寫到 <html>，
    // suppressHydrationWarning 是官方要求的搭配寫法。
    <html
      lang="zh-Hant-TW"
      suppressHydrationWarning
      className={`${notoSansTC.variable} ${notoSansMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
