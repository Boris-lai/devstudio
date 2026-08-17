import Link from "next/link"

import { MobileNav } from "@/components/layout/MobileNav"
import { Nav } from "@/components/layout/Nav"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { Button } from "@/components/ui/button"

/**
 * authSlot 由 (site)/layout.tsx 這個 server component 算好後傳進來，
 * Header 本身不碰 auth 狀態，維持單純的版面組裝。
 *
 * md 以下只留「品牌 + 取得報價 + 主題 + 漢堡」四樣：
 * 導覽項目與登入都收進 MobileNav 的抽屜，390px 才不會擠到換行。
 */
export function Header({ authSlot }: { authSlot?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="rounded-md text-base font-semibold tracking-tight whitespace-nowrap focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {/* 全名在 390px 會被擠成三行，手機版改用短名 */}
          <span className="md:hidden">Boris Dev</span>
          <span className="hidden md:inline">Boris Lai 的工作室</span>
        </Link>

        <div className="flex items-center gap-1">
          <Nav className="hidden md:flex" />

          {/* 全站唯一常駐的 CTA，手機版也留著 */}
          <Button
            className="mr-1 px-3"
            nativeButton={false}
            render={<Link href="/about#contact">取得報價</Link>}
          />

          <ThemeToggle />

          {authSlot ? (
            <div className="ml-2 hidden items-center border-l border-border pl-3 md:flex">
              {authSlot}
            </div>
          ) : null}

          <MobileNav className="md:hidden" authSlot={authSlot} />
        </div>
      </div>
    </header>
  )
}
