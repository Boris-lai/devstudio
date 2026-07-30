// 只能在 server 端用：createClient() 走 next/headers 的 cookies()。
import { redirect } from "next/navigation"
import { cache } from "react"

import { createClient } from "@/lib/supabase/server"

/**
 * 目前使用者是否為 admin。
 *
 * 直接呼叫資料庫的 is_admin()（security definer），與 RLS 政策用的是
 * 同一份定義，避免應用層與資料庫層的判斷漂移。
 *
 * 未登入時 RPC 會回 false，不需要另外先檢查 user。
 * RPC 出錯一律當成「不是 admin」—— 權限判斷失敗時要往安全的方向倒。
 *
 * 用 React 的 cache() 做「單次請求內記憶」：權限門與資料層都會呼叫它，
 * 但每個請求只會真的打一次 RPC。
 */
export const isCurrentUserAdmin = cache(async (): Promise<boolean> => {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("is_admin")

  if (error) return false
  return data === true
})

/**
 * 不是 admin 就導回首頁。
 *
 * **要在「靠近資料來源」的地方呼叫，不能只放在 layout。** 兩個理由：
 *
 * 1. App Router 的 layout 與 page 是**並行渲染**的。只在 layout 檢查時，
 *    page 的查詢已經跑完，Next 回的 307 body 裡會夾帶那份 RSC payload ——
 *    未登入者用 curl 就讀得到後台頁面的內容。（實測驗證過）
 * 2. Next 官方文件也指出，因為 Partial Rendering，layout 在群組內的
 *    client-side 導航**不會重新渲染**，session 因此不會每次都被檢查。
 *
 * 所以 layout 的門是 UX（立刻轉址、不渲染外殼），真正的把關要放在
 * 取資料的函式裡。最後一道防線仍然是 RLS。
 */
export async function requireAdmin(): Promise<void> {
  const isAdmin = await isCurrentUserAdmin()
  if (!isAdmin) redirect("/")
}
