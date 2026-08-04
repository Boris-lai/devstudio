import type { Metadata } from "next"

import { formatDateTime } from "@/lib/format"
import { getAdminInquiries } from "@/lib/queries/admin-inquiries"

export const metadata: Metadata = {
  title: "詢價收件匣",
  robots: { index: false, follow: false },
}

/**
 * 唯讀的詢價收件匣：沒有編輯、沒有刪除，也沒有已讀狀態
 * —— 那需要 schema 加欄位，這一版不動 schema/RLS。
 *
 * 用卡片而不是表格：message 是自由文字，可能好幾段，
 * 塞進表格欄位不是被截斷就是把整列撐爛。
 */
export default async function AdminInquiriesPage() {
  const inquiries = await getAdminInquiries()

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">詢價</h1>
        <p className="text-sm text-muted-foreground">
          共 {inquiries.length} 筆，新到舊。點 email 可直接回信。
        </p>
      </header>

      {inquiries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">還沒有任何詢價。</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {inquiries.map((inquiry) => {
            const submittedAt = formatDateTime(inquiry.created_at)

            return (
              <li
                key={inquiry.id}
                className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                  <div className="flex min-w-0 flex-col gap-1">
                    <p className="font-medium">{inquiry.name}</p>
                    {/*
                      break-all：email 沒有可斷行的空白，長網域在窄螢幕會把卡片撐出去。
                    */}
                    <a
                      href={`mailto:${inquiry.email}`}
                      className="rounded-md font-mono text-xs break-all text-primary transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                      {inquiry.email}
                    </a>
                  </div>

                  {submittedAt ? (
                    <time
                      dateTime={inquiry.created_at}
                      className="font-mono text-xs whitespace-nowrap text-muted-foreground"
                    >
                      {submittedAt}
                    </time>
                  ) : null}
                </div>

                {/* 表單裡怎麼換行就怎麼顯示，不要全部併成一大段 */}
                <p className="text-sm leading-[1.85] whitespace-pre-wrap">
                  {inquiry.message}
                </p>

                {inquiry.source ? (
                  <p className="border-t border-border pt-3 font-mono text-xs text-muted-foreground">
                    來源：{inquiry.source}
                  </p>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
