// 只能在 server 端用：createClient() 走 next/headers 的 cookies()。
import { requireAdmin } from "@/lib/auth/is-admin"
import { createClient } from "@/lib/supabase/server"

export type AdminStats = {
  posts: number
  projects: number
  inquiries: number
}

/**
 * 後台首頁的計數。
 *
 * 用 head: true + count: "exact" 只取數量、不把資料列拉回來。
 *
 * 三個查詢各自獨立處理錯誤並退回 0 —— 後台首頁不該因為某一張表讀不到
 * 就整頁爆掉。inquiries 的 select 政策限 admin，能讀到是因為呼叫端
 * （(admin)/layout.tsx 的權限門）已經確認過身分，RLS 那側也會再擋一次。
 *
 * 計數包含未發布的內容：admin 的 RLS 政策看得到全部，
 * 而後台要的本來就是總數，不是公開數。
 */
export async function getAdminStats(): Promise<AdminStats> {
  // 權限檢查放在資料層，不能只靠 (admin)/layout.tsx 的門 ——
  // layout 與 page 並行渲染，只擋 layout 的話 page 的查詢結果會夾在
  // 307 回應裡洩漏出去。詳見 requireAdmin() 的註解。
  await requireAdmin()

  const supabase = await createClient()

  const [posts, projects, inquiries] = await Promise.all([
    supabase.from("posts").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("inquiries").select("*", { count: "exact", head: true }),
  ])

  return {
    posts: posts.error ? 0 : (posts.count ?? 0),
    projects: projects.error ? 0 : (projects.count ?? 0),
    inquiries: inquiries.error ? 0 : (inquiries.count ?? 0),
  }
}
