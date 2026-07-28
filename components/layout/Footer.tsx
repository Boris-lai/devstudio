import Link from "next/link"

// 佔位連結，之後 Chunk 8（接案轉換件）再換成真的 LINE / Email / 社群連結。
const PLACEHOLDER_LINKS = [
  { href: "/about", label: "關於我" },
  { href: "/work", label: "作品" },
  { href: "/blog", label: "文章" },
] as const

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>© {year} Boris Lai 的工作室. 版權所有。</p>

        <nav className="flex items-center gap-4">
          {PLACEHOLDER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
