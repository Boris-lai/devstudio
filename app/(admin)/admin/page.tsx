import type { Metadata } from "next"
import Link from "next/link"

import { getAdminStats } from "@/lib/queries/admin-stats"

export const metadata: Metadata = {
  title: "後台",
  // 後台不該被索引
  robots: { index: false, follow: false },
}

/**
 * 統計磚。刻意不做 delta 與 sparkline —— 目前沒有歷史資料可比較，
 * 硬做只會是裝飾。
 *
 * 數值用比例數字（不加 tabular-nums）：tabular 會把每個數字撐成 0 的寬度，
 * 大字級下看起來會鬆散。tabular 是留給需要垂直對齊的表格欄位。
 */
function StatTile({
  label,
  value,
  href,
}: {
  label: string
  value: number
  href?: string
}) {
  const body = (
    <>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-3xl leading-none font-semibold">
        {value.toLocaleString("zh-TW")}
      </p>
    </>
  )

  const className =
    "flex flex-col gap-2 rounded-xl border border-border bg-card p-6"

  // href 是選用的：沒給就維持純數字磚，不要長得像可以點。
  if (!href) {
    return <div className={className}>{body}</div>
  }

  return (
    <Link
      href={href}
      className={`${className} transition-colors hover:border-primary/40 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none`}
    >
      {body}
    </Link>
  )
}

export default async function AdminDashboardPage() {
  const stats = await getAdminStats()

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">總覽</h1>
        <p className="text-sm text-muted-foreground">
          目前站上的內容數量。計數包含未發布的項目。
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5.5 sm:grid-cols-3">
        <StatTile label="文章" value={stats.posts} />
        <StatTile label="作品" value={stats.projects} />
        <StatTile
          label="詢價"
          value={stats.inquiries}
          href="/admin/inquiries"
        />
      </div>
    </div>
  )
}
