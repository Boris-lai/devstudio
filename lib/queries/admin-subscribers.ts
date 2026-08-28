// 只能在 server 端用：createClient() 走 next/headers 的 cookies()。
import { requireAdmin } from "@/lib/auth/is-admin"
import { createClient } from "@/lib/supabase/server"
import type { Tables } from "@/types/database.types"

export type AdminSubscriber = Tables<"subscribers">

/**
 * 模板下載的 email 名單。
 *
 * 依 created_at 由新到舊，跟詢價收件匣一致：最新的訂閱在最上面。
 *
 * subscribers 的 RLS 是「任何人可 insert、只有 admin 可讀」，
 * requireAdmin() 是貼著資料源的那一層，不是唯一一層 ——
 * (admin)/layout.tsx 擋 UX、RLS 擋最後一關。理由見 lib/auth/is-admin.ts。
 */
export async function getAdminSubscribers(): Promise<AdminSubscriber[]> {
  await requireAdmin()

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("subscribers")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(`讀取名單失敗：${error.message}`)
  }

  return data
}
