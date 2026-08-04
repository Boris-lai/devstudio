// 只能在 server 端用：createClient() 走 next/headers 的 cookies()。
import { requireAdmin } from "@/lib/auth/is-admin"
import { createClient } from "@/lib/supabase/server"
import type { Tables } from "@/types/database.types"

export type AdminInquiry = Tables<"inquiries">

/**
 * 詢價收件匣。整列都要顯示，所以不挑欄位。
 *
 * 依 created_at 由新到舊：收件匣的預設期待就是最新的在最上面。
 *
 * inquiries 的 RLS 是「任何人可 insert、只有 admin 可讀」（ARCHITECTURE.md 第 6 節），
 * requireAdmin() 是貼著資料源的那一層，不是唯一一層 ——
 * (admin)/layout.tsx 擋 UX、RLS 擋最後一關。理由見 lib/auth/is-admin.ts。
 */
export async function getAdminInquiries(): Promise<AdminInquiry[]> {
  await requireAdmin()

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(`讀取詢價列表失敗：${error.message}`)
  }

  return data
}
