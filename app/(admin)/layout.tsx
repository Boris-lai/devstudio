import Link from "next/link"

import { SignOutButton } from "@/components/auth/SignOutButton"
import { requireAdmin } from "@/lib/auth/is-admin"

const NAV_ITEMS = [
  { href: "/admin/posts", label: "文章" },
  { href: "/admin/projects", label: "作品" },
] as const

/**
 * 後台外殼。這裡的權限門是 UX 層：不是 admin 就立刻轉址、不渲染外殼。
 *
 * 但它**不是唯一的防線** —— layout 與 page 並行渲染，且 layout 在群組內的
 * client-side 導航不會重跑。真正的把關在取資料的函式裡（見 requireAdmin()），
 * 最後一道是 RLS。
 */
export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAdmin()

  return (
    // 後台自己一套 chrome，刻意不套公開站的 Header/Footer
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="rounded-md font-mono text-sm tracking-[0.08em] text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              後台
            </Link>

            <nav className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              回網站
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        {children}
      </main>
    </div>
  )
}
