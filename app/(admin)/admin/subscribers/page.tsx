import type { Metadata } from "next"

import { CopyEmailsButton } from "@/components/admin/CopyEmailsButton"
import { formatDateTime } from "@/lib/format"
import { getAdminSubscribers } from "@/lib/queries/admin-subscribers"

export const metadata: Metadata = {
  title: "名單",
  robots: { index: false, follow: false },
}

/**
 * 模板下載換來的 email 名單。唯讀 —— 沒有編輯也沒有刪除，
 * 那需要新增 delete 政策，這一版不動 RLS。
 *
 * 用表格而不是卡片（詢價頁是卡片）：這裡每列只有 email 與時間兩個短欄位，
 * 表格能一眼掃完幾百列，卡片會把同樣的資訊拉長十倍。
 */
export default async function AdminSubscribersPage() {
  const subscribers = await getAdminSubscribers()
  const emails = subscribers.map((subscriber) => subscriber.email)

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">名單</h1>
          <p className="text-sm text-muted-foreground">
            共 {subscribers.length} 筆，新到舊。來自 /template 的模板下載。
          </p>
        </div>

        <CopyEmailsButton emails={emails} />
      </header>

      {subscribers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">還沒有人留下 Email。</p>
        </div>
      ) : (
        // overflow-x-auto：窄螢幕時讓表格自己橫向捲，不要把整頁撐出去
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 font-mono text-xs font-medium tracking-[0.08em] text-muted-foreground">
                  EMAIL
                </th>
                <th className="px-5 py-3 font-mono text-xs font-medium tracking-[0.08em] text-muted-foreground">
                  時間
                </th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((subscriber) => {
                const joinedAt = formatDateTime(subscriber.created_at)

                return (
                  <tr
                    key={subscriber.id}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-5 py-3">
                      {/* break-all：email 沒有可斷行的空白，長網域在窄螢幕會撐爛版面 */}
                      <a
                        href={`mailto:${subscriber.email}`}
                        className="rounded-md font-mono text-xs break-all text-primary transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                      >
                        {subscriber.email}
                      </a>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      {joinedAt ? (
                        <time
                          dateTime={subscriber.created_at}
                          className="font-mono text-xs text-muted-foreground"
                        >
                          {joinedAt}
                        </time>
                      ) : null}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
