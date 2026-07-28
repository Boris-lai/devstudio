import Link from "next/link"

import { Nav } from "@/components/layout/Nav"
import { ThemeToggle } from "@/components/layout/ThemeToggle"

/**
 * authSlot 由 (site)/layout.tsx 這個 server component 算好後傳進來，
 * Header 本身不碰 auth 狀態，維持單純的版面組裝。
 */
export function Header({ authSlot }: { authSlot?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="rounded-md text-base font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Boris Lai 的工作室
        </Link>

        <div className="flex items-center gap-1">
          <Nav />
          <ThemeToggle />
          {authSlot ? (
            <div className="ml-2 flex items-center border-l border-border pl-3">
              {authSlot}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
