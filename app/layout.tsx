import type { Metadata } from "next";
import { Noto_Sans_Mono, Noto_Sans_TC } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const notoSansTC = Noto_Sans_TC({
  variable: "--font-sans",
  subsets: ["latin"],
});

// 日期、mono 小標、inline code、程式碼區塊都用這套（DESIGN.md 第 2 節）。
// 這是可變字體，wght 涵蓋設計要求的 400/500。
const notoSansMono = Noto_Sans_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Boris Lai 的工作室",
    template: "%s | Boris Lai 的工作室",
  },
  description: "接案作品集與技術文章。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
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
  );
}
