import Link from "next/link"

import { Nav } from "@/components/layout/Nav"
import { ThemeToggle } from "@/components/layout/ThemeToggle"

export function Header() {
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
        </div>
      </div>
    </header>
  )
}
