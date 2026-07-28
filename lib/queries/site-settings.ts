// 這一層只能在 server 端用：createClient() 走 next/headers 的 cookies()。
import { createClient } from "@/lib/supabase/server"
import type { Tables } from "@/types/database.types"

export type SiteSettings = Tables<"site_settings">

/**
 * 讀站台設定。這是單列表（id 固定為 1），目前只用到 accepting_work
 * 來驅動首頁的接案狀態 badge。
 *
 * 查無資料回傳 null，由呼叫端決定怎麼呈現 —— 與其猜一個狀態顯示，
 * 不如整個 badge 不出現，免得對外掛錯「開放接案」。
 */
export async function getSiteSettings(): Promise<SiteSettings | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle()

  if (error) {
    throw new Error(`讀取站台設定失敗：${error.message}`)
  }

  return data
}
